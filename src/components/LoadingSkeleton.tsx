export function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 bg-size-[200%_100%] ${className}`}
    >
      <div className="w-full h-full flex items-center justify-center">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="w-14 h-14 bg-gray-300 rounded-lg mb-4"></div>
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}
