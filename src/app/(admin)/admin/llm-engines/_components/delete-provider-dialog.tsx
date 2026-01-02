'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { LlmProviderWithModels } from '../_actions/llm-providers';
import { deleteProvider } from '../_actions/llm-providers';

interface DeleteProviderDialogProps {
  provider: LlmProviderWithModels;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProviderDialog({ provider, open, onOpenChange }: DeleteProviderDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProvider(provider.id);

      if (result.success) {
        onOpenChange(false);
        toast.success('Provider deleted successfully');
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Provider</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{provider.displayName}</strong>? This will also
            delete all {provider.models.length} associated models. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? 'Deleting...' : 'Delete Provider'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
