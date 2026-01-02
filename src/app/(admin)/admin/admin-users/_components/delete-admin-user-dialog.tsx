'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import type { AdminUser } from '@/db/schema';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteAdminUser } from '../_actions/admin-users';

interface DeleteAdminUserDialogProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAdminUserDialog({ user, open, onOpenChange }: DeleteAdminUserDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);

    startTransition(async () => {
      const result = await deleteAdminUser(user.id);

      if (result.success) {
        onOpenChange(false);
        toast.success('Admin user deleted successfully');
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Admin User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone.
            They will no longer be able to access the admin dashboard.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
