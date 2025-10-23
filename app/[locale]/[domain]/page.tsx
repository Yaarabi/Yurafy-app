
import { generateStoreMetadata } from "@/lib/metadata/storeMetadata";
import { getStoreByDomain } from "@/lib/data/store";
import Hero from "@/components/store/Hero";
import AboutUsSection from "@/components/store/IntroducingSection";
import ProductsSection from "@/components/store/ProductsSection";
import ThemeInjector from "@/components/productPage/ThemeInjector";
import TrustSection from "@/components/store/TrustInAs";
import WhatsAppButton from "@/components/productPage/ProductActions";
import ProductHeader from "@/components/store/Header";

// ✅ Metadata generation using Promise + await
export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    const metadata = await generateStoreMetadata(domain);
    return metadata;
}

export async function generateViewport({ params }: { params: { domain: string } }) {
    const { domain } = await params;
    const store = await getStoreByDomain(domain);
    return { themeColor: store?.theme };
}

export const revalidate = 60;

// ✅ Page rendering using Suspense for faster product load
export default async function StorePage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    const store = await getStoreByDomain(domain);

    if (!store) {
        return <div className="text-center py-20">Store not found.</div>;
    }

    return (
        <>
        <ThemeInjector theme={store.theme} />
        <ProductHeader store={store} />
        <Hero hero={store.hero} />

            <ProductsSection ownerId={store.owner} />
        
            <AboutUsSection whoWeAre={store.whoWeAre} />

            <TrustSection />


        <WhatsAppButton ownerPhone={store._id} />
        </>
    );
}
