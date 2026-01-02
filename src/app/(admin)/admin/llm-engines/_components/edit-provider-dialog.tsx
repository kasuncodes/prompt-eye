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
import { Checkbox } from '@/components/ui/checkbox';
import type { LlmProviderWithModels } from '../_actions/llm-providers';
import { updateProvider } from '../_actions/llm-providers';

interface EditProviderDialogProps {
  provider: LlmProviderWithModels;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProviderDialog({ provider, open, onOpenChange }: EditProviderDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    logoUrl: '',
    apiKey: '',
    clearApiKey: false,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        displayName: provider.displayName,
        logoUrl: provider.logoUrl || '',
        apiKey: '',
        clearApiKey: false,
      });
      setError(null);
    }
  }, [open, provider]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateProvider(provider.id, {
        displayName: formData.displayName,
        logoUrl: formData.logoUrl || null,
        apiKey: formData.apiKey || undefined,
        clearApiKey: formData.clearApiKey,
      });

      if (result.success) {
        onOpenChange(false);
        toast.success('Provider updated successfully');
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
            <DialogTitle>Edit Provider</DialogTitle>
            <DialogDescription>Update the provider details for {provider.name}.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <label htmlFor="edit-displayName" className="text-sm font-medium">
                Display Name
              </label>
              <Input
                id="edit-displayName"
                placeholder="OpenAI"
                value={formData.displayName}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                disabled={isPending}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-logoUrl" className="text-sm font-medium">
                Logo URL
              </label>
              <Input
                id="edit-logoUrl"
                type="url"
                placeholder="https://example.com/logo.svg"
                value={formData.logoUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                disabled={isPending}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-apiKey" className="text-sm font-medium">
                API Key
              </label>
              <Input
                id="edit-apiKey"
                type="password"
                placeholder={provider.hasApiKey ? 'Leave blank to keep current key' : 'sk-...'}
                value={formData.apiKey}
                onChange={(e) => setFormData((prev) => ({ ...prev, apiKey: e.target.value }))}
                disabled={isPending || formData.clearApiKey}
              />
              {provider.hasApiKey && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clearApiKey"
                    checked={formData.clearApiKey}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        clearApiKey: checked === true,
                        apiKey: checked ? '' : prev.apiKey,
                      }))
                    }
                    disabled={isPending}
                  />
                  <label
                    htmlFor="clearApiKey"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Remove API key
                  </label>
                </div>
              )}
            </div>
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
