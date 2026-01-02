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
import type { LlmModel } from '@/db/schema';
import { deleteModel } from '../_actions/llm-models';

interface DeleteModelDialogProps {
  model: LlmModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteModelDialog({ model, open, onOpenChange }: DeleteModelDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteModel(model.id);

      if (result.success) {
        onOpenChange(false);
        toast.success('Model deleted successfully');
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Model</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{model.displayName}</strong> ({model.modelId})?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? 'Deleting...' : 'Delete Model'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
