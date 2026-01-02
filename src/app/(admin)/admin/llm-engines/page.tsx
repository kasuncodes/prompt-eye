import { Suspense } from 'react';
import { LlmEnginesTable } from './_components/llm-engines-table';
import { LlmEnginesTableSkeleton } from './_components/llm-engines-table-skeleton';
import { AddProviderDialog } from './_components/add-provider-dialog';
import { getProvidersPaginated } from './_actions/llm-providers';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function LlmEnginesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = parseInt(params.pageSize || '10', 10);

  const result = await getProvidersPaginated({ search, page, pageSize });

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
      <div className="flex justify-end">
        <AddProviderDialog />
      </div>

      <Suspense fallback={<LlmEnginesTableSkeleton />}>
        <LlmEnginesTable
          providers={data.providers}
          total={data.total}
          page={data.page}
          pageSize={data.pageSize}
          totalPages={data.totalPages}
        />
      </Suspense>
    </div>
  );
}
