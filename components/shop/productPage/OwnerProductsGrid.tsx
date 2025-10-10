import ProductCard from '../ProductCard';
import { connectDB } from '@/lib/db/mongoDB';
import Product from '@/models/products';
import { IProduct } from '@/models/products';
import { FC } from 'react';
import RelatedProducts from './RelatedProducts';

interface OwnerProductsGridProps {
    ownerId: string;
    excludeId?: string; // the product to hide
}

const OwnerProductsGrid: FC<OwnerProductsGridProps> = async ({ ownerId, excludeId }) => {
    await connectDB();
    
    let products = await Product.find({ owner: ownerId })
        .sort({ createdAt: -1 })
        .lean<IProduct[]>();

    if (!products || products.length === 0) {
        return <p className="text-center text-gray-500 mt-10">No products found.</p>;
    }

    // Filter out the product with excludeId
    if (excludeId) {
        products = products.filter((p) => p._id?.toString() !== excludeId);
    }

    // Limit to 8 after filtering
    products = products.slice(0, 8);

    // Serialize _id and dates for client components
    const serializedProducts = products.map((p) => ({
        ...p,
        _id: p._id?.toString() || '',
    }));

    return (
        <>
        {(products.length > 0) && <RelatedProducts/>}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {serializedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
        </>
    );
};

export default OwnerProductsGrid;
