/**
 * Inline, retryable error banner.
 *
 * Replaces `alert()` plus a forced logout. A failed resource no longer costs
 * the admin their session — they see what failed and can retry that one thing
 * while everything that loaded stays on screen.
 */

import { AlertCircle, RefreshCw, X } from "lucide-react";

interface ResourceErrorProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ResourceError({
  message,
  onRetry,
  onDismiss,
}: ResourceErrorProps) {
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

      <p className="grow text-amber-900">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-white transition-colors hover:bg-amber-700"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-amber-700 transition-colors hover:text-amber-900"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
