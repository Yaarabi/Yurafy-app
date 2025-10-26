"use client"
import Image from "next/image";
import React from "react";
import Link from "next/link";
import ProductItemRating from "./ProductItemRating";
import { IProduct } from "@/models/products"; 
import { useParams } from "next/navigation";

const ProductItem = ({
  product,
  color,
}: {
  product: IProduct;
  color: string;
}) => {

  const params = useParams()
  return (
    <div className="flex flex-col items-center gap-y-2">
      <Link href={`/${params.domain}/shop/${product.slug}`}>
        <Image
          src={
            product.mainImage
              ? `${product.mainImage}`
              : "/log.jpg"
          }
          width={800}
          height={800}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="w-full h-48 sm:h-64 md:h-72 object-cover rounded-lg"
          alt={product.name || "Product image"}
        />
      </Link>
      <Link
        href={`/${params.domain}/shop/${product.slug}`}
        className="text-xl font-bold text-gray-900 font-normal mt-2 uppercase truncate w-full text-center sm:text-left"
      >
        {product.name}
      </Link>
      <p
        className="text-lg text-gray-900 font-semibold"
      >
        ${product.price}
      </p>

      <ProductItemRating productRating={4.5} />
      <Link
        href={`/${params.domain}/shop/${product.slug}`}
        className="block flex justify-center items-center w-full uppercase bg-white px-4 py-2 text-base border border-black border-gray-300 font-bold text-[var(--secondary-color)] shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2"
      >
        <p>View product</p>
      </Link>
    </div>
  );
};

export default ProductItem;
