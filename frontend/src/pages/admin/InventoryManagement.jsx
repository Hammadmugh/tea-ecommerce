import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, TrendingDown } from 'lucide-react';
import { getAllProducts } from '../../services/productApi';

export default function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, low, out

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllProducts(1, 100);
      if (response.success) {
        setProducts(response.data);
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filterProducts = () => {
    return products.filter(product => {
      const variantStocks = product.variants || [];
      const totalStock = variantStocks.reduce((sum, v) => sum + (v.stock || 0), 0);
      
      if (filter === 'low') return totalStock > 0 && totalStock < 50;
      if (filter === 'out') return totalStock === 0;
      return true;
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: 'out', color: 'red', text: 'Out of Stock' };
    if (stock < 50) return { status: 'low', color: 'yellow', text: 'Low Stock' };
    return { status: 'ok', color: 'green', text: 'In Stock' };
  };

  const filteredProducts = filterProducts();
  const totalInventory = products.reduce((sum, p) => {
    const variantStocks = p.variants || [];
    return sum + variantStocks.reduce((varSum, v) => varSum + (v.stock || 0), 0);
  }, 0);

  const lowStockCount = products.filter(p => {
    const variantStocks = p.variants || [];
    const totalStock = variantStocks.reduce((sum, v) => sum + (v.stock || 0), 0);
    return totalStock > 0 && totalStock < 50;
  }).length;

  const outOfStockCount = products.filter(p => {
    const variantStocks = p.variants || [];
    const totalStock = variantStocks.reduce((sum, v) => sum + (v.stock || 0), 0);
    return totalStock === 0;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
          <div className="text-gray-600 text-sm font-montserrat">Total Inventory</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{totalInventory}</div>
          <div className="text-xs text-gray-500 mt-1">units in stock</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-600">
          <div className="text-gray-600 text-sm font-montserrat">Low Stock Items</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">{lowStockCount}</div>
          <div className="text-xs text-gray-500 mt-1">products below threshold</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-600">
          <div className="text-gray-600 text-sm font-montserrat">Out of Stock</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{outOfStockCount}</div>
          <div className="text-xs text-gray-500 mt-1">products unavailable</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4 items-center flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-montserrat text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-4 py-2 rounded-lg font-montserrat text-sm font-medium transition-colors ${
              filter === 'low'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`px-4 py-2 rounded-lg font-montserrat text-sm font-medium transition-colors ${
              filter === 'out'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Out of Stock
          </button>
        </div>

        <button
          onClick={fetchProducts}
          disabled={loading}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-montserrat text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" />
          <p className="text-red-800 font-montserrat">{error}</p>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-montserrat font-semibold text-gray-700">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-montserrat font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-montserrat font-semibold text-gray-700">
                  Variants
                </th>
                <th className="px-6 py-3 text-left text-xs font-montserrat font-semibold text-gray-700">
                  Total Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-montserrat font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 font-montserrat">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const variantStocks = product.variants || [];
                  const totalStock = variantStocks.reduce((sum, v) => sum + (v.stock || 0), 0);
                  const statusInfo = getStockStatus(totalStock);

                  return (
                    <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 font-montserrat text-sm">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-montserrat text-gray-700">
                        {product.category || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          {variantStocks.map((variant) => (
                            <div
                              key={variant._id}
                              className="text-xs font-montserrat text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block mr-1"
                            >
                              {variant.label}: {variant.stock}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-montserrat font-semibold text-lg">
                          {totalStock}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-montserrat font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full bg-${statusInfo.color}-600`}
                          ></div>
                          {statusInfo.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* No results message */}
      {!loading && filteredProducts.length === 0 && filter !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-blue-600" />
          <p className="text-blue-800 font-montserrat text-sm">
            Great! No {filter === 'low' ? 'low stock' : 'out of stock'} items to worry about.
          </p>
        </div>
      )}
    </div>
  );
}
