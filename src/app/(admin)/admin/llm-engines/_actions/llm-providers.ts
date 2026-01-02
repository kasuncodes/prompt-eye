'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { llmProviders, llmModels, type NewLlmProvider, type LlmProvider, type LlmModel } from '@/db/schema';
import { eq, or, ilike, sql, desc, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { encrypt, decrypt, maskApiKey } from '@/lib/encryption';

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function validateAccess(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' };
  }
  return { success: true };
}

// Provider with masked API key for display
export interface LlmProviderWithMaskedKey extends Omit<LlmProvider, 'encryptedApiKey'> {
  hasApiKey: boolean;
  maskedApiKey?: string;
}

// Provider with models for display
export interface LlmProviderWithModels extends LlmProviderWithMaskedKey {
  models: LlmModel[];
}

interface PaginatedProvidersResult {
  providers: LlmProviderWithModels[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getProvidersPaginated(params: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<PaginatedProvidersResult>> {
  const accessCheck = await validateAccess();
  if (!accessCheck.success) return accessCheck;

  const page = Math.max(1, params.page || 1);
  const pageSize = [10, 25, 50].includes(params.pageSize || 10) ? params.pageSize || 10 : 10;
  const offset = (page - 1) * pageSize;
  const search = params.search?.trim() || '';

  try {
    const searchCondition = search
      ? or(
          ilike(llmProviders.name, `%${search}%`),
          ilike(llmProviders.displayName, `%${search}%`)
        )
      : undefined;

    const [providers, countResult] = await Promise.all([
      db
        .select()
        .from(llmProviders)
        .where(searchCondition)
        .orderBy(desc(llmProviders.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(llmProviders)
        .where(searchCondition),
    ]);

    // Fetch models for all providers
    const providerIds = providers.map((p) => p.id);
    const models =
      providerIds.length > 0
        ? await db
            .select()
            .from(llmModels)
            .where(inArray(llmModels.providerId, providerIds))
            .orderBy(desc(llmModels.createdAt))
        : [];

    // Map providers with masked keys and their models
    const providersWithModels: LlmProviderWithModels[] = providers.map((provider) => {
      const providerModels = models.filter((m) => m.providerId === provider.id);
      const { encryptedApiKey, ...rest } = provider;

      let maskedApiKey: string | undefined;
      if (encryptedApiKey) {
        try {
          const decrypted = decrypt(encryptedApiKey);
          maskedApiKey = maskApiKey(decrypted);
        } catch {
          maskedApiKey = '••••••••';
        }
      }

      return {
        ...rest,
        hasApiKey: !!encryptedApiKey,
        maskedApiKey,
        models: providerModels,
      };
    });

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      data: {
        providers: providersWithModels,
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Failed to fetch LLM providers:', error);
    return { success: false, error: 'Failed to fetch LLM providers' };
  }
}

export async function createProvider(
  data: Pick<NewLlmProvider, 'name' | 'displayName' | 'logoUrl'> & { apiKey?: string }
): Promise<ActionResult<LlmProvider>> {
  const accessCheck = await validateAccess();
  if (!accessCheck.success) return accessCheck;

  if (!data.name?.trim()) {
    return { success: false, error: 'Name is required' };
  }
  if (!data.displayName?.trim()) {
    return { success: false, error: 'Display name is required' };
  }

  try {
    const existing = await db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.name, data.name.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: 'A provider with this name already exists' };
    }

    const encryptedApiKey = data.apiKey ? encrypt(data.apiKey) : null;

    const [newProvider] = await db
      .insert(llmProviders)
      .values({
        name: data.name.toLowerCase().trim(),
        displayName: data.displayName.trim(),
        logoUrl: data.logoUrl?.trim() || null,
        encryptedApiKey,
      })
      .returning();

    revalidatePath('/admin/llm-engines');
    return { success: true, data: newProvider };
  } catch (error) {
    console.error('Failed to create LLM provider:', error);
    return { success: false, error: 'Failed to create LLM provider' };
  }
}

export async function updateProvider(
  id: string,
  data: Pick<NewLlmProvider, 'displayName' | 'logoUrl'> & {
    apiKey?: string;
    clearApiKey?: boolean;
  }
): Promise<ActionResult<LlmProvider>> {
  const accessCheck = await validateAccess();
  if (!accessCheck.success) return accessCheck;

  if (!data.displayName?.trim()) {
    return { success: false, error: 'Display name is required' };
  }

  try {
    const existing = await db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.id, id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: 'Provider not found' };
    }

    const updateData: Partial<NewLlmProvider> & { updatedAt: Date } = {
      displayName: data.displayName.trim(),
      logoUrl: data.logoUrl?.trim() || null,
      updatedAt: new Date(),
    };

    // Handle API key update
    if (data.clearApiKey) {
      updateData.encryptedApiKey = null;
    } else if (data.apiKey) {
      updateData.encryptedApiKey = encrypt(data.apiKey);
    }

    const [updatedProvider] = await db
      .update(llmProviders)
      .set(updateData)
      .where(eq(llmProviders.id, id))
      .returning();

    revalidatePath('/admin/llm-engines');
    return { success: true, data: updatedProvider };
  } catch (error) {
    console.error('Failed to update LLM provider:', error);
    return { success: false, error: 'Failed to update LLM provider' };
  }
}

export async function deleteProvider(id: string): Promise<ActionResult> {
  const accessCheck = await validateAccess();
  if (!accessCheck.success) return accessCheck;

  try {
    const existing = await db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.id, id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: 'Provider not found' };
    }

    await db.delete(llmProviders).where(eq(llmProviders.id, id));

    revalidatePath('/admin/llm-engines');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete LLM provider:', error);
    return { success: false, error: 'Failed to delete LLM provider' };
  }
}

export async function revealApiKey(providerId: string): Promise<ActionResult<string>> {
  const accessCheck = await validateAccess();
  if (!accessCheck.success) return accessCheck;

  try {
    const [provider] = await db
      .select({ encryptedApiKey: llmProviders.encryptedApiKey })
      .from(llmProviders)
      .where(eq(llmProviders.id, providerId))
      .limit(1);

    if (!provider) {
      return { success: false, error: 'Provider not found' };
    }

    if (!provider.encryptedApiKey) {
      return { success: false, error: 'No API key configured' };
    }

    const decrypted = decrypt(provider.encryptedApiKey);
    return { success: true, data: decrypted };
  } catch (error) {
    console.error('Failed to reveal API key:', error);
    return { success: false, error: 'Failed to reveal API key' };
  }
}
