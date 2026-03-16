import React, { useState } from 'react';
import { createProduct, createVariant } from '../../services/productApi';
import { AlertCircle, Plus, X } from 'lucide-react';

export default function ProductManagement() {
  const [activeTab, setActiveTab] = useState('add-product');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'chai',
    basePrice: '',
    image: '',
    flavor: '',
    qualities: '',
    caffeine: 'Medium',
    origin: '',
    organic: false,
    vegan: false,
    allergens: ''
  });

  // Variant form state
  const [variantForm, setVariantForm] = useState({
    productId: '',
    label: '',
    value: '',
    priceAdjustment: '',
    absolutePrice: '',
    stock: '',
    sku: ''
  });

  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setVariantForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!productForm.name || !productForm.slug || !productForm.description || !productForm.basePrice || !productForm.image) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await createProduct(productForm);
      
      if (response.success) {
        setSuccess('Product created successfully!');
        // Reset form
        setProductForm({
          name: '',
          slug: '',
          description: '',
          category: 'chai',
          basePrice: '',
          image: '',
          flavor: '',
          qualities: '',
          caffeine: 'Medium',
          origin: '',
          organic: false,
          vegan: false,
          allergens: ''
        });
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!variantForm.productId || !variantForm.label || !variantForm.value || !variantForm.stock) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await createVariant(variantForm.productId, {
        label: variantForm.label,
        value: variantForm.value,
        priceAdjustment: variantForm.priceAdjustment || 0,
        absolutePrice: variantForm.absolutePrice,
        stock: variantForm.stock,
        sku: variantForm.sku
      });

      if (response.success) {
        setSuccess('Variant created successfully!');
        setVariantForm({
          productId: '',
          label: '',
          value: '',
          priceAdjustment: '',
          absolutePrice: '',
          stock: '',
          sku: ''
        });
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to create variant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white text-sm">✓</div>
          <p className="text-green-800 font-montserrat">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" />
          <p className="text-red-800 font-montserrat">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('add-product')}
            className={`flex-1 px-4 py-3 font-montserrat font-medium text-sm ${
              activeTab === 'add-product'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Add Product
          </button>
          <button
            onClick={() => setActiveTab('add-variant')}
            className={`flex-1 px-4 py-3 font-montserrat font-medium text-sm ${
              activeTab === 'add-variant'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Add Variant
          </button>
        </div>

        <div className="p-6">
          {/* Add Product Tab */}
          {activeTab === 'add-product' && (
            <form onSubmit={handleAddProduct} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductChange}
                    placeholder="e.g., Premium Black Tea"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={productForm.slug}
                    onChange={handleProductChange}
                    placeholder="e.g., premium-black-tea"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleProductChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="chai">Chai</option>
                    <option value="black">Black</option>
                    <option value="green">Green</option>
                    <option value="herbal">Herbal</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                {/* Base Price */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Base Price (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="basePrice"
                    value={productForm.basePrice}
                    onChange={handleProductChange}
                    placeholder="e.g., 5.99"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Image */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={productForm.image}
                    onChange={handleProductChange}
                    placeholder="e.g., /tea-image.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductChange}
                    placeholder="Product description"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Flavor */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Flavor
                  </label>
                  <input
                    type="text"
                    name="flavor"
                    value={productForm.flavor}
                    onChange={handleProductChange}
                    placeholder="e.g., Rich, Bold"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Qualities */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Qualities
                  </label>
                  <input
                    type="text"
                    name="qualities"
                    value={productForm.qualities}
                    onChange={handleProductChange}
                    placeholder="e.g., Energy Boost"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Caffeine */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Caffeine Level
                  </label>
                  <select
                    name="caffeine"
                    value={productForm.caffeine}
                    onChange={handleProductChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Origin */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Origin
                  </label>
                  <input
                    type="text"
                    name="origin"
                    value={productForm.origin}
                    onChange={handleProductChange}
                    placeholder="e.g., India"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Allergens */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Allergens
                  </label>
                  <input
                    type="text"
                    name="allergens"
                    value={productForm.allergens}
                    onChange={handleProductChange}
                    placeholder="e.g., Nuts-free"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Organic */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="organic"
                    name="organic"
                    checked={productForm.organic}
                    onChange={handleProductChange}
                    className="w-4 h-4 border border-gray-300 rounded"
                  />
                  <label htmlFor="organic" className="text-sm font-montserrat text-gray-700">
                    Organic
                  </label>
                </div>

                {/* Vegan */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="vegan"
                    name="vegan"
                    checked={productForm.vegan}
                    onChange={handleProductChange}
                    className="w-4 h-4 border border-gray-300 rounded"
                  />
                  <label htmlFor="vegan" className="text-sm font-montserrat text-gray-700">
                    Vegan
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-montserrat font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Product'}
              </button>
            </form>
          )}

          {/* Add Variant Tab */}
          {activeTab === 'add-variant' && (
            <form onSubmit={handleAddVariant} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product ID */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Product ID *
                  </label>
                  <input
                    type="text"
                    name="productId"
                    value={variantForm.productId}
                    onChange={handleVariantChange}
                    placeholder="Paste the product MongoDB ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Get this from the product response after creation</p>
                </div>

                {/* Label */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Label *
                  </label>
                  <input
                    type="text"
                    name="label"
                    value={variantForm.label}
                    onChange={handleVariantChange}
                    placeholder="e.g., 50g Bag"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Value */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Value *
                  </label>
                  <input
                    type="text"
                    name="value"
                    value={variantForm.value}
                    onChange={handleVariantChange}
                    placeholder="e.g., 50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Price Adjustment */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Price Adjustment (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="priceAdjustment"
                    value={variantForm.priceAdjustment}
                    onChange={handleVariantChange}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Absolute Price */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Absolute Price (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="absolutePrice"
                    value={variantForm.absolutePrice}
                    onChange={handleVariantChange}
                    placeholder="e.g., 5.99"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={variantForm.stock}
                    onChange={handleVariantChange}
                    placeholder="e.g., 100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-montserrat font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={variantForm.sku}
                    onChange={handleVariantChange}
                    placeholder="e.g., BLK-TEA-50G"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-montserrat font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Variant'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-montserrat text-blue-900">
          <strong>Note:</strong> After creating a product, copy its ID to add variants. Variants represent different sizes/weights of the same product.
        </p>
      </div>
    </div>
  );
}
