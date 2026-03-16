import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import Variant from '../models/varientModel.js';
import dotenv from 'dotenv';

dotenv.config();

const productsData = [
  {
    id: 1,
    name: 'Ceylon Ginger Cinnamon chai tea',
    slug: 'ceylon-ginger-cinnamon-chai-tea',
    description: 'A lovely warming Chai tea with ginger cinnamon flavours.',
    price: '€3.90',
    origin: 'Iran',
    organic: true,
    vegan: true,
    image: '/tea collection (1).png',
    collection: 'chai',
    steeping: {
      servingSize: '2 tsp per cup, 6 tsp per pot',
      temperature: '100°C',
      time: '3 - 5 minutes',
      colorAfter3Min: '#BC575F'
    },
    flavor: 'Spicy',
    qualities: 'Smoothing',
    caffeine: 'Medium',
    allergens: 'Nuts-free',
    ingredients: 'Black Ceylon tea, Green tea, Ginger root, Cloves, Black pepper, Cinnamon sticks, Cardamom, Cinnamon pieces.',
    variants: [
      { image: '/packaging (1).png', label: '50 g bag', value: '50' },
      { image: '/packaging (2).png', label: '100 g bag', value: '100' },
      { image: '/packaging (3).png', label: '170 g bag', value: '170' },
      { image: '/packaging (4).png', label: '250 g bag', value: '250' },
      { image: '/packaging (5).png', label: '1 kg g bag', value: '1kg' },
      { image: '/packaging (6).png', label: 'Sampler', value: 'sampler' },
    ]
  },
  {
    id: 2,
    name: 'Ceylon Ginger Cinnamon chai tea - India',
    slug: 'ceylon-ginger-cinnamon-chai-tea-2',
    description: 'A lovely warming Chai tea with ginger cinnamon flavours.',
    price: '€4.85 / 50 g',
    origin: 'India',
    organic: true,
    vegan: true,
    image: '/tea collection (2).png',
    collection: 'chai',
    steeping: {
      servingSize: '2 tsp per cup, 6 tsp per pot',
      temperature: '100°C',
      time: '3 - 5 minutes',
      colorAfter3Min: '#BC575F'
    },
    flavor: 'Spicy',
    qualities: 'Smoothing',
    caffeine: 'Medium',
    allergens: 'Nuts-free',
    ingredients: 'Black Ceylon tea, Green tea, Ginger root, Cloves, Black pepper, Cinnamon sticks, Cardamom, Cinnamon pieces.',
    variants: [
      { image: '/packaging (1).png', label: '50 g bag', value: '50' },
      { image: '/packaging (2).png', label: '100 g bag', value: '100' },
      { image: '/packaging (3).png', label: '170 g bag', value: '170' },
      { image: '/packaging (4).png', label: '250 g bag', value: '250' },
      { image: '/packaging (5).png', label: '1 kg g bag', value: '1kg' },
      { image: '/packaging (6).png', label: 'Sampler', value: 'sampler' },
    ]
  },
  {
    id: 3,
    name: 'Ceylon Ginger Cinnamon chai tea - Japan',
    slug: 'ceylon-ginger-cinnamon-chai-tea-3',
    description: 'A lovely warming Chai tea with ginger cinnamon flavours.',
    price: '€4.85 / 50 g',
    origin: 'Japan',
    organic: false,
    vegan: true,
    image: '/tea collection (3).png',
    collection: 'chai',
    steeping: {
      servingSize: '2 tsp per cup, 6 tsp per pot',
      temperature: '100°C',
      time: '3 - 5 minutes',
      colorAfter3Min: '#BC575F'
    },
    flavor: 'Spicy',
    qualities: 'Smoothing',
    caffeine: 'Medium',
    allergens: 'Nuts-free',
    ingredients: 'Black Ceylon tea, Green tea, Ginger root, Cloves, Black pepper, Cinnamon sticks, Cardamom, Cinnamon pieces.',
    variants: [
      { image: '/packaging (1).png', label: '50 g bag', value: '50' },
      { image: '/packaging (2).png', label: '100 g bag', value: '100' },
      { image: '/packaging (3).png', label: '170 g bag', value: '170' },
      { image: '/packaging (4).png', label: '250 g bag', value: '250' },
      { image: '/packaging (5).png', label: '1 kg g bag', value: '1kg' },
      { image: '/packaging (6).png', label: 'Sampler', value: 'sampler' },
    ]
  },
  {
    id: 4,
    name: 'Ceylon Ginger Cinnamon chai tea - South Africa',
    slug: 'ceylon-ginger-cinnamon-chai-tea-4',
    description: 'A lovely warming Chai tea with ginger cinnamon flavours.',
    price: '€4.85 / 50 g',
    origin: 'South Africa',
    organic: true,
    vegan: true,
    image: '/tea collection (4).png',
    collection: 'chai',
    steeping: {
      servingSize: '2 tsp per cup, 6 tsp per pot',
      temperature: '100°C',
      time: '3 - 5 minutes',
      colorAfter3Min: '#BC575F'
    },
    flavor: 'Spicy',
    qualities: 'Smoothing',
    caffeine: 'Medium',
    allergens: 'Nuts-free',
    ingredients: 'Black Ceylon tea, Green tea, Ginger root, Cloves, Black pepper, Cinnamon sticks, Cardamom, Cinnamon pieces.',
    variants: [
      { image: '/packaging (1).png', label: '50 g bag', value: '50' },
      { image: '/packaging (2).png', label: '100 g bag', value: '100' },
      { image: '/packaging (3).png', label: '170 g bag', value: '170' },
      { image: '/packaging (4).png', label: '250 g bag', value: '250' },
      { image: '/packaging (5).png', label: '1 kg g bag', value: '1kg' },
      { image: '/packaging (6).png', label: 'Sampler', value: 'sampler' },
    ]
  },
  {
    id: 5,
    name: 'Ceylon Ginger Cinnamon chai tea - Premium',
    slug: 'ceylon-ginger-cinnamon-chai-tea-5',
    description: 'A lovely warming Chai tea with ginger cinnamon flavours.',
    price: '€4.85 / 50 g',
    origin: 'Iran',
    organic: false,
    vegan: false,
    image: '/tea collection (5).png',
    collection: 'chai',
    steeping: {
      servingSize: '2 tsp per cup, 6 tsp per pot',
      temperature: '100°C',
      time: '3 - 5 minutes',
      colorAfter3Min: '#BC575F'
    },
    flavor: 'Spicy',
    qualities: 'Smoothing',
    caffeine: 'Medium',
    allergens: 'Nuts-free',
    ingredients: 'Black Ceylon tea, Green tea, Ginger root, Cloves, Black pepper, Cinnamon sticks, Cardamom, Cinnamon pieces.',
    variants: [
      { image: '/packaging (1).png', label: '50 g bag', value: '50' },
      { image: '/packaging (2).png', label: '100 g bag', value: '100' },
      { image: '/packaging (3).png', label: '170 g bag', value: '170' },
      { image: '/packaging (4).png', label: '250 g bag', value: '250' },
      { image: '/packaging (5).png', label: '1 kg g bag', value: '1kg' },
      { image: '/packaging (6).png', label: 'Sampler', value: 'sampler' },
    ]
  },
  {
    id: 6,
    name: 'Ceylon Ginger Cinnamon chai tea - Mix',
    slug: 'ceylon-ginger-cinnamon-chai-tea-6',
    description: 'A lovely warming Chai tea with ginger cinnamon flavours.',
    price: '€4.85 / 50 g',
    origin: 'India',
    organic: true,
    vegan: true,
    image: '/tea collection (6).png',
    collection: 'chai',
    steeping: {
      servingSize: '2 tsp per cup, 6 tsp per pot',
      temperature: '100°C',
      time: '3 - 5 minutes',
      colorAfter3Min: '#BC575F'
    },
    flavor: 'Spicy',
    qualities: 'Smoothing',
    caffeine: 'Medium',
    allergens: 'Nuts-free',
    ingredients: 'Black Ceylon tea, Green tea, Ginger root, Cloves, Black pepper, Cinnamon sticks, Cardamom, Cinnamon pieces.',
    variants: [
      { image: '/packaging (1).png', label: '50 g bag', value: '50' },
      { image: '/packaging (2).png', label: '100 g bag', value: '100' },
      { image: '/packaging (3).png', label: '170 g bag', value: '170' },
      { image: '/packaging (4).png', label: '250 g bag', value: '250' },
      { image: '/packaging (5).png', label: '1 kg g bag', value: '1kg' },
      { image: '/packaging (6).png', label: 'Sampler', value: 'sampler' },
    ]
  },
  {
    id: 7,
    name: 'Ceylon Ginger Cinnamon chai tea - Deluxe',
    slug: 'ceylon-ginger-cinnamon-chai-tea-7',
    description: 'A lovely warming Chai tea with ginger cinnamon flavours.',
    price: '€4.85 / 50 g',
    origin: 'Japan',
    organic: true,
    vegan: true,
    image: '/tea collection (7).png',
    collection: 'chai',
    steeping: {
      servingSize: '2 tsp per cup, 6 tsp per pot',
      temperature: '100°C',
      time: '3 - 5 minutes',
      colorAfter3Min: '#BC575F'
    },
    flavor: 'Spicy',
    qualities: 'Smoothing',
    caffeine: 'Medium',
    allergens: 'Nuts-free',
    ingredients: 'Black Ceylon tea, Green tea, Ginger root, Cloves, Black pepper, Cinnamon sticks, Cardamom, Cinnamon pieces.',
    variants: [
      { image: '/packaging (1).png', label: '50 g bag', value: '50' },
      { image: '/packaging (2).png', label: '100 g bag', value: '100' },
      { image: '/packaging (3).png', label: '170 g bag', value: '170' },
      { image: '/packaging (4).png', label: '250 g bag', value: '250' },
      { image: '/packaging (5).png', label: '1 kg g bag', value: '1kg' },
      { image: '/packaging (6).png', label: 'Sampler', value: 'sampler' },
    ]
  },
  {
    id: 8,
    name: 'Ceylon Ginger Cinnamon chai tea - Classic',
    slug: 'ceylon-ginger-cinnamon-chai-tea-8',
    description: 'A lovely warming Chai tea with ginger cinnamon flavours.',
    price: '€4.85 / 50 g',
    origin: 'South Africa',
    organic: false,
    vegan: true,
    image: '/tea collection (8).png',
    collection: 'chai',
    steeping: {
      servingSize: '2 tsp per cup, 6 tsp per pot',
      temperature: '100°C',
      time: '3 - 5 minutes',
      colorAfter3Min: '#BC575F'
    },
    flavor: 'Spicy',
    qualities: 'Smoothing',
    caffeine: 'Medium',
    allergens: 'Nuts-free',
    ingredients: 'Black Ceylon tea, Green tea, Ginger root, Cloves, Black pepper, Cinnamon sticks, Cardamom, Cinnamon pieces.',
    variants: [
      { image: '/packaging (1).png', label: '50 g bag', value: '50' },
      { image: '/packaging (2).png', label: '100 g bag', value: '100' },
      { image: '/packaging (3).png', label: '170 g bag', value: '170' },
      { image: '/packaging (4).png', label: '250 g bag', value: '250' },
      { image: '/packaging (5).png', label: '1 kg g bag', value: '1kg' },
      { image: '/packaging (6).png', label: 'Sampler', value: 'sampler' },
    ]
  },
  {
    id: 9,
    name: 'Ceylon Ginger Cinnamon chai tea - Organic',
    slug: 'ceylon-ginger-cinnamon-chai-tea-9',
    description: 'A lovely warming Chai tea with ginger cinnamon flavours.',
    price: '€4.85 / 50 g',
    origin: 'Iran',
    organic: true,
    vegan: true,
    image: '/tea collection (9).png',
    collection: 'chai',
    steeping: {
      servingSize: '2 tsp per cup, 6 tsp per pot',
      temperature: '100°C',
      time: '3 - 5 minutes',
      colorAfter3Min: '#BC575F'
    },
    flavor: 'Spicy',
    qualities: 'Smoothing',
    caffeine: 'Medium',
    allergens: 'Nuts-free',
    ingredients: 'Black Ceylon tea, Green tea, Ginger root, Cloves, Black pepper, Cinnamon sticks, Cardamom, Cinnamon pieces.',
    variants: [
      { image: '/packaging (1).png', label: '50 g bag', value: '50' },
      { image: '/packaging (2).png', label: '100 g bag', value: '100' },
      { image: '/packaging (3).png', label: '170 g bag', value: '170' },
      { image: '/packaging (4).png', label: '250 g bag', value: '250' },
      { image: '/packaging (5).png', label: '1 kg g bag', value: '1kg' },
      { image: '/packaging (6).png', label: 'Sampler', value: 'sampler' },
    ]
  },
];

export const seedProducts = async () => {
  try {
    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    
    if (existingProducts > 0) {
      console.log(`✅ Products already exist (${existingProducts} found). Skipping seed.`);
      return;
    }

    console.log('🌱 Seeding products...');

    // Create products and variants
    for (const productData of productsData) {
      // Extract price as number
      const priceString = productData.price.replace('€', '').split('/')[0].trim();
      const basePrice = parseFloat(priceString) || 0;

      // Create product
      const product = new Product({
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        category: productData.collection,
        basePrice: basePrice,
        image: productData.image,
        flavor: productData.flavor,
        qualities: productData.qualities,
        caffeine: productData.caffeine,
        origin: productData.origin,
        organic: productData.organic,
        vegan: productData.vegan,
        allergens: productData.allergens,
        ingredients: productData.ingredients,
        isActive: true
      });

      await product.save();
      console.log(`✅ Created product: ${productData.name}`);

      // Create variants for this product
      if (productData.variants && productData.variants.length > 0) {
        for (const variantData of productData.variants) {
          const variant = new Variant({
            product: product._id,
            label: variantData.label,
            value: variantData.value,
            stock: 50, // Default stock of 50 per variant
            sku: `${product.slug.toUpperCase()}-${variantData.value}`,
            isAvailable: true
          });

          await variant.save();
          console.log(`  ├─ Created variant: ${variantData.label}`);

          // Add variant to product
          product.variants.push(variant._id);
        }

        await product.save();
      }
    }

    console.log('✅ Database seeded successfully with 9 products and variants!');
  } catch (err) {
    console.error('❌ Error seeding products:', err.message);
  }
};
