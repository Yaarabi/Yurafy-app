"use client"
import { SerializedStore } from '@/lib/data/products'; 
import Header from './components/Header';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import { IProduct } from '@/models/products';
import TrustSection from './components/TrustSection';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid, List, LayoutGrid } from 'lucide-react';

interface CollectionPageProps {
    store: SerializedStore;
    products: IProduct[];
    onProductSelect: (product: IProduct) => void;
}

const CollectionPage: React.FC<CollectionPageProps> = ({ store, products, onProductSelect }) => {
    const layout = store.customization?.layout || 'grid';
    const enableSearch = store.customization?.enableSearch !== false;
    const showFilters = store.customization?.showFilters !== false;
    const productsPerPage = store.customization?.productsPerPage || 12;
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLayout, setSelectedLayout] = useState<'grid' | 'list' | 'masonry'>(layout);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Filter products based on search
    const filteredProducts = useMemo(() => {
        if (!enableSearch || !searchQuery.trim()) return products;
        
        const query = searchQuery.toLowerCase();
        return products.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query) ||
            product.brand?.toLowerCase().includes(query)
        );
    }, [products, searchQuery, enableSearch]);
    
    // Paginate products
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * productsPerPage;
        const end = start + productsPerPage;
        return filteredProducts.slice(start, end);
    }, [filteredProducts, currentPage, productsPerPage]);
    
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    // Grid classes based on layout
    const getGridClasses = () => {
        switch (selectedLayout) {
            case 'list':
                return 'grid grid-cols-1 gap-6';
            case 'masonry':
                return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
            default: // grid
                return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8';
        }
    };
    
    return (
        <div>
            <Header store={store} page="collection" />
            <main className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-3xl font-bold text-center mb-2" style={{ color: 'var(--secondary-color)' }}>Our Collection</motion.h1>
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="w-24 h-1 mx-auto mb-10" style={{ backgroundColor: 'var(--primary-color)', transformOrigin: 'left' }}></motion.div>
                    
                    {/* Search and Layout Controls */}
                    {(enableSearch || showFilters) && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.15 }} className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            {enableSearch && (
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1); // Reset to first page on search
                                        }}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50"
                                        style={{ 
                                            focusRingColor: 'var(--primary-color)',
                                            outlineColor: 'var(--primary-color)'
                                        }}
                                    />
                                </div>
                            )}
                            
                            {showFilters && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedLayout('grid')}
                                        className={`p-2 rounded-lg transition ${
                                            selectedLayout === 'grid' 
                                                ? 'bg-opacity-20' 
                                                : 'hover:bg-gray-100'
                                        }`}
                                        style={{ 
                                            backgroundColor: selectedLayout === 'grid' ? 'var(--primary-color)' : undefined
                                        }}
                                    >
                                        <Grid className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedLayout('masonry')}
                                        className={`p-2 rounded-lg transition ${
                                            selectedLayout === 'masonry' 
                                                ? 'bg-opacity-20' 
                                                : 'hover:bg-gray-100'
                                        }`}
                                        style={{ 
                                            backgroundColor: selectedLayout === 'masonry' ? 'var(--primary-color)' : undefined
                                        }}
                                    >
                                        <LayoutGrid className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedLayout('list')}
                                        className={`p-2 rounded-lg transition ${
                                            selectedLayout === 'list' 
                                                ? 'bg-opacity-20' 
                                                : 'hover:bg-gray-100'
                                        }`}
                                        style={{ 
                                            backgroundColor: selectedLayout === 'list' ? 'var(--primary-color)' : undefined
                                        }}
                                    >
                                        <List className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                    
                    {/* Products Grid */}
                    {paginatedProducts.length > 0 ? (
                        <>
                            <div className={getGridClasses()}>
                                {paginatedProducts.map(product => (
                                    <motion.div key={product._id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
                                        <ProductCard 
                                            product={product} 
                                            onProductSelect={onProductSelect}
                                            layout={selectedLayout}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex justify-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        style={{ 
                                            backgroundColor: currentPage === 1 ? 'transparent' : 'var(--primary-color)',
                                            color: currentPage === 1 ? 'inherit' : 'white'
                                        }}
                                    >
                                        Previous
                                    </button>
                                    
                                    <span className="px-4 py-2">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        style={{ 
                                            backgroundColor: currentPage === totalPages ? 'transparent' : 'var(--primary-color)',
                                            color: currentPage === totalPages ? 'inherit' : 'white'
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No products found.</p>
                        </div>
                    )}
                </div>
            </main>
            <TrustSection/>
            <Footer store={store} />
        </div>
    );
};

export default CollectionPage;
