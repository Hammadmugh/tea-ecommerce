import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../../services/adminApi';
import { AlertCircle, TrendingUp, Users, Package, ShoppingCart, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getAnalytics();
      setAnalytics(response);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-montserrat">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="text-red-600" />
        <div>
          <p className="text-red-800 font-montserrat font-medium">Error</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { users, products, orders, revenue, inventory } = analytics;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-montserrat">Total Users</p>
              <p className="text-3xl font-prosto-one font-normal text-gray-950 mt-2">{users.total}</p>
              <p className="text-xs text-gray-500 mt-1">{users.blocked} blocked</p>
            </div>
            <Users size={40} className="text-blue-600 opacity-20" />
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-montserrat">Total Products</p>
              <p className="text-3xl font-prosto-one font-normal text-gray-950 mt-2">{products.total}</p>
              <p className="text-xs text-gray-500 mt-1">Active products</p>
            </div>
            <Package size={40} className="text-green-600 opacity-20" />
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-montserrat">Total Orders</p>
              <p className="text-3xl font-prosto-one font-normal text-gray-950 mt-2">{orders.total}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <ShoppingCart size={40} className="text-purple-600 opacity-20" />
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-montserrat">Total Revenue</p>
              <p className="text-3xl font-prosto-one font-normal text-gray-950 mt-2">€{revenue.total}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <DollarSign size={40} className="text-amber-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Orders by Status and Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-prosto-one font-normal text-gray-950 mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {orders.byStatus && orders.byStatus.length > 0 ? (
              orders.byStatus.map((status) => (
                <div key={status._id} className="flex items-center justify-between">
                  <span className="text-sm font-montserrat text-gray-700 capitalize">
                    {status._id || 'Unknown'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(status.count / orders.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-montserrat font-medium text-gray-950 w-8">
                      {status.count}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No orders yet</p>
            )}
          </div>
        </div>

        {/* Inventory Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-prosto-one font-normal text-gray-950 mb-4">Inventory Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-montserrat text-gray-700">Total Stock Items</span>
                <span className="text-lg font-prosto-one font-normal text-gray-950">
                  {inventory.totalStock}
                </span>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-montserrat font-medium text-yellow-900">Low Stock Alert</p>
                  <p className="text-xs text-yellow-700 mt-1">{inventory.lowStockItems} items below 10 units</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      {orders.topProducts && orders.topProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-prosto-one font-normal text-gray-950 mb-4">Top Selling Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-montserrat font-medium text-gray-700">
                    Product
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-montserrat font-medium text-gray-700">
                    Units Sold
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-montserrat font-medium text-gray-700">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.topProducts.slice(0, 10).map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-montserrat text-gray-900">
                      {product.product?.[0]?.name || 'Unknown Product'}
                    </td>
                    <td className="py-3 px-4 text-sm font-montserrat text-gray-900 text-center">
                      {product.totalSold}
                    </td>
                    <td className="py-3 px-4 text-sm font-montserrat text-gray-900 text-right">
                      €{product.revenue?.toFixed(2) || '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Low Stock Products */}
      {inventory.lowStockProducts && inventory.lowStockProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-prosto-one font-normal text-gray-950 mb-4">Low Stock Products</h3>
          <div className="space-y-2">
            {inventory.lowStockProducts.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded"
              >
                <div>
                  <p className="text-sm font-montserrat font-medium text-gray-900">
                    {item.product?.name || 'Unknown'}
                  </p>
                </div>
                <span className="text-sm font-montserrat font-medium text-yellow-700 bg-yellow-100 px-3 py-1 rounded">
                  {item.stock} units
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
