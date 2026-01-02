'use client';

import { useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createModel } from '../_actions/llm-models';

interface AddModelDialogProps {
  providerId: string;
  providerName: string;
}

export function AddModelDialog({ providerId, providerName }: AddModelDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    modelId: '',
    displayName: '',
    inputCostPer1k: '',
    outputCostPer1k: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createModel({
        providerId,
        modelId: formData.modelId,
        displayName: formData.displayName,
        inputCostPer1k: formData.inputCostPer1k || null,
        outputCostPer1k: formData.outputCostPer1k || null,
      });

      if (result.success) {
        setOpen(false);
        setFormData({ modelId: '', displayName: '', inputCostPer1k: '', outputCostPer1k: '' });
        toast.success('Model added successfully');
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setError(null);
      setFormData({ modelId: '', displayName: '', inputCostPer1k: '', outputCostPer1k: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-3 w-3" />
          Add Model
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Model</DialogTitle>
            <DialogDescription>Add a new model to {providerName}.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <label htmlFor="modelId" className="text-sm font-medium">
                Model ID
              </label>
              <Input
                id="modelId"
                placeholder="gpt-4o"
                value={formData.modelId}
                onChange={(e) => setFormData((prev) => ({ ...prev, modelId: e.target.value }))}
                disabled={isPending}
                required
              />
              <p className="text-xs text-muted-foreground">
                The API model identifier (e.g., gpt-4o, gemini-1.5-pro)
              </p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </label>
              <Input
                id="displayName"
                placeholder="GPT-4o"
                value={formData.displayName}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                disabled={isPending}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="inputCostPer1k" className="text-sm font-medium">
                  Input Cost / 1k tokens
                </label>
                <Input
                  id="inputCostPer1k"
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
                <label htmlFor="outputCostPer1k" className="text-sm font-medium">
                  Output Cost / 1k tokens
                </label>
                <Input
                  id="outputCostPer1k"
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
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add Model'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
