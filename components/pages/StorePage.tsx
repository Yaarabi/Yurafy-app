"use client";

import { IProduct } from "@/models/products";
import { SerializedStore } from "@/lib/data/products";
import WhatsAppButton from "../productPage/ProductActions";
import ThemeRenderer from "../store/themes/ThemeRenderer";
import { StoreProvider } from "@/components/store/context/StoreContext";
import Cart from "@/components/store/components/Cart";

interface StorePageProps {
    store: SerializedStore;
    products: IProduct[];
    onProductSelect: (product: IProduct) => void;
}

// MAIN STORE COMPONENT (CLIENT)
const StoreComponent = ({
    store,
    products,
    onProductSelect,
}: StorePageProps) => {
    // themeId is serialized as string in the store model; coerce to number with safe fallback
    const rawThemeId = (store as any)?.themeId ?? "1";
    const parsed = Number(rawThemeId);
    const themeId = Number.isFinite(parsed) && !Number.isNaN(parsed) ? parsed : 1;

    return (
        <div>
            <StoreProvider stores={[store]} initialStore={store}>
                <ThemeRenderer themeId={themeId} currentPage="STORE_PAGE" />
                <Cart />
            </StoreProvider>
            <WhatsAppButton ownerPhone={store.businessInfo?.phone} />
        </div>
    );
};

export default StoreComponent;
