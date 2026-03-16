import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderApi';
import { getAllProducts } from "../data/products";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('credit_card');

  const getRecommendedProducts = () => {
    const allProducts = getAllProducts();
    const shuffled = allProducts.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  const recommendedProducts = getRecommendedProducts();
  
  // Payment method mapping: display label -> backend value
  const paymentMethods = {
    visa: 'credit_card',
    mastercard: 'credit_card',
    maestro: 'debit_card',
    ideal: 'debit_card'
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deliveryForm, setDeliveryForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  // Calculate price based on variant weight
  const getAdjustedPrice = (item) => {
    // Debug: Check what we're getting
    const hasVariant = !!item.variant;
    const variantValue = item.variant?.value;
    
    // If no variant, return base price
    if (!item.variant) {
      return item.price;
    }
    
    // Extract variant value and convert to string
    const variantStr = String(variantValue || '').trim();
    
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
    
    const finalPrice = item.price * multiplier;
    
    // Log this only once per render to avoid spam
    if (!window.loggedItems) window.loggedItems = new Set();
    const itemKey = `${item.id}-${item.variant?.value}`;
    if (!window.loggedItems.has(itemKey)) {
      console.log(`💰 ${item.name} [${variantStr}]: ${item.price} * ${multiplier} = ${finalPrice}`);
      window.loggedItems.add(itemKey);
    }
    
    return finalPrice;
  };

  const subtotal = items.reduce((sum, item) => sum + (getAdjustedPrice(item) * item.quantity), 0);
  const delivery = items.length > 0 ? 3.95 : 0;
  const total = subtotal + delivery;

  const handleDeliverySubmit = (e) => {
    e.preventDefault();
    if (deliveryForm.name && deliveryForm.email && deliveryForm.address) {
      setCurrentStep(3);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleOrderSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to place an order. Please log in first.');
        return;
      }

      console.log('🛒 Cart items in checkout:', items);
      
      if (!items || items.length === 0) {
        setError('Cart is empty');
        console.error('❌ Cart is empty');
        return;
      }

      // Create items with adjusted prices based on variants
      const adjustedItems = items.map(item => ({
        ...item,
        price: getAdjustedPrice(item)
      }));

      const orderData = {
        shippingAddress: {
          fullName: deliveryForm.name,
          email: deliveryForm.email,
          phone: deliveryForm.phone,
          address: deliveryForm.address,
          city: deliveryForm.city,
          postalCode: deliveryForm.postalCode,
          country: deliveryForm.country
        },
        paymentMethod: paymentMethods[selectedPayment] || selectedPayment
      };

      console.log('📤 Placing order with', adjustedItems.length, 'items');
      // Pass adjusted items with correct prices
      const response = await createOrder(orderData, adjustedItems);
      
      if (response.success) {
        alert(`Order placed successfully!\nOrder ID: ${response.orderId}\nTotal: €${total.toFixed(2)}`);
        clearCart();
        navigate('/');
      } else {
        setError(response.message || 'Failed to place order');
      }
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err?.message || err?.error || 'Failed to place order. Please try again.';
      setError(errorMsg);
      console.error('Order submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-8">
            {/* Step 1 */}
            <div className="flex items-center gap-4">
              <span className={`text-xl font-montserrat font-normal ${currentStep >= 1 ? 'text-gray-950' : 'text-gray-400'}`}>
                1. MY BAG
              </span>
              <div className={`w-64 h-0.5 ${currentStep >= 2 ? 'bg-gray-950' : 'bg-gray-300'}`}></div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-4">
              <span className={`text-xl font-montserrat font-normal ${currentStep >= 2 ? 'text-gray-950' : 'text-gray-400'}`}>
                2. DELIVERY
              </span>
              <div className={`w-64 h-0.5 ${currentStep >= 3 ? 'bg-gray-950' : 'bg-gray-300'}`}></div>
            </div>

            {/* Step 3 */}
            <span className={`text-xl font-montserrat font-normal ${currentStep >= 3 ? 'text-gray-950' : 'text-gray-400'}`}>
              3. REVIEW & PAYMENT
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Cart Items / Delivery Form */}
          <div className="col-span-2">
            {currentStep === 1 && (
              <>
                {/* My Bag Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-montserrat font-normal uppercase text-gray-950 mb-8">My Bag</h2>
                  
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <div key={`${item.id}-${item.variant?.value || 'novariant'}-${index}`} className="flex gap-6 pb-6 border-b border-gray-300">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col gap-3">
                          <h3 className="font-montserrat font-normal text-sm text-gray-950">
                            {item.name}
                          </h3>
                          {item.variantLabel && (
                            <p className="text-xs font-montserrat text-gray-500">
                              Size: {item.variantLabel}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                              <span className="font-montserrat text-sm text-gray-950">
                                Qty: {item.quantity}
                              </span>
                              <span className="font-montserrat text-xs text-gray-500">
                                €{getAdjustedPrice(item).toFixed(2)} each
                              </span>
                            </div>
                            <span className="font-montserrat font-medium text-base text-gray-950">
                              €{(getAdjustedPrice(item) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Your bag is empty</p>
                  )}

                  {/* Continue Shopping Button */}
                  <button
                    onClick={() => navigate('/collections')}
                    className="border border-gray-950 px-6 py-3 font-montserrat font-medium text-base uppercase text-gray-950 hover:bg-gray-950 hover:text-white transition-colors mt-8"
                  >
                    BACK TO SHOPPING
                  </button>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                {/* Delivery Form */}
                <form onSubmit={handleDeliverySubmit} className="space-y-6">
                  <h2 className="text-2xl font-montserrat font-normal uppercase text-gray-950 mb-8">Delivery Address</h2>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={deliveryForm.name}
                      onChange={(e) => setDeliveryForm({...deliveryForm, name: e.target.value})}
                      className="border border-gray-300 px-4 py-3 font-montserrat text-base"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      value={deliveryForm.email}
                      onChange={(e) => setDeliveryForm({...deliveryForm, email: e.target.value})}
                      className="border border-gray-300 px-4 py-3 font-montserrat text-base"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      required
                      value={deliveryForm.phone}
                      onChange={(e) => setDeliveryForm({...deliveryForm, phone: e.target.value})}
                      className="border border-gray-300 px-4 py-3 font-montserrat text-base"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      required
                      value={deliveryForm.country}
                      onChange={(e) => setDeliveryForm({...deliveryForm, country: e.target.value})}
                      className="border border-gray-300 px-4 py-3 font-montserrat text-base"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Address"
                    required
                    value={deliveryForm.address}
                    onChange={(e) => setDeliveryForm({...deliveryForm, address: e.target.value})}
                    className="border border-gray-300 px-4 py-3 font-montserrat text-base w-full"
                  />

                  <div className="grid grid-cols-3 gap-6">
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={deliveryForm.city}
                      onChange={(e) => setDeliveryForm({...deliveryForm, city: e.target.value})}
                      className="border border-gray-300 px-4 py-3 font-montserrat text-base"
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      required
                      value={deliveryForm.postalCode}
                      onChange={(e) => setDeliveryForm({...deliveryForm, postalCode: e.target.value})}
                      className="border border-gray-300 px-4 py-3 font-montserrat text-base col-span-2"
                    />
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="border border-gray-950 px-6 py-3 font-montserrat font-medium text-base uppercase text-gray-950 hover:bg-gray-950 hover:text-white transition-colors"
                    >
                      BACK
                    </button>
                    <button
                      type="submit"
                      className="bg-gray-950 text-white px-6 py-3 font-montserrat font-medium text-base uppercase hover:bg-gray-800 transition-colors"
                    >
                      CONTINUE TO PAYMENT
                    </button>
                  </div>
                </form>
              </>
            )}

            {currentStep === 3 && (
              <>
                {/* Review & Payment */}
                <div className="space-y-8">
                  <h2 className="text-2xl font-montserrat font-normal uppercase text-gray-950 mb-8">Review & Payment</h2>
                  
                  {/* Order Summary Review */}
                  <div>
                    <h3 className="text-lg font-montserrat font-medium mb-4">Order Summary</h3>
                    {items.map((item, index) => (
                      <div key={`${item.id}-${item.variant?.value || 'novariant'}-${index}`} className="flex justify-between mb-2">
                        <span className="font-montserrat text-sm text-gray-950">{item.name} x {item.quantity}</span>
                        <span className="font-montserrat font-medium text-gray-950">€{(getAdjustedPrice(item) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Info Review */}
                  <div>
                    <h3 className="text-lg font-montserrat font-medium mb-4">Delivery Address</h3>
                    <p className="font-montserrat text-sm text-gray-950">
                      {deliveryForm.name}<br/>
                      {deliveryForm.address}<br/>
                      {deliveryForm.city}, {deliveryForm.postalCode}<br/>
                      {deliveryForm.country}<br/>
                      {deliveryForm.email}
                    </p>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <h3 className="text-lg font-montserrat font-medium mb-4">Payment Method</h3>
                    <div className="flex gap-4">
                      {Object.entries({
                        visa: '/payment method 1.png',
                        mastercard: '/payment method 2.png',
                        maestro: '/payment method 3.png',
                        ideal: '/payment method 4.png'
                      }).map(([method, imagePath]) => (
                        <button
                          key={method}
                          onClick={() => setSelectedPayment(method)}
                          className={`w-20 h-16 rounded border-2 transition-colors flex items-center justify-center overflow-hidden ${
                            selectedPayment === method
                              ? 'bg-gray-950 border-gray-950'
                              : 'bg-gray-100 border-gray-300 hover:border-gray-950'
                          }`}
                        >
                          <img
                            src={imagePath}
                            alt={method}
                            className="w-full h-full object-contain p-1"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-50 p-6 rounded">
                    <h3 className="text-lg font-montserrat font-medium mb-4">Delivery Information</h3>
                    <ul className="space-y-3 font-montserrat text-sm text-gray-950">
                      <li>• Order before 12:00 and we will ship the same day.</li>
                      <li>• Orders made after Friday 12:00 are processed on Monday.</li>
                      <li>• To return your articles, please contact us first.</li>
                      <li>• Postal charges for retour are not reimbursed.</li>
                    </ul>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="border border-gray-950 px-6 py-3 font-montserrat font-medium text-base uppercase text-gray-950 hover:bg-gray-950 hover:text-white transition-colors"
                    >
                      BACK
                    </button>
                    <button
                      onClick={handleOrderSubmit}
                      disabled={isLoading}
                      className="bg-gray-950 text-white px-6 py-3 font-montserrat font-medium text-base uppercase hover:bg-gray-800 transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'PROCESSING...' : 'PLACE ORDER'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="col-span-1">
            <div className="bg-gray-100 p-8 rounded sticky top-24">
              <h3 className="text-xl font-montserrat font-normal uppercase text-gray-950 mb-6">Order Summary</h3>
              
              {/* Subtotal */}
              <div className="flex justify-between mb-4 pb-4 border-b border-gray-300">
                <span className="font-montserrat font-normal text-base text-gray-950">Subtotal</span>
                <span className="font-montserrat font-medium text-base text-gray-950">€{subtotal.toFixed(2)}</span>
              </div>

              {/* Delivery */}
              <div className="flex justify-between mb-4 pb-4 border-b border-gray-300">
                <span className="font-montserrat font-normal text-base text-gray-950">Delivery</span>
                <span className="font-montserrat font-medium text-base text-gray-950">€{delivery.toFixed(2)}</span>
              </div>

              {/* Total */}
              <div className="flex justify-between mb-6">
                <span className="font-montserrat font-medium text-base text-gray-950">Total</span>
                <span className="font-montserrat font-medium text-2xl text-gray-950">€{total.toFixed(2)}</span>
              </div>

              {/* Estimated Shipping */}
              <p className="font-montserrat font-normal text-base text-gray-700 opacity-70 mb-6">
                Estimated shipping time: 2 days
              </p>

              {/* Step Navigation */}
              {currentStep < 3 && (
                <button
                  onClick={() => {
                    if (currentStep === 1) {
                      setCurrentStep(2);
                    }
                  }}
                  className="w-full bg-gray-950 text-white py-4 font-montserrat font-medium text-base uppercase hover:bg-gray-800 transition-colors"
                >
                  {currentStep === 1 ? 'CONTINUE TO DELIVERY' : 'CONTINUE'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* You May Also Like Section */}
            <section className="w-full bg-white">
              <div className="flex flex-col items-center gap-10 px-4 md:px-8 py-16 md:py-20 max-w-7xl mx-auto">
                {/* Section Title */}
                <h2 className="text-4xl md:text-5xl font-prosto-one font-normal text-gray-950 text-center">
                  Popular this season
                </h2>
      
                {/* Products Grid */}
                <div className="max-w-[1180px] mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {recommendedProducts.map((recProduct) => (
                      <Link
                        key={recProduct.id}
                        to={`/collections/${recProduct.collection}/${recProduct.slug}`}
                        className="flex flex-col items-center gap-2 group no-underline"
                      >
                        {/* Product Image */}
                        <div className="w-full aspect-square bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer">
                          <img
                            src={recProduct.image}
                            alt={recProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        {/* Product Info */}
                        <div className="flex flex-col items-center gap-2">
                          <h3 className="text-base font-montserrat font-normal text-gray-950 text-center">
                            {recProduct.name}
                          </h3>
                          <p className="text-base font-montserrat font-medium text-gray-950">
                            {recProduct.price}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>

      <Footer />
    </div>
  );
}
