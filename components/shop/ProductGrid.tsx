import ProductCard from './ProductCard';
import { IProduct } from '@/models/products';

async function fetchProducts(): Promise<IProduct[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/products`, {
        next: { revalidate: 60 }
        });

        if (!res.ok) throw new Error('Failed to fetch products');

        const data = await res.json();
        return data.products || [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export default async function ProductGrid() {
    const products = await fetchProducts();

    if (!products.length) {
        return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <p className="text-center text-gray-500 text-lg">No products found.</p>
        </section>
        );
    }

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((p, i) => (
                <ProductCard key={i} product={p} />
                ))}
            </div>
        </section>
    );
}
