'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { llmModels, type NewLlmModel, type LlmModel } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { auth } from '@/lib/auth';

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

export async function createModel(
  data: Pick<NewLlmModel, 'providerId' | 'modelId' | 'displayName' | 'inputCostPer1k' | 'outputCostPer1k'>
): Promise<ActionResult<LlmModel>> {
  const accessCheck = await validateAccess();
  if (!accessCheck.success) return accessCheck;

  if (!data.providerId) {
    return { success: false, error: 'Provider is required' };
  }
  if (!data.modelId?.trim()) {
    return { success: false, error: 'Model ID is required' };
  }
  if (!data.displayName?.trim()) {
    return { success: false, error: 'Display name is required' };
  }

  try {
    // Check for duplicate model ID within the same provider
    const existing = await db
      .select()
      .from(llmModels)
      .where(
        and(
          eq(llmModels.providerId, data.providerId),
          eq(llmModels.modelId, data.modelId.trim())
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: 'A model with this ID already exists for this provider' };
    }

    const [newModel] = await db
      .insert(llmModels)
      .values({
        providerId: data.providerId,
        modelId: data.modelId.trim(),
        displayName: data.displayName.trim(),
        inputCostPer1k: data.inputCostPer1k || null,
        outputCostPer1k: data.outputCostPer1k || null,
        isActive: false,
      })
      .returning();

    revalidatePath('/admin/llm-engines');
    return { success: true, data: newModel };
  } catch (error) {
    console.error('Failed to create LLM model:', error);
    return { success: false, error: 'Failed to create LLM model' };
  }
}

export async function updateModel(
  id: string,
  data: Pick<NewLlmModel, 'displayName' | 'inputCostPer1k' | 'outputCostPer1k'>
): Promise<ActionResult<LlmModel>> {
  const accessCheck = await validateAccess();
  if (!accessCheck.success) return accessCheck;

  if (!data.displayName?.trim()) {
    return { success: false, error: 'Display name is required' };
  }

  try {
    const existing = await db
      .select()
      .from(llmModels)
      .where(eq(llmModels.id, id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: 'Model not found' };
    }

    const [updatedModel] = await db
      .update(llmModels)
      .set({
        displayName: data.displayName.trim(),
        inputCostPer1k: data.inputCostPer1k || null,
        outputCostPer1k: data.outputCostPer1k || null,
        updatedAt: new Date(),
      })
      .where(eq(llmModels.id, id))
      .returning();

    revalidatePath('/admin/llm-engines');
    return { success: true, data: updatedModel };
  } catch (error) {
    console.error('Failed to update LLM model:', error);
    return { success: false, error: 'Failed to update LLM model' };
  }
}

export async function deleteModel(id: string): Promise<ActionResult> {
  const accessCheck = await validateAccess();
  if (!accessCheck.success) return accessCheck;

  try {
    const existing = await db
      .select()
      .from(llmModels)
      .where(eq(llmModels.id, id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: 'Model not found' };
    }

    await db.delete(llmModels).where(eq(llmModels.id, id));

    revalidatePath('/admin/llm-engines');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete LLM model:', error);
    return { success: false, error: 'Failed to delete LLM model' };
  }
}

export async function toggleModelActive(id: string): Promise<ActionResult<LlmModel>> {
  const accessCheck = await validateAccess();
  if (!accessCheck.success) return accessCheck;

  try {
    const [model] = await db
      .select()
      .from(llmModels)
      .where(eq(llmModels.id, id))
      .limit(1);

    if (!model) {
      return { success: false, error: 'Model not found' };
    }

    // If activating this model, deactivate all others for the same provider
    if (!model.isActive) {
      await db
        .update(llmModels)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(eq(llmModels.providerId, model.providerId), ne(llmModels.id, id))
        );
    }

    const [updatedModel] = await db
      .update(llmModels)
      .set({
        isActive: !model.isActive,
        updatedAt: new Date(),
      })
      .where(eq(llmModels.id, id))
      .returning();

    revalidatePath('/admin/llm-engines');
    return { success: true, data: updatedModel };
  } catch (error) {
    console.error('Failed to toggle model active status:', error);
    return { success: false, error: 'Failed to toggle model status' };
  }
}
