'use client';

import { useState, useTransition } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { revealApiKey } from '../_actions/llm-providers';

interface ProviderApiKeyFieldProps {
  providerId: string;
  hasApiKey: boolean;
  maskedApiKey?: string;
}

export function ProviderApiKeyField({
  providerId,
  hasApiKey,
  maskedApiKey,
}: ProviderApiKeyFieldProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  if (!hasApiKey) {
    return <span className="text-sm italic text-muted-foreground">Not configured</span>;
  }

  const handleReveal = () => {
    if (isRevealed) {
      setIsRevealed(false);
      setRevealedKey(null);
      return;
    }

    startTransition(async () => {
      const result = await revealApiKey(providerId);
      if (result.success && result.data) {
        setRevealedKey(result.data);
        setIsRevealed(true);
      } else if (!result.success) {
        toast.error(result.error);
      } else {
        toast.error('Failed to reveal API key');
      }
    });
  };

  const handleCopy = async () => {
    if (revealedKey) {
      await navigator.clipboard.writeText(revealedKey);
      setCopied(true);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
        {isRevealed ? revealedKey : maskedApiKey}
      </code>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleReveal}
        disabled={isPending}
      >
        {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
      </Button>
      {isRevealed && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      )}
    </div>
  );
}
