'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/context';
import { getCartQuantity } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const { cart, setIsCartOpen, favorites, setIsFavoritesOpen } = useStore();
  const cartCount = getCartQuantity(cart);
  const favoritesCount = favorites.length;

  const navItems: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
    badge?: number;
    active: boolean;
    disabled: boolean;
  }> = [
    {
      id: 'home',
      label: 'Anasayfa',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: '/',
      active: pathname === '/',
      disabled: false,
    },
    {
      id: 'categories',
      label: 'Kategoriler',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      href: '/kadin',
      active: pathname.startsWith('/kadin') || pathname.startsWith('/erkek'),
      disabled: false,
    },
    {
      id: 'cart',
      label: 'Sepetim',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      onClick: () => setIsCartOpen(true),
      badge: cartCount > 0 ? cartCount : undefined,
      active: false,
      disabled: false,
    },
    {
      id: 'favorites',
      label: 'Favorilerim',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      onClick: () => setIsFavoritesOpen(true),
      badge: favoritesCount > 0 ? favoritesCount : undefined,
      active: false,
      disabled: false,
    },
    {
      id: 'login',
      label: 'Giriş Yap',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: '#',
      active: false,
      disabled: true,
    },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb',
      zIndex: 50,
    }}
    className="md:hidden"
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '56px',
        padding: '0 8px',
      }}>
        {navItems.map((item) => {
          const isDisabled = item.disabled;

          // Handle onClick items (like cart)
          if (item.onClick) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                type="button"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  padding: '8px 4px',
                  cursor: 'pointer',
                  color: '#4b5563',
                  textDecoration: 'none',
                  border: 'none',
                  background: 'none',
                }}
              >
                <div style={{ position: 'relative', width: '24px', height: '24px' }}>
                  {item.icon}
                  {item.badge && item.badge > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      fontSize: '11px',
                      borderRadius: '10px',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      padding: '0 4px',
                      lineHeight: '1',
                    }}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: '0.625rem',
                  marginTop: '2px',
                  fontWeight: '500',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}>
                  {item.label}
                </span>
              </button>
            );
          }

          if (isDisabled) {
            return (
              <button
                key={item.id}
                disabled={true}
                type="button"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  padding: '8px 4px',
                  opacity: 0.4,
                  cursor: 'not-allowed',
                  color: '#4b5563',
                  textDecoration: 'none',
                  border: 'none',
                  background: 'none',
                }}
              >
                <div style={{ position: 'relative', width: '24px', height: '24px' }}>
                  {item.icon}
                  {item.badge && item.badge > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      fontSize: '11px',
                      borderRadius: '10px',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      padding: '0 4px',
                      lineHeight: '1',
                    }}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: '0.625rem',
                  marginTop: '2px',
                  fontWeight: '500',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href!}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                padding: '8px 4px',
                opacity: isDisabled ? 0.4 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                color: '#000000',
                textDecoration: 'none',
                border: 'none',
                background: 'none',
              }}
            >
              <div style={{ position: 'relative', width: '24px', height: '24px' }}>
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    fontSize: '11px',
                    borderRadius: '10px',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    padding: '0 4px',
                    lineHeight: '1',
                  }}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: '0.625rem',
                marginTop: '2px',
                fontWeight: '500',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
