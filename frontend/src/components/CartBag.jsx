import React from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartBag({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity } = useCart();

  // Calculate price based on variant weight (same as CheckoutPage)
  const getAdjustedPrice = (item) => {
    // If no variant, return base price
    if (!item.variant) return item.price;
    
    // Extract variant value and convert to string
    const variantStr = String(item.variant.value || '').trim();
    
    // Calculate multiplier based on weight
    let multiplier = 1;
    switch(variantStr) {
      case '50':
        multiplier = 1;
        break;
      case '100':
        multiplier = 2;
        break;
      case '170':
        multiplier = 170 / 50; // 3.4
        break;
      case '250':
        multiplier = 250 / 50; // 5
        break;
      case '1kg':
        multiplier = 1000 / 50; // 20
        break;
      case 'sampler':
        multiplier = 0.6;
        break;
      default:
        multiplier = 1;
    }
    
    return item.price * multiplier;
  };

  const subtotal = items.reduce((sum, item) => sum + (getAdjustedPrice(item) * item.quantity), 0);
  const delivery = items.length > 0 ? 3.95 : 0;
  const total = subtotal + delivery;

  const handleQuantityChange = (itemId, change) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + change);
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Cart Sidebar */}
      <div className="fixed top-0 right-0 w-[501px] max-w-[90vw] bg-white z-50 shadow-lg transform transition-transform duration-300 ease-out overflow-y-auto">
        
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="font-montserrat font-normal text-2xl text-gray-950">
            My Bag
          </h1>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close cart"
          >
            <X size={24} className="text-gray-950" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="p-6 flex flex-col gap-6">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div key={`${item.id}-${item.variant?.value || 'novariant'}-${index}`} className="flex gap-6">
                {/* Product Image */}
                <div className="w-[71px] h-[71px] bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col gap-3">
                  {/* Product Name */}
                  <h3 className="font-montserrat font-normal text-sm text-gray-950 line-clamp-2">
                    {item.name}
                  </h3>

                  {/* Variant Info */}
                  {item.variantLabel && (
                    <p className="text-xs font-montserrat text-gray-500">
                      Variant: {item.variantLabel}
                    </p>
                  )}

                  {/* Quantity Controls and Price */}
                  <div className="flex items-center justify-between">
                    {/* Quantity Control */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="flex items-center justify-center w-6 h-6 hover:bg-gray-200 rounded transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} className="text-gray-950" />
                      </button>
                      <span className="w-6 text-center font-montserrat text-sm text-gray-950">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="flex items-center justify-center w-6 h-6 hover:bg-gray-200 rounded transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} className="text-gray-950" />
                      </button>
                    </div>

                    {/* Price */}
                    <span className="font-montserrat font-medium text-base text-gray-950">
                      €{(getAdjustedPrice(item) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors font-montserrat font-medium text-sm uppercase"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 font-montserrat">Your bag is empty</p>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-300 mx-6"></div>

        {/* Summary Section */}
        <div className="p-6 flex flex-col gap-5">
          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <span className="font-montserrat font-normal text-base text-gray-950">
              Subtotal
            </span>
            <span className="font-montserrat font-medium text-base text-gray-950">
              €{subtotal.toFixed(2)}
            </span>
          </div>

          {/* Delivery */}
          <div className="flex items-center justify-between">
            <span className="font-montserrat font-normal text-base text-gray-950">
              Delivery
            </span>
            <span className="font-montserrat font-medium text-base text-gray-950">
              €{delivery.toFixed(2)}
            </span>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-300"></div>

          {/* Total */}
          <div className="flex items-center justify-between pt-2">
            <span className="font-montserrat font-medium text-base text-gray-950">
              Total
            </span>
            <span className="font-montserrat font-medium text-2xl text-gray-950">
              €{total.toFixed(2)}
            </span>
          </div>

          {/* Purchase Button */}
          <button 
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full mt-4 bg-gray-950 text-white font-montserrat font-medium text-base uppercase py-3 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Purchase
          </button>
        </div>
      </div>
    </>
  );
}
