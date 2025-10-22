'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { storeThemes } from '@/public/themes';

// ----------------------
// Dummy Store
// ----------------------
const dummyStore = {
  _id: 'store123',
  owner: 'owner123',
  brandName: 'Demo Store',
  domain: 'demo-store.com',
  logoUrl: '',
  theme: storeThemes[0].theme,
};

// ----------------------
// Dummy Product
// ----------------------
const dummyProduct = {
  _id: 'prod123',
  owner: 'owner123',
  name: 'Sample Product',
  slug: 'sample-product',
  description: 'This is a sample product description.',
  price: 29.99,
  discount: 0,
  stock: 10,
  category: 'Sample',
  mainImage: '/logo.png',
  images: ['/logo.png', '/logo.png'],
  sizes: ['S', 'M', 'L'],
  colors: ['#22c55e', '#2563eb'],
  variants: [],
  salesCount: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ----------------------
// Dummy Products Array
// ----------------------
const dummyProducts = Array.from({ length: 8 }).map((_, i) => ({
  ...dummyProduct,
  _id: `prod${i}`,
  name: `Sample Product ${i + 1}`,
}));

// ----------------------
// Theme Preview Page
// ----------------------
export default function ThemePreviewPage() {
  const [theme, setTheme] = useState(dummyStore.theme);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'store' | 'product'>('store');
  const [saving, setSaving] = useState(false);

  const handleSelectTheme = (themeName: string, newTheme: typeof theme) => {
    setTheme(newTheme);
    setSelectedTheme(themeName);
  };

  const handleSave = () => {
    toast.success('Theme saved (mock)!');
  };

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      {/* Theme Picker */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Choose a Theme</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {storeThemes.map(({ name, theme: t }) => (
            <button
              key={name}
              onClick={() => handleSelectTheme(name, t)}
              className={`relative flex flex-col rounded-xl border p-4 transition-all duration-150 ${
                selectedTheme === name
                  ? 'ring-2 ring-[var(--primary-color)] scale-[1.02]'
                  : 'hover:scale-[1.02] hover:shadow-md'
              }`}
            >
              <div
                className="h-20 rounded-lg mb-3"
                style={{ background: `linear-gradient(90deg, ${t.primaryColor}, ${t.secondaryColor})` }}
              />
              <span className="font-medium text-gray-800">{name}</span>
              <div className="flex gap-1 mt-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: t.primaryColor }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: t.secondaryColor }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: t.backgroundColor }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: t.borderColor }} />
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={!selectedTheme || saving}
          className="mt-6 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-150 hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--button-color)' }}
        >
          {saving ? 'Saving...' : 'Save Selected Theme'}
        </button>
      </div>

      {/* Preview Tabs */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setPreviewTab('store')}
          className={`px-4 py-2 rounded-md font-medium transition-all ${
            previewTab === 'store'
              ? 'bg-[var(--primary-color)] text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Store Page
        </button>
        <button
          onClick={() => setPreviewTab('product')}
          className={`px-4 py-2 rounded-md font-medium transition-all ${
            previewTab === 'product'
              ? 'bg-[var(--primary-color)] text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Product Page
        </button>
      </div>

      {/* Live Preview */}
      <div className="mt-6 border rounded-xl shadow-sm overflow-hidden">
        {previewTab === 'store' ? (
          <div className="space-y-10 p-6" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
            {/* Header */}
            <header
              className="flex justify-between items-center p-4 rounded-lg"
              style={{ backgroundColor: theme.primaryColor, color: theme.textColor }}
            >
              <h1 className="text-2xl font-bold">{dummyStore.brandName}</h1>
              <nav className="space-x-4 font-medium">
                <span>Home</span>
                <span>Products</span>
                <span>About</span>
              </nav>
            </header>

            {/* Hero Section */}
            <section
              className="p-8 rounded-lg text-center"
              style={{ backgroundColor: theme.secondaryColor, color: theme.textColor }}
            >
              <h2 className="text-3xl font-bold mb-2">{dummyStore.brandName}</h2>
              <p className="mb-4">Welcome to our store!</p>
              <div className="h-48 w-full bg-gray-300 rounded-lg mx-auto" />
            </section>

            {/* Products Grid */}
            <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {dummyProducts.map((p) => (
                <div
                  key={p._id}
                  className="rounded-lg p-4 flex flex-col items-center"
                  style={{ border: `1px solid ${theme.borderColor}`, backgroundColor: theme.backgroundColor }}
                >
                  <div className="h-32 w-full bg-gray-300 rounded mb-4" />
                  <h3 className="font-semibold">{p.name}</h3>
                  <p>${p.price}</p>
                </div>
              ))}
            </section>

            {/* Footer */}
            <footer className="border-t py-6 text-center" style={{ borderColor: theme.borderColor }}>
              &copy; {new Date().getFullYear()} {dummyStore.brandName}. All rights reserved.
            </footer>
          </div>
        ) : (
          <div className="space-y-10 p-6" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
            {/* Product Main Section */}
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex-1 h-64 rounded-lg bg-gray-300" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{dummyProduct.name}</h2>
                  <p className="mb-4">{dummyProduct.description}</p>
                  <p className="text-lg font-semibold mb-2">${dummyProduct.price}</p>
                  <p className="mb-4">Stock: {dummyProduct.stock}</p>
                </div>
                <div className="flex gap-2">
                  {dummyProduct.colors.map((c) => (
                    <span key={c} className="w-6 h-6 rounded-full border" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Images */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {dummyProduct.images.map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded-lg" />
              ))}
            </div>

            {/* Footer */}
            <footer className="border-t py-6 text-center" style={{ borderColor: theme.borderColor }}>
              &copy; {new Date().getFullYear()} {dummyStore.brandName}. All rights reserved.
            </footer>
          </div>
        )}
      </div>
    </section>
  );
}
