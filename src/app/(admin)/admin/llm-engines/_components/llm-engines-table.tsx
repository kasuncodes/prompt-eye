'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import type { LlmModel } from '@/db/schema';
import type { LlmProviderWithModels } from '../_actions/llm-providers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProviderActions } from './provider-actions';
import { ProviderApiKeyField } from './provider-api-key-field';
import { ModelActiveToggle } from './model-active-toggle';
import { ModelActions } from './model-actions';
import { AddModelDialog } from './add-model-dialog';
import { Badge } from '@/components/ui/badge';

interface LlmEnginesTableProps {
  providers: LlmProviderWithModels[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function LlmEnginesTable({
  providers,
  total,
  page,
  pageSize,
  totalPages,
}: LlmEnginesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());

  const updateUrl = useCallback(
    (params: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      router.push(`?${newParams.toString()}`);
    },
    [router, searchParams]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get('search') || '';
      if (searchValue !== currentSearch) {
        updateUrl({ search: searchValue || undefined, page: '1' });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, searchParams, updateUrl]);

  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage.toString() });
  };

  const handlePageSizeChange = (newSize: string) => {
    updateUrl({ pageSize: newSize, page: '1' });
  };

  const toggleProvider = (providerId: string) => {
    setExpandedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(providerId)) {
        next.delete(providerId);
      } else {
        next.add(providerId);
      }
      return next;
    });
  };

  const getActiveModel = (models: LlmModel[]) => {
    return models.find((m) => m.isActive);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Page Size Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search providers..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {providers.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            {searchValue
              ? 'No LLM providers found matching your search.'
              : 'No LLM providers found. Add your first provider to get started.'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]" />
                <TableHead className="w-[60px]">Logo</TableHead>
                <TableHead className="w-[200px]">Provider</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead className="w-[150px]">Active Model</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider) => {
                const isExpanded = expandedProviders.has(provider.id);
                const activeModel = getActiveModel(provider.models);

                return (
                  <React.Fragment key={provider.id}>
                    <TableRow className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleProvider(provider.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {provider.logoUrl ? (
                          <img
                            src={provider.logoUrl}
                            alt={provider.displayName}
                            className="h-8 w-8 rounded-md object-contain"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-medium">
                            {provider.displayName.charAt(0)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{provider.displayName}</div>
                          <div className="text-xs text-muted-foreground">{provider.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ProviderApiKeyField
                          providerId={provider.id}
                          hasApiKey={provider.hasApiKey}
                          maskedApiKey={provider.maskedApiKey}
                        />
                      </TableCell>
                      <TableCell>
                        {activeModel ? (
                          <Badge variant="secondary">{activeModel.displayName}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <ProviderActions provider={provider} />
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={6} className="p-0">
                          <div className="px-4 py-3">
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="text-sm font-medium">
                                Models ({provider.models.length})
                              </h4>
                              <AddModelDialog providerId={provider.id} providerName={provider.displayName} />
                            </div>
                            {provider.models.length === 0 ? (
                              <p className="py-4 text-center text-sm text-muted-foreground">
                                No models added yet. Add a model to get started.
                              </p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[200px]">Model</TableHead>
                                    <TableHead>Model ID</TableHead>
                                    <TableHead className="w-[120px]">Input Cost/1k</TableHead>
                                    <TableHead className="w-[120px]">Output Cost/1k</TableHead>
                                    <TableHead className="w-[80px]">Active</TableHead>
                                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {provider.models.map((model) => (
                                    <TableRow key={model.id}>
                                      <TableCell className="font-medium">
                                        {model.displayName}
                                      </TableCell>
                                      <TableCell className="font-mono text-sm text-muted-foreground">
                                        {model.modelId}
                                      </TableCell>
                                      <TableCell>
                                        {model.inputCostPer1k
                                          ? `$${model.inputCostPer1k}`
                                          : '-'}
                                      </TableCell>
                                      <TableCell>
                                        {model.outputCostPer1k
                                          ? `$${model.outputCostPer1k}`
                                          : '-'}
                                      </TableCell>
                                      <TableCell>
                                        <ModelActiveToggle
                                          modelId={model.id}
                                          isActive={model.isActive}
                                        />
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <ModelActions model={model} />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}{' '}
            results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-9"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
