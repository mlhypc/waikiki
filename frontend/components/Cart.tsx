'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/context';
import { useAnalytics } from '@/hooks/useAnalytics';

export const Cart: React.FC = () => {
  const { cart, addToCart, removeFromCart, cartTotal, checkout, user } = useStore();
  const analytics = useAnalytics();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && analytics) {
      analytics.trackCartView(cart, cartTotal);
    }
  };

  const handleCheckout = async () => {
    const success = await checkout();
    if (success) {
      alert('Purchase successful! Thank you for shopping with us.');
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={handleToggle}
        className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleToggle}
          />
          <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Shopping Cart</h2>
                <button
                  onClick={handleToggle}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {user && (
                <div className="mb-4 p-4 bg-green-50 rounded">
                  <p className="text-sm text-gray-600">Your Balance</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${user.balance.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Test Group: {user.abTestGroup}
                  </p>
                </div>
              )}

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div
                        key={item.product.productId}
                        className="border rounded p-4 flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">
                            ${item.product.price.toFixed(2)} × {item.quantity}
                          </p>
                          <p className="font-bold">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.product.productId)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            -
                          </button>
                          <span className="font-bold">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item.product)}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>

                    {user && user.balance < cartTotal && (
                      <p className="text-red-500 text-sm mb-4">
                        Insufficient balance! You need ${(cartTotal - user.balance).toFixed(2)} more.
                      </p>
                    )}

                    <button
                      onClick={handleCheckout}
                      disabled={!user || user.balance < cartTotal}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
