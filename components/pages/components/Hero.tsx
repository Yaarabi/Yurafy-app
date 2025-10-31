
"use client"
import { SerializedStore } from "@/lib/data/products";
import Link from "next/link";
import { useParams } from "next/navigation";



const Hero = ({ store }: { store: SerializedStore }) => {

    if (!store.hero) return null;

    const params = useParams()

    return (
        <section
        className="relative h-96 md:h-[500px] bg-cover bg-center text-white flex items-center justify-center"
        style={{ backgroundImage:`url(${store.hero.imageUrl})`}}
        >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 text-center p-4">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
            {store.hero.title}
            </h1>
            <p className="text-lg md:text-2xl mb-8 drop-shadow-md">
            {store.hero.subtitle}
            </p>
            <Link
                href={store.hero.ctaLink || `/${params.locale}/${params.domain}/shop`}
                className="px-8 py-3 rounded-full font-bold transition-transform duration-300 ease-in-out transform hover:scale-105"
                style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--text-color)",
                }}
            >
            {store.hero.ctaText || "Shop Now"}
            </Link>
        </div>
        </section>
    );
};

export default Hero