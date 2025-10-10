

import Description from '@/components/shop/description';
import Header from '@/components/shop/Header';
import ProductGrid from '@/components/shop/ProductGrid';



export default function ShopPage() {
    return (
        <main className="relative min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-cyan-50">
        <Header/>

        <Description/>
        
        <ProductGrid />

        </main>
    );
}
