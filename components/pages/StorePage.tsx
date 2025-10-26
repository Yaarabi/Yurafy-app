

import Header from "./components/Header";
import Footer from "./components/Footer";
import TrustSection from "./components/TrustSection";
import { IProduct } from "@/models/products";
import { SerializedStore } from "@/lib/data/products";
import FeaturedProducts from "./components/featuredProducts";

interface StorePageProps {
    store: SerializedStore;
    products: IProduct[];
    onProductSelect: (product: IProduct) => void;
}

// HERO SECTION
const Hero = ({ store }: { store: SerializedStore }) => {
    if (!store.hero) return null;
    return (
        <section
        className="relative h-96 md:h-[500px] bg-cover bg-center text-white flex items-center justify-center"
        style={{ backgroundImage: `url(${store.hero.imageUrl})` }}
        >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 text-center p-4">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
            {store.hero.title}
            </h1>
            <p className="text-lg md:text-2xl mb-8 drop-shadow-md">
            {store.hero.subtitle}
            </p>
            <a
            href="#featured-products"
            className="px-8 py-3 rounded-full font-bold transition-transform duration-300 ease-in-out transform hover:scale-105"
            style={{
                backgroundColor: "var(--primary-color)",
                color: "var(--text-color)",
            }}
            >
            Shop Now
            </a>
        </div>
        </section>
    );
};

// ABOUT SECTION
const AboutUs = ({ store }: { store: SerializedStore }) => {
    if (!store.whoWeAre) return null;
    return (
        <section id="about-us" className="py-16 bg-gray-100 scroll-mt-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
            <h2
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--secondary-color)" }}
            >
                Who We Are
            </h2>
            <div
                className="w-24 h-1 mb-6"
                style={{ backgroundColor: "var(--primary-color)" }}
            ></div>
            <p className="text-gray-600 leading-relaxed">{store.whoWeAre}</p>
            </div>
            <div className="md:w-1/2">
            <img
                src="https://picsum.photos/seed/aboutus/600/400"
                alt="About Us"
                className="rounded-lg shadow-xl"
            />
            </div>
        </div>
        </section>
    );
};

// MAIN STORE COMPONENT (SERVER)
const StoreComponent = async ({
    store,
    products,
    onProductSelect,
    }: StorePageProps) => {
    return (
        <div>
        <Header store={store} page="store" />
        <main>
            <Hero store={store} />
            <FeaturedProducts
            products={products}
            onProductSelect={onProductSelect} // ✅ OK because FeaturedProducts is client
            />
            <AboutUs store={store} />
            <TrustSection />
        </main>
        <Footer store={store} />
        </div>
    );
};

export default StoreComponent;
