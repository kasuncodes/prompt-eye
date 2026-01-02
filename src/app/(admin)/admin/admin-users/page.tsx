import { Suspense } from 'react';
import { AdminUsersTable } from './_components/admin-users-table';
import { AdminUsersTableSkeleton } from './_components/admin-users-table-skeleton';
import { AddAdminUserDialog } from './_components/add-admin-user-dialog';
import { getAdminUsersPaginated } from './_actions/admin-users';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = parseInt(params.pageSize || '10', 10);

  const result = await getAdminUsersPaginated({ search, page, pageSize });

  if (!result.success) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="rounded-xl border bg-destructive/10 p-6">
          <p className="text-destructive">{result.error}</p>
        </div>
      </div>
    );
  }

  const data = result.data!;

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <AddAdminUserDialog />
      </div>

      {/* Data Table with Search and Pagination */}
      <Suspense fallback={<AdminUsersTableSkeleton />}>
        <AdminUsersTable
          users={data.users}
          total={data.total}
          page={data.page}
          pageSize={data.pageSize}
          totalPages={data.totalPages}
        />
      </Suspense>
    </div>
  );
}
