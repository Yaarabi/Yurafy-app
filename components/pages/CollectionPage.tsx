import React from 'react';
import { IStore, IProduct } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

interface NavProps {
    onNavigateHome: () => void;
    onNavigateCollection: () => void;
    onNavigateAbout: () => void;
}

interface CollectionPageProps {
    store: IStore;
    products: IProduct[];
    onProductSelect: (product: IProduct) => void;
    navProps: NavProps;
}

const CollectionPage: React.FC<CollectionPageProps> = ({ store, products, onProductSelect, navProps }) => {
    return (
        <div>
            <Header store={store} {...navProps} page="collection" />
            <main className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-center mb-2" style={{ color: 'var(--secondary-color)' }}>Our Collection</h1>
                    <div className="w-24 h-1 mx-auto mb-10" style={{ backgroundColor: 'var(--primary-color)' }}></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} onProductSelect={onProductSelect} />
                        ))}
                    </div>
                </div>
            </main>
            <Footer store={store} />
        </div>
    );
};

export default CollectionPage;
