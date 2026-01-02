'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { toggleModelActive } from '../_actions/llm-models';

interface ModelActiveToggleProps {
  modelId: string;
  isActive: boolean;
}

export function ModelActiveToggle({ modelId, isActive }: ModelActiveToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleModelActive(modelId);
      if (result.success) {
        toast.success(result.data?.isActive ? 'Model activated' : 'Model deactivated');
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Switch
      checked={isActive}
      onCheckedChange={handleToggle}
      disabled={isPending}
      aria-label={isActive ? 'Deactivate model' : 'Activate model'}
    />
  );
}
