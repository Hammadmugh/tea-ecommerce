import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllProducts } from '../services/productApi'
import { Loader } from 'lucide-react'

const CollectionsPage = () => {
  const [allApiProducts, setAllApiProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [expandedFilters, setExpandedFilters] = useState({
    collections: true,
    origin: false,
    flavour: false,
    qualities: false,
    caffeine: false,
    allergens: false,
  })

  const [selectedFilters, setSelectedFilters] = useState({
    collections: ['chai'],
    origin: [],
    flavour: [],
    qualities: [],
    caffeine: [],
    allergens: [],
  })

  const [sortBy, setSortBy] = useState('newest')
  const [isOrganic, setIsOrganic] = useState(false)

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await getAllProducts()
        if (response.success) {
          setAllApiProducts(response.data)
        }
        setError(null)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products')
        setAllApiProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const toggleFilter = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }))
  }

  const toggleCheckbox = (filterName, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: prev[filterName].includes(value)
        ? prev[filterName].filter(item => item !== value)
        : [...prev[filterName], value]
    }))
  }

  const filterOptions = {
    collections: ['Black teas', 'Green teas', 'White teas', 'Chai', 'Matcha', 'Herbal teas', 'Oolong', 'Rooibos', 'Teaware'],
    origin: ['India', 'Japan', 'Iran', 'South Africa'],
    flavour: ['Spicy', 'Sweet', 'Citrus', 'Smooth', 'Fruity', 'Floral', 'Grassy', 'Minty', 'Bitter', 'Creamy'],
    qualities: ['Detox', 'Energy', 'Relax', 'Digestion'],
    caffeine: ['No Caffeine', 'Low Caffeine', 'Medium Caffeine', 'High Caffeine'],
    allergens: ['Lactose-free', 'Gluten-free', 'Nuts-free', 'Soy-free'],
  }

  // Transform API products for display
  const products = allApiProducts.map(product => ({
    _id: product._id,
    slug: product.slug,
    name: product.name.replace(' ', '\n'),
    price: product.basePrice,
    image: product.image,
    category: product.category
  }))

  const FilterSection = ({ title, filterKey }) => (
    <div className="flex flex-col gap-3 py-3 border-b border-gray-300">
      <button
        onClick={() => toggleFilter(filterKey)}
        className="flex justify-between items-center w-full hover:opacity-70 transition-opacity"
      >
        <span className="text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
          {title}
        </span>
        <span className="text-2xl text-gray-950 transition-transform">
          {expandedFilters[filterKey] ? '−' : '+'}
        </span>
      </button>
      {expandedFilters[filterKey] && (
        <div className="flex flex-col gap-2 pl-0">
          {filterOptions[filterKey]?.map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
              <input
                type="checkbox"
                checked={selectedFilters[filterKey].includes(option.toLowerCase())}
                onChange={() => toggleCheckbox(filterKey, option.toLowerCase())}
                className="w-4 h-4 border border-gray-950 rounded accent-gray-950 cursor-pointer"
              />
              <span className="text-sm font-montserrat font-normal text-gray-950">
                {option}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Header Section */}
      <section className="w-full bg-white">
        <div className="w-full h-64 md:h-96 bg-gray-200 overflow-hidden flex items-center justify-center">
          <img 
            src="/collection-header-img.png" 
            alt="Collections Header"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Products Section with Filters */}
      <section className="w-full bg-white">
        <div className="flex flex-col md:flex-row gap-8 px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto">
          
          {/* Left Sidebar - Filters */}
          <div className="hidden md:flex md:w-1/4 lg:w-1/5 flex-col gap-6">
            {/* Filter Title */}
            <div className="flex flex-col">
              <h2 className="text-lg font-montserrat font-medium text-gray-950 uppercase tracking-wider">
                Filters
              </h2>
            </div>

            {/* Collections Filter */}
            <FilterSection title="Collections" filterKey="collections" />

            {/* Origin Filter */}
            <FilterSection title="Origin" filterKey="origin" />

            {/* Flavour Filter */}
            <FilterSection title="Flavor" filterKey="flavour" />

            {/* Qualities Filter */}
            <FilterSection title="Qualities" filterKey="qualities" />

            {/* Caffeine Filter */}
            <FilterSection title="Caffeine" filterKey="caffeine" />

            {/* Allergens Filter */}
            <FilterSection title="Allergens" filterKey="allergens" />

            {/* Organic Toggle */}
            <div className="flex items-center justify-between py-4">
              <span className="text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
                Organic
              </span>
              <button
                onClick={() => setIsOrganic(!isOrganic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isOrganic ? 'bg-gray-950' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    isOrganic ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Right Side - Products */}
          <div className="w-full md:w-3/4 lg:w-4/5 flex flex-col gap-8">
            
            {/* Sort Dropdown */}
            <div className="flex justify-end items-center gap-4">
              <label className="text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-950 font-montserrat cursor-pointer hover:border-gray-950 transition-colors appearance-none pr-8"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex items-center justify-center min-h-96">
                <Loader className="animate-spin text-gray-950" size={40} />
                <p className="ml-4 text-gray-600 font-montserrat">Loading products...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center min-h-96 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800 font-montserrat">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex items-center justify-center min-h-96">
                <p className="text-gray-600 font-montserrat">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/collections/${product.category}/${product.slug}`}
                    className="flex flex-col items-center gap-3 group no-underline"
                  >
                    {/* Product Image */}
                    <div className="w-full aspect-square bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col items-center gap-2 w-full">
                      <h3 className="text-sm md:text-base font-montserrat font-normal text-gray-950 text-center leading-relaxed whitespace-pre-line">
                        {product.name}
                      </h3>
                      <p className="text-base font-montserrat font-medium text-gray-950 tracking-wider">
                        €{product.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

          </div>

        </div>
      </section>
    </>
  )
}

export default CollectionsPage