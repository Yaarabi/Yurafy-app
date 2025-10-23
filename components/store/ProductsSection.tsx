import React from "react";
import ProductItem from "./ProductItem";
import Heading from "./Heading";

import { connectDB } from "@/lib/db/mongoDB";
import ProductModel from "@/models/products";
import { IProduct } from "@/models/products";

type Props = {
  ownerId: string;
};

const ProductsSection = async ({ ownerId }: Props) => {
  await connectDB();

  let products = await ProductModel.find({ owner: ownerId })
    .sort({ createdAt: -1 })
    .lean();

  if (!products || products.length === 0) {
    return (
      <p className="text-center text-[var(--secondary-color)] mt-16 text-lg animate-pulse">
        Aucun produit trouvé.
      </p>
    );
  }

  products = products.slice(0, 16);

  const serializedProducts = products.map((p) => ({
    _id: p._id?.toString() || "",
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    discount: p.discount,
    stock: p.stock,
    category: p.category,
    mainImage: p.mainImage || "",
    images: Array.isArray(p.images) ? p.images : [],
    variants: Array.isArray(p.variants) ? p.variants : [],
    salesCount: p.salesCount || 0,
    createdAt: p.createdAt?.toISOString() || "",
    updatedAt: p.updatedAt?.toISOString() || "",
    owner:
      typeof p.owner === "object"
        ? (p.owner as any)?._id?.toString() || ""
        : p.owner,
  }));

  return (
    <section id="products" className="bg-white border-t-4 border-[var(--secondary-color)]">
      <div className="max-w-screen-2xl mx-auto pt-20">
        <Heading title="OUR COLLECTION" />
        <div className="grid grid-cols-4 justify-items-center py-10 gap-x-4 px-10 gap-y-10 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
          {serializedProducts.length > 0 ? (
            serializedProducts.map((product) => (
              <ProductItem
                
                key={product._id}
                product={product}
                color= {'black'}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-[var(--secondary-color)] py-10">
              <p>No products available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
