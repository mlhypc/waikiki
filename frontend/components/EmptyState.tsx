import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  variant?: 'fullscreen' | 'inline';
}

export function EmptyState({
  title,
  message,
  actionLabel,
  actionHref,
  variant = 'fullscreen',
}: EmptyStateProps) {
  const containerClass = variant === 'fullscreen'
    ? 'min-h-screen flex items-center justify-center bg-white'
    : 'text-center py-16';

  return (
    <div className={containerClass}>
      <div className="text-center">
        {title && <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>}
        <p className="text-gray-500">{message}</p>
        {actionLabel && actionHref && (
          <Link href={actionHref} className="text-blue-600 hover:underline mt-4 inline-block">
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
