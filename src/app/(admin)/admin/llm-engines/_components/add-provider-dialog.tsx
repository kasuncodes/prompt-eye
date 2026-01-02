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
import { createProvider } from '../_actions/llm-providers';

export function AddProviderDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    logoUrl: '',
    apiKey: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createProvider(formData);

      if (result.success) {
        setOpen(false);
        setFormData({ name: '', displayName: '', logoUrl: '', apiKey: '' });
        toast.success('LLM provider added successfully');
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
      setFormData({ name: '', displayName: '', logoUrl: '', apiKey: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Provider
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add LLM Provider</DialogTitle>
            <DialogDescription>
              Add a new LLM provider like OpenAI, Google, or Anthropic.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name (ID)
              </label>
              <Input
                id="name"
                placeholder="openai"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                disabled={isPending}
                required
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier, lowercase (e.g., openai, google, anthropic)
              </p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </label>
              <Input
                id="displayName"
                placeholder="OpenAI"
                value={formData.displayName}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                disabled={isPending}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="logoUrl" className="text-sm font-medium">
                Logo URL
              </label>
              <Input
                id="logoUrl"
                type="url"
                placeholder="https://example.com/logo.svg"
                value={formData.logoUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                disabled={isPending}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={formData.apiKey}
                onChange={(e) => setFormData((prev) => ({ ...prev, apiKey: e.target.value }))}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Optional. The API key will be encrypted before storage.
              </p>
            </div>
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
              {isPending ? 'Adding...' : 'Add Provider'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
