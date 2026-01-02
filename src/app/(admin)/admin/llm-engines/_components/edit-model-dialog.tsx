'use client';

import { useState, useTransition, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import type { LlmModel } from '@/db/schema';
import { updateModel } from '../_actions/llm-models';

interface EditModelDialogProps {
  model: LlmModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditModelDialog({ model, open, onOpenChange }: EditModelDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    inputCostPer1k: '',
    outputCostPer1k: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        displayName: model.displayName,
        inputCostPer1k: model.inputCostPer1k || '',
        outputCostPer1k: model.outputCostPer1k || '',
      });
      setError(null);
    }
  }, [open, model]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateModel(model.id, {
        displayName: formData.displayName,
        inputCostPer1k: formData.inputCostPer1k || null,
        outputCostPer1k: formData.outputCostPer1k || null,
      });

      if (result.success) {
        onOpenChange(false);
        toast.success('Model updated successfully');
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Model</DialogTitle>
            <DialogDescription>Update the model details for {model.modelId}.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <label htmlFor="edit-model-displayName" className="text-sm font-medium">
                Display Name
              </label>
              <Input
                id="edit-model-displayName"
                placeholder="GPT-4o"
                value={formData.displayName}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                disabled={isPending}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="edit-inputCostPer1k" className="text-sm font-medium">
                  Input Cost / 1k tokens
                </label>
                <Input
                  id="edit-inputCostPer1k"
                  type="number"
                  step="0.000001"
                  min="0"
                  placeholder="0.005"
                  value={formData.inputCostPer1k}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, inputCostPer1k: e.target.value }))
                  }
                  disabled={isPending}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="edit-outputCostPer1k" className="text-sm font-medium">
                  Output Cost / 1k tokens
                </label>
                <Input
                  id="edit-outputCostPer1k"
                  type="number"
                  step="0.000001"
                  min="0"
                  placeholder="0.015"
                  value={formData.outputCostPer1k}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, outputCostPer1k: e.target.value }))
                  }
                  disabled={isPending}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Cost in USD per 1000 tokens. Leave blank if unknown.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
