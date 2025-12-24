'use client';

import { useEffect, useState } from 'react';

interface Stats {
  timestamp: string;
  users: {
    total: number;
    started: number;
    completedSimulations: number;
    dropoffCount: number;
    simulationCompletionRate: string;
    byGroup: { A?: number; B?: number; C?: number };
    groupBalance: {
      isBalanced: boolean;
      maxDifference: number;
      distribution: string;
    };
    surveyCompleted: number;
    surveyCompletionRate: string;
    demographics: {
      gender: Record<string, number>;
      age: Record<string, number>;
      frequency: Record<string, number>;
    };
  };
  events: {
    total: number;
    byType: Record<string, number>;
  };
  abTest: {
    suggestionViews: Record<string, number>;
    suggestionClicks: Record<string, number>;
    suggestionAddToCart: Record<string, number>;
    ctr: Record<string, string>;
    conversionRate: Record<string, string>;
  };
  checkout: {
    starts: number;
    completes: number;
    completionRate: string;
    byGroup: Record<string, number>;
  };
  recentActivity: {
    last24Hours: {
      newUsers: number;
      events: number;
    };
  };
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Live Statistics</h1>
              <p className="text-gray-500 text-sm mt-1">
                Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh (5s)
              </label>
              <button
                onClick={fetchStats}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Refresh Now
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-green-800 mb-2">New Users (24h)</h3>
            <p className="text-3xl font-bold text-green-600">{stats.recentActivity.last24Hours.newUsers}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Events (24h)</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.recentActivity.last24Hours.events}</p>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">👥 Users</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="border rounded p-3 bg-blue-50">
              <p className="text-sm text-gray-600">Started</p>
              <p className="text-2xl font-bold text-blue-600">{stats.users.started}</p>
            </div>
            <div className="border rounded p-3 bg-green-50">
              <p className="text-sm text-gray-600">✅ Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.users.completedSimulations}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.users.simulationCompletionRate}</p>
            </div>
            <div className="border rounded p-3 bg-red-50">
              <p className="text-sm text-gray-600">Dropped Off</p>
              <p className="text-2xl font-bold text-red-600">{stats.users.dropoffCount}</p>
            </div>
            <div className="border rounded p-3">
              <p className="text-sm text-gray-600">Group A</p>
              <p className="text-2xl font-bold">{stats.users.byGroup.A || 0}</p>
            </div>
            <div className="border rounded p-3">
              <p className="text-sm text-gray-600">Group B</p>
              <p className="text-2xl font-bold">{stats.users.byGroup.B || 0}</p>
            </div>
            <div className="border rounded p-3">
              <p className="text-sm text-gray-600">Group C</p>
              <p className="text-2xl font-bold">{stats.users.byGroup.C || 0}</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className={`p-3 rounded mb-3 ${stats.users.groupBalance.isBalanced ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className="text-sm font-semibold mb-1">
                {stats.users.groupBalance.isBalanced ? '✅ Groups Balanced' : '⚠️ Groups Unbalanced'}
              </p>
              <p className="text-xs text-gray-600">
                Distribution: {stats.users.groupBalance.distribution} (Max diff: {stats.users.groupBalance.maxDifference})
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Survey Completed: <span className="font-semibold">{stats.users.surveyCompleted}</span> ({stats.users.surveyCompletionRate})
            </p>
            <p className="text-xs text-gray-500 mt-2">
              ℹ️ Stats only include users who completed the simulation
            </p>
          </div>
        </div>

        {/* Demographics */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📈 Demographics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Gender</h3>
              {Object.entries(stats.users.demographics.gender).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1">
                  <span className="text-gray-600">{key}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Age</h3>
              {Object.entries(stats.users.demographics.age).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1 text-sm">
                  <span className="text-gray-600">{key}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Shopping Frequency</h3>
              {Object.entries(stats.users.demographics.frequency).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1 text-xs">
                  <span className="text-gray-600">{key}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* A/B/C Test Results */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🧪 A/B/C Test Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Group</th>
                  <th className="text-right py-2 px-4">Views</th>
                  <th className="text-right py-2 px-4">Clicks</th>
                  <th className="text-right py-2 px-4">Add to Cart</th>
                  <th className="text-right py-2 px-4">CTR</th>
                  <th className="text-right py-2 px-4">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {['A', 'B', 'C'].map(group => (
                  <tr key={group} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">Group {group}</td>
                    <td className="text-right py-3 px-4">{stats.abTest.suggestionViews[group] || 0}</td>
                    <td className="text-right py-3 px-4">{stats.abTest.suggestionClicks[group] || 0}</td>
                    <td className="text-right py-3 px-4">{stats.abTest.suggestionAddToCart[group] || 0}</td>
                    <td className="text-right py-3 px-4 text-blue-600 font-semibold">
                      {stats.abTest.ctr[group] || '0%'}
                    </td>
                    <td className="text-right py-3 px-4 text-green-600 font-semibold">
                      {stats.abTest.conversionRate[group] || '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Checkout Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🛒 Checkout</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded p-3">
              <p className="text-sm text-gray-600">Started</p>
              <p className="text-2xl font-bold">{stats.checkout.starts}</p>
            </div>
            <div className="border rounded p-3">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{stats.checkout.completes}</p>
            </div>
            <div className="border rounded p-3 col-span-2">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.checkout.completionRate}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-semibold mb-2">By Group:</p>
            <div className="flex gap-4">
              {Object.entries(stats.checkout.byGroup).map(([group, count]) => (
                <div key={group} className="text-sm">
                  <span className="text-gray-600">Group {group}:</span>{' '}
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Events */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">📝 Events ({stats.events.total} total)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats.events.byType).map(([type, count]) => (
              <div key={type} className="border rounded p-3">
                <p className="text-xs text-gray-600 truncate">{type}</p>
                <p className="text-lg font-bold">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
