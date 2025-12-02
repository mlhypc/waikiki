'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  dropdownItems?: { label: string; href: string; icon?: string }[];
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownIndex(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      className="text-sm text-gray-500 !pb-6 !px-4"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center flex-wrap !gap-1">
        {items.map((item, index) => {
          const hasDropdown = item.dropdownItems && item.dropdownItems.length > 0;
          const isOpen = openDropdownIndex === index;
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center relative">
              {index > 0 && <span className="text-gray-300 !mx-2">/</span>}

              {hasDropdown && isLast ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setOpenDropdownIndex(isOpen ? null : index)}
                    className="text-gray-900 font-bold capitalize flex items-center gap-1 hover:text-gray-700 transition-colors"
                  >
                    {item.label}
                    <svg
                      className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 whitespace-nowrap">
                      {item.dropdownItems?.map((dropdownItem, idx) => (
                        <Link
                          key={idx}
                          href={dropdownItem.href}
                          className="block px-4 py-2 hover:bg-gray-50 transition-colors capitalize text-gray-700 hover:text-gray-900"
                          onClick={() => setOpenDropdownIndex(null)}
                        >
                          <span className="flex items-center gap-2">
                            {dropdownItem.icon && <span>{dropdownItem.icon}</span>}
                            {dropdownItem.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : item.href ? (
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
          );
        })}
      </ol>
    </nav>
  );
}
