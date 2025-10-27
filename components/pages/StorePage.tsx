

import Header from "./components/Header";
import Footer from "./components/Footer";
import TrustSection from "./components/TrustSection";
import { IProduct } from "@/models/products";
import { SerializedStore } from "@/lib/data/products";
import FeaturedProducts from "./components/featuredProducts";
import Hero from "./components/Hero";
import WhatsAppButton from "../productPage/ProductActions";

interface StorePageProps {
    store: SerializedStore;
    products: IProduct[];
    onProductSelect: (product: IProduct) => void;
}


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
            <p className="text-gray-600 leading-relaxed">{store.whoWeAre.description}</p>
            </div>
            <div className="md:w-1/2">
                <img
                    src={store.whoWeAre.imageUrl || "https://picsum.photos/seed/aboutus/600/400"}
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
        <WhatsAppButton/>
        <Footer store={store} />
        </div>
    );
};

export default StoreComponent;
