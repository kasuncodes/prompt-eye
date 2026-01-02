'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { adminUsers, type NewAdminUser, type AdminUser } from '@/db/schema';
import { eq, or, ilike, sql, desc } from 'drizzle-orm';
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

export async function getAdminUsers(): Promise<ActionResult<typeof adminUsers.$inferSelect[]>> {
  const accessCheck = await validateAccess();
  if (!accessCheck.success) return accessCheck;

  try {
    const users = await db
      .select()
      .from(adminUsers)
      .orderBy(adminUsers.createdAt);

    return { success: true, data: users };
  } catch (error) {
    console.error('Failed to fetch admin users:', error);
    return { success: false, error: 'Failed to fetch admin users' };
  }
}

interface PaginatedResult {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAdminUsersPaginated(params: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<PaginatedResult>> {
  const accessCheck = await validateAccess();
  if (!accessCheck.success) return accessCheck;

  const page = Math.max(1, params.page || 1);
  const pageSize = [10, 25, 50].includes(params.pageSize || 10) ? params.pageSize || 10 : 10;
  const offset = (page - 1) * pageSize;
  const search = params.search?.trim() || '';

  try {
    const searchCondition = search
      ? or(
          ilike(adminUsers.name, `%${search}%`),
          ilike(adminUsers.email, `%${search}%`)
        )
      : undefined;

    const [users, countResult] = await Promise.all([
      db
        .select()
        .from(adminUsers)
        .where(searchCondition)
        .orderBy(desc(adminUsers.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(adminUsers)
        .where(searchCondition),
    ]);

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      data: {
        users,
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Failed to fetch admin users:', error);
    return { success: false, error: 'Failed to fetch admin users' };
  }
}

export async function createAdminUser(
  data: Pick<NewAdminUser, 'name' | 'email'>
): Promise<ActionResult<typeof adminUsers.$inferSelect>> {
  const accessCheck = await validateAccess();
  if (!accessCheck.success) return accessCheck;

  if (!data.name?.trim()) {
    return { success: false, error: 'Name is required' };
  }
  if (!data.email?.trim()) {
    return { success: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { success: false, error: 'Invalid email format' };
  }

  try {
    const existing = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, data.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: 'An admin user with this email already exists' };
    }

    const [newUser] = await db
      .insert(adminUsers)
      .values({
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        role: 'super_admin',
      })
      .returning();

    revalidatePath('/admin/admin-users');
    return { success: true, data: newUser };
  } catch (error) {
    console.error('Failed to create admin user:', error);
    return { success: false, error: 'Failed to create admin user' };
  }
}

export async function updateAdminUser(
  id: string,
  data: Pick<NewAdminUser, 'name' | 'email'>
): Promise<ActionResult<typeof adminUsers.$inferSelect>> {
  const accessCheck = await validateAccess();
  if (!accessCheck.success) return accessCheck;

  if (!data.name?.trim()) {
    return { success: false, error: 'Name is required' };
  }
  if (!data.email?.trim()) {
    return { success: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { success: false, error: 'Invalid email format' };
  }

  try {
    const existing = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: 'Admin user not found' };
    }

    const duplicate = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, data.email.toLowerCase()))
      .limit(1);

    if (duplicate.length > 0 && duplicate[0].id !== id) {
      return { success: false, error: 'Another admin user with this email already exists' };
    }

    const [updatedUser] = await db
      .update(adminUsers)
      .set({
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, id))
      .returning();

    revalidatePath('/admin/admin-users');
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('Failed to update admin user:', error);
    return { success: false, error: 'Failed to update admin user' };
  }
}

export async function deleteAdminUser(id: string): Promise<ActionResult> {
  const accessCheck = await validateAccess();
  if (!accessCheck.success) return accessCheck;

  try {
    const session = await auth();

    const existing = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: 'Admin user not found' };
    }

    if (existing[0].email === session?.user?.email) {
      return { success: false, error: 'You cannot delete your own account' };
    }

    const allUsers = await db.select().from(adminUsers);
    if (allUsers.length <= 1) {
      return { success: false, error: 'Cannot delete the last admin user' };
    }

    await db.delete(adminUsers).where(eq(adminUsers.id, id));

    revalidatePath('/admin/admin-users');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete admin user:', error);
    return { success: false, error: 'Failed to delete admin user' };
  }
}
