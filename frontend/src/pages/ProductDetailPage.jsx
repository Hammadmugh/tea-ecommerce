import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductBySlug, getAllProducts } from "../data/products";
import { useCart } from "../context/CartContext";
import ProductReviewsSection from "../components/ProductReviewsSection";

const ProductDetailPage = () => {
  const { collection, productName } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  // Get product data from slug
  const product = getProductBySlug(productName);
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants[0] || null
  );

  // Calculate price based on selected variant
  const getVariantPrice = (variant) => {
    if (!variant || !product) return product?.price;
    
    const basePrice = typeof product.price === 'string'
      ? parseFloat(product.price.replace(/[€,$]/g, '').trim())
      : product.price;
    
    const variantValue = String(variant.value || variant).trim();
    
    // Base weight is 50g
    if (variantValue === '50') return basePrice;
    if (variantValue === '100') return basePrice * 2;
    if (variantValue === '170') return basePrice * (170 / 50);
    if (variantValue === '250') return basePrice * (250 / 50);
    if (variantValue === '1kg') return basePrice * (1000 / 50);
    if (variantValue === 'sampler') return basePrice * 0.6;
    
    return basePrice;
  };

  const displayPrice = selectedVariant ? getVariantPrice(selectedVariant) : product?.price;
  const priceDisplay = typeof displayPrice === 'number' 
    ? `€${displayPrice.toFixed(2)}` 
    : displayPrice;

  // Get recommended products (3 random products excluding current one)
  const getRecommendedProducts = () => {
    const allProducts = getAllProducts();
    const filtered = allProducts.filter((p) => p.slug !== product?.slug);
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  const recommendedProducts = product ? getRecommendedProducts() : [];

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
    setQuantity(1); // Reset quantity after adding
    
    // Show success message
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000); // Hide after 2 seconds
  };

  // Handle product not found
  if (!product) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-prosto-one font-normal text-gray-950">
            Product Not Found
          </h1>
          <Link
            to="/collections"
            className="text-base font-montserrat font-medium text-gray-950 underline hover:opacity-70"
          >
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb Navigation */}
      <section className="w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <p className="text-sm font-montserrat font-medium text-gray-950 tracking-wider">
            HOME / COLLECTIONS / {collection?.toUpperCase()} /{" "}
            {product.name.toUpperCase()}
          </p>
        </div>
      </section>

      {/* Product Detail Section */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-8 md:gap-20">
            {/* Left Side - Product Image */}
            <div className="w-full md:w-1/2 flex-shrink-0">
              <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Side - Product Details */}
            <div className="w-full md:w-1/2 flex flex-col gap-6">
              {/* Product Title */}
              <h1 className="text-3xl md:text-4xl font-prosto-one font-normal text-gray-950 leading-tight">
                {product.name}
              </h1>

              {/* Product Description */}
              <p className="text-base font-montserrat font-normal text-gray-950 leading-relaxed">
                {product.description}
              </p>

              {/* Product Features */}
              <div className="flex flex-row gap-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0">
                    <img src="/origin-icon.png" alt="" />
                  </div>
                  <span className="text-base font-montserrat font-medium text-gray-950">
                    Origin: {product.origin}
                  </span>
                </div>

                {product.organic && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0">
                      <img src="/certified-icon.png" alt="" />
                    </div>
                    <span className="text-base font-montserrat font-medium text-gray-950">
                      Organic
                    </span>
                  </div>
                )}

                {product.vegan && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0">
                      <img src="/vegan.png" alt="" />
                    </div>
                    <span className="text-base font-montserrat font-medium text-gray-950">
                      Vegan
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-4xl font-prosto-one font-normal text-gray-950">
                {priceDisplay}
              </div>

              {/* Variants */}
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-montserrat font-medium text-gray-950 uppercase">
                  Variants
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.value}
                      onClick={() => setSelectedVariant(variant)}
                      className={`flex flex-col items-center justify-center p-3 border-2 rounded transition-colors ${
                        selectedVariant?.value === variant.value
                          ? "border-[#C3B212] bg-amber-50"
                          : "border-gray-300 hover:border-gray-950"
                      }`}
                    >
                      <div className="w-10 h-10 mb-2">
                        <img src={variant.image} alt="" />
                      </div>
                      <span className="text-xs md:text-sm font-montserrat font-normal text-gray-950 text-center">
                        {variant.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col gap-4 pt-4">
                <div className="flex items-center gap-6">
                  {/* Quantity Selector */}
                  <div className="flex items-center border-2 border-gray-300 rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-950 hover:bg-gray-100 transition-colors text-2xl"
                    >
                      −
                    </button>
                    <div className="px-6 py-2 border-l border-r border-gray-300 text-center font-montserrat font-medium text-xl">
                      {quantity}
                    </div>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-950 hover:bg-gray-100 transition-colors text-2xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Success Message */}
                {addedToCart && (
                  <div className="bg-green-50 border-2 border-green-400 text-green-700 px-6 py-4 rounded font-montserrat font-medium text-center animate-pulse">
                    ✓ Item added to bag successfully!
                  </div>
                )}

                {/* Add to Bag Button */}
                <button
                  onClick={() => {
                    handleAddToCart();
                  }}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-950 hover:bg-black transition-colors px-8 py-4 rounded text-white"
                >
                  <img src="/add-to-bag.png" alt="" />
                  <span className="font-montserrat font-medium uppercase tracking-wider">
                    Add to Bag
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steeping Instructions & About This Tea Section */}
      <section className="w-full bg-[#F4F4F4]">
        <div className="flex flex-col md:flex-row gap-8 md:gap-40 px-4 md:px-20 py-12 md:py-16 max-w-7xl mx-auto">
          {/* Left - Steeping Instructions */}
          <div className="w-full md:w-1/2 flex flex-col gap-8">
            <h2 className="text-4xl font-montserrat font-normal text-gray-950">
              Steeping instructions
            </h2>

            {/* Steeping Details */}
            <div className="flex flex-col gap-8">
              {/* Serving Size */}
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded flex items-center justify-center shrink-0">
                  <img src="/serving.png" alt="" />
                </div>
                <p className="text-base font-montserrat font-medium text-gray-950 tracking-wide">
                  SERVING SIZE: {product.steeping.servingSize}
                </p>
              </div>

              <div className="border-t border-gray-400"></div>

              {/* Water Temperature */}
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded flex items-center justify-center shrink-0">
                  <img src="/water-temp.png" alt="" />
                </div>
                <p className="text-base font-montserrat font-medium text-gray-950 tracking-wide">
                  WATER TEMPERATURE: {product.steeping.temperature}
                </p>
              </div>

              <div className="border-t border-gray-400"></div>

              {/* Steeping Time */}
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded flex items-center justify-center shrink-0">
                  <img src="/sleeping-icon.png" alt="" />
                </div>
                <p className="text-base font-montserrat font-medium text-gray-950 tracking-wide">
                  STEEPING TIME: {product.steeping.time}
                </p>
              </div>

              <div className="border-t border-gray-400"></div>

              {/* Color After 3 Minutes */}
              <div className="flex items-center gap-4">
                <div
                  className="w-6 h-6 rounded-full shrink-0"
                  style={{ backgroundColor: product.steeping.colorAfter3Min }}
                ></div>
                <p className="text-base font-montserrat font-medium text-gray-950 tracking-wide">
                  COLOR AFTER 3 MINUTES
                </p>
              </div>
            </div>
          </div>

          {/* Right - About This Tea */}
          <div className="w-full md:w-1/2 flex flex-col gap-8">
            <h2 className="text-4xl font-montserrat font-normal text-gray-950">
              About this tea
            </h2>

            {/* Tea Attributes */}
            <div className="flex flex-row gap-6 flex-wrap">
              {/* Flavor */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-montserrat font-medium text-gray-950 uppercase">
                  Flavor
                </p>
                <p className="text-base font-montserrat font-normal text-gray-950">
                  {product.flavor}
                </p>
                <div className="w-12 h-px bg-gray-400"></div>
              </div>

              {/* Qualities */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-montserrat font-medium text-gray-950 uppercase">
                  Qualities
                </p>
                <p className="text-base font-montserrat font-normal text-gray-950">
                  {product.qualities}
                </p>
                <div className="w-12 h-px bg-gray-400"></div>
              </div>

              {/* Caffeine */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-montserrat font-medium text-gray-950 uppercase">
                  Caffeine
                </p>
                <p className="text-base font-montserrat font-normal text-gray-950">
                  {product.caffeine}
                </p>
                <div className="w-12 h-px bg-gray-400"></div>
              </div>

              {/* Allergens */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-montserrat font-medium text-gray-950 uppercase">
                  Allergens
                </p>
                <p className="text-base font-montserrat font-normal text-gray-950">
                  {product.allergens}
                </p>
                <div className="w-12 h-px bg-gray-400"></div>
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-4xl font-montserrat font-normal text-gray-950">
                Ingredient
              </h3>
              <p className="text-base font-montserrat font-normal text-gray-950 leading-relaxed">
                {product.ingredients}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* You May Also Like Section */}
      <ProductReviewsSection productId={product.slug} />

      <section className="w-full bg-white">
        <div className="flex flex-col items-center gap-10 px-4 md:px-8 py-16 md:py-20 max-w-7xl mx-auto">
          {/* Section Title */}
          <h2 className="text-4xl md:text-5xl font-prosto-one font-normal text-gray-950 text-center">
            You may also like
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
    </>
  );
};

export default ProductDetailPage;
