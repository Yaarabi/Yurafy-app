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
          width="0"
          height="0"
          sizes="100vw"
          className="w-auto h-[250px]"
          alt={product.name || "Product image"}
        />
      </Link>
      <Link
        href={`/${params.domain}/shop/${product.slug}`}
        className={
          color === "black"
            ? `text-xl text-black font-normal mt-2 uppercase`
            : `text-xl text-white font-normal mt-2 uppercase`
        }
      >
        {product.name}
      </Link>
      <p
        className={
          color === "black"
            ? "text-lg text-black font-semibold"
            : "text-lg text-white font-semibold"
        }
      >
        ${product.price}
      </p>

      <ProductItemRating productRating={4.5} />
      <Link
        href={`/${params.domain}/shop/${product.slug}`}
        className="block flex justify-center items-center w-full uppercase bg-white px-0 py-2 text-base border border-black border-gray-300 font-bold text-[var(--secondary-color)] shadow-sm hover:bg-black hover:bg-gray-100 focus:outline-none focus:ring-2"
      >
        <p>View product</p>
      </Link>
    </div>
  );
};

export default ProductItem;
