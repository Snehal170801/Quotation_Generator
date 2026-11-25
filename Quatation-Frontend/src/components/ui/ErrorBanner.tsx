// src/components/ui/ErrorBanner.tsx

import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-4 rounded-[var(--radius-lg)] border"
      style={{
        background: "var(--color-danger-50)",
        borderColor: "#fca5a5",
        color: "var(--color-danger-600)",
      }}
    >
      <AlertCircle size={18} className="shrink-0" />
      <p className="text-[14px] flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-[13px] font-semibold
                     px-3 py-1.5 rounded-[var(--radius-md)] border cursor-pointer
                     transition-colors duration-150 hover:bg-white"
          style={{ background: "white", borderColor: "#fca5a5", color: "var(--color-danger-600)" }}
        >
          <RefreshCw size={13} />
          Retry
        </button>
      )}
    </div>
  );
}
