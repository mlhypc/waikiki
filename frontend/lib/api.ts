const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Retry helper for network requests
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  timeout = 10000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error: any) {
      const isLastRetry = i === retries - 1;

      if (isLastRetry) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, i), 5000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('All retries failed');
}

export interface User {
  userId: string;
  abTestGroup: 'A' | 'B' | 'C';
  balance: number;
  totalPurchases: number;
  totalSpent: number;
  surveyResponses?: {
    age: string;
    gender: string;
    frequency: string;
    completedAt: Date;
  };
  simulationCompleted?: boolean;
  simulationCompletedAt?: Date;
}

export interface Product {
  productId: string;
  name: string;
  description: string[];
  price: number;
  originalPrice?: number;
  discountedPrice?: number;
  currency: string;
  category: string;
  gender: string;
  images: string[];
  sizes: string[];
  stock: number;
  productCode?: string;
  mannequinInfo?: string;
  properties?: any;
  combinationSuggestions?: any[];
  relatedProducts?: string[];
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
  const response = await fetchWithRetry(
    `${API_URL}/api/users/init`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    },
    3, // 3 retries
    15000 // 15 second timeout per request
  );
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

export const submitSurvey = async (
  userId: string,
  age: string,
  gender: string,
  frequency: string
): Promise<User> => {
  const response = await fetch(`${API_URL}/api/users/${userId}/survey`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ age, gender, frequency }),
  });
  const data = await response.json();
  return data.user;
};

export const completeSimulation = async (
  userId: string
): Promise<User> => {
  const response = await fetch(`${API_URL}/api/users/${userId}/complete-simulation`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  return data.user;
};

export interface PaginatedProducts {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Products API
export const getProducts = async (
  abTestGroup?: string,
  category?: string,
  page: number = 1,
  limit: number = 20,
  gender?: string
): Promise<PaginatedProducts> => {
  const params = new URLSearchParams();
  if (abTestGroup) params.append('abTestGroup', abTestGroup);
  if (category) params.append('category', category);
  if (gender) params.append('gender', gender);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await fetch(`${API_URL}/api/products?${params.toString()}`);
  const data = await response.json();
  return data;
};

export const getProduct = async (productId: string, abTestGroup?: string): Promise<Product> => {
  const params = abTestGroup ? `?abTestGroup=${abTestGroup}` : '';
  const response = await fetch(`${API_URL}/api/products/${productId}${params}`);
  const data = await response.json();
  return data.product;
};

export const getSuggestions = async (productId: string, abTestGroup: string, userId?: string): Promise<Product[]> => {
  const params = new URLSearchParams({ abTestGroup });
  if (userId) params.append('userId', userId);

  const response = await fetch(`${API_URL}/api/products/suggestions/${productId}?${params.toString()}`);
  const data = await response.json();
  return data.suggestions;
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
