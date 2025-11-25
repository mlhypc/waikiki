'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      className="text-sm text-gray-500 !pb-6 !px-4"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center flex-wrap !gap-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="text-gray-300 !mx-2">/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-gray-900 transition-colors capitalize"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-bold capitalize">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
