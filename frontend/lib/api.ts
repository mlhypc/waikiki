const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface User {
  userId: string;
  abTestGroup: 'A' | 'B' | 'C' | 'D';
  balance: number;
  totalPurchases: number;
  totalSpent: number;
}

export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

export interface TrackEventParams {
  userId: string;
  sessionId: string;
  eventType: string;
  eventData: any;
  abTestGroup?: string;
}

// User API
export const initUser = async (userId?: string): Promise<User> => {
  const response = await fetch(`${API_URL}/api/users/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = await response.json();
  return data.user;
};

export const getUser = async (userId: string): Promise<User> => {
  const response = await fetch(`${API_URL}/api/users/${userId}`);
  const data = await response.json();
  return data.user;
};

export const updateUserBalance = async (
  userId: string,
  amount: number,
  type: 'deduct' | 'add'
): Promise<User> => {
  const response = await fetch(`${API_URL}/api/users/${userId}/balance`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, type }),
  });
  const data = await response.json();
  return data.user;
};

// Products API
export const getProducts = async (abTestGroup?: string, category?: string): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (abTestGroup) params.append('abTestGroup', abTestGroup);
  if (category) params.append('category', category);

  const response = await fetch(`${API_URL}/api/products?${params.toString()}`);
  const data = await response.json();
  return data.products;
};

export const getProduct = async (productId: string, abTestGroup?: string): Promise<Product> => {
  const params = abTestGroup ? `?abTestGroup=${abTestGroup}` : '';
  const response = await fetch(`${API_URL}/api/products/${productId}${params}`);
  const data = await response.json();
  return data.product;
};

// Events API
export const trackEvent = async (params: TrackEventParams): Promise<void> => {
  try {
    await fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

export const trackEventBatch = async (events: TrackEventParams[]): Promise<void> => {
  try {
    await fetch(`${API_URL}/api/events/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });
  } catch (error) {
    console.error('Failed to track events:', error);
  }
};
