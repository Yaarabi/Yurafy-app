
"use client";
import CollectionPage from "@/components/pages/CollectionPage";
import { getProductsByOwner } from "@/lib/data/products";
import { getStoreByDomain, SerializedStore } from "@/lib/data/store";
import { IProduct } from "@/models/products";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function WraapShopPage() {
    const [store, setStore] = useState<SerializedStore | null>(null);
    const [products, setProducts] = useState<IProduct[]>([]);
    const params = useParams();

    useEffect(() => {
        const fetchData = async () => {
        const data = await getStoreByDomain(params.domain as string);
        if (data) {
            setStore(data);
            const productList = await getProductsByOwner(data.owner);
            setProducts(productList);
        }
        };

        fetchData();
    }, [params.domain]);

    if (!store) {
        return <div className="text-center py-20">Store not found.</div>;
    }

    const onProductSelect = (product: IProduct) => {
        window.location.href = `/${params.locale}/${params.domain}/shop/${product.slug}`;
    };

    return (
        <>
        <CollectionPage store={store} products={products} onProductSelect={onProductSelect} />
        </>
    );
}

export default WraapShopPage;
