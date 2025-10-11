import { connectDB } from '@/lib/db/mongoDB';
import Product from '@/models/products';
import ProductCard from '../ProductCard';
import Description from '../description';

interface OwnerProductsGridProps {
    ownerId: string;
}

export default async function OwnerProductsGrid({ ownerId }: OwnerProductsGridProps) {
    await connectDB();

    let products = await Product.find({ owner: ownerId })
        .sort({ createdAt: -1 })
        .lean();

    if (!products || products.length === 0) {
        return (
        <p className="text-center text-gray-500 mt-16 text-lg animate-pulse">
            No products found.
        </p>
        );
    }

    // Limit to 16
    products = products.slice(0, 16);

    // ✅ Serialize _id and other values for client safety
    const serializedProducts = products.map((p) => ({
        _id: p._id?.toString() || '',
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        discount: p.discount,
        stock: p.stock,
        category: p.category,
        mainImage: p.mainImage || '',
        images: Array.isArray(p.images) ? p.images : [],
        variants: Array.isArray(p.variants) ? p.variants : [],
        salesCount: p.salesCount || 0,
        createdAt: p.createdAt?.toISOString() || '',
        updatedAt: p.updatedAt?.toISOString() || '',
        owner: typeof p.owner === 'object' ? (p.owner as any)?._id?.toString() || '' : p.owner,
    }));

    return (
        <section className="max-w-7xl mx-auto w-full">
        
            <Description />
        

        {/* Products Grid */}
        <div
            id="products"
            className="
            grid gap-6 sm:gap-8
            grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
            px-2 sm:px-4
            "
        >
            {serializedProducts.map((product) => (
            <div
                key={product._id}
                className="transform transition-all duration-300 hover:scale-[1.02]"
            >
                <ProductCard product={product} />
            </div>
            ))}
        </div>

        {/* Subtle fade gradient for long product lists */}
        <div className="mt-20 h-16 bg-gradient-to-b from-transparent via-white/60 to-white" />
        </section>
    );
}
