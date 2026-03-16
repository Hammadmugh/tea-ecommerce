import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { getUserOrders } from '../services/orderApi';

export default function UserProfile({ isOpen, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders(1, 10);
      setOrders(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      ></div>

      {/* Profile Panel */}
      <div className="fixed top-0 right-0 w-[500px] max-w-[90vw] bg-white z-50 shadow-lg overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h1 className="font-montserrat font-normal text-2xl text-gray-950">
            My Profile
          </h1>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close profile"
          >
            <X size={24} className="text-gray-950" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-8">
          
          {/* User Info Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-montserrat font-medium text-gray-950 mb-4">Account Information</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-montserrat text-gray-600">Name:</span>
                <span className="text-sm font-montserrat font-medium text-gray-950">{user.name || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-montserrat text-gray-600">Email:</span>
                <span className="text-sm font-montserrat font-medium text-gray-950">{user.email || 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-montserrat text-gray-600">Role:</span>
                <span className="text-sm font-montserrat font-medium text-gray-950 capitalize">{user.role || 'user'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-montserrat text-gray-600">Member Since:</span>
                <span className="text-sm font-montserrat font-medium text-gray-950">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Order History Section */}
          <div>
            <h2 className="text-lg font-montserrat font-medium text-gray-950 mb-4">Order History</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader size={24} className="animate-spin text-gray-600" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-600 text-sm font-montserrat">{error}</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs font-montserrat text-gray-600">Order ID</p>
                        <p className="text-sm font-montserrat font-medium text-gray-950 truncate">{order._id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-montserrat text-gray-600">Status</p>
                        <p className={`text-sm font-montserrat font-medium px-2 py-1 rounded inline-block ${
                          order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.orderStatus || 'pending'}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <p className="text-xs font-montserrat font-medium text-gray-700 mb-2">Items:</p>
                      {order.items && order.items.length > 0 ? (
                        <ul className="space-y-1">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <li key={idx} className="text-xs font-montserrat text-gray-600">
                              • {item.quantity}x {item.productName || 'Product'}
                            </li>
                          ))}
                          {order.items.length > 2 && (
                            <li className="text-xs font-montserrat text-gray-600">
                              • +{order.items.length - 2} more item(s)
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-xs font-montserrat text-gray-500">No items</p>
                      )}
                    </div>

                    {/* Order Footer */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-montserrat text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-montserrat font-medium text-gray-950">
                        €{(order.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="font-montserrat text-gray-500 text-sm">No orders yet</p>
                <p className="font-montserrat text-gray-400 text-xs mt-1">Start shopping to see your orders here</p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              onClose();
              window.location.href = '/';
            }}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-montserrat font-medium hover:bg-red-700 transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
