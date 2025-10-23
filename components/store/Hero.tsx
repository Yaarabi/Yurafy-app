"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

type HeroProps = {
  hero?: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
  };
};

const Hero = ({ hero }: HeroProps) => {
  const params = useParams();

  return (
    <section className="relative w-full bg-[var(--secondary-color)]">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-3 items-center px-10 gap-x-10 h-[500px] max-lg:grid-cols-1 max-lg:gap-y-12 max-lg:py-12 max-lg:h-auto">
        
        {/* Text Content */}
        <div className="flex flex-col justify-center gap-y-6 col-span-2 text-center lg:text-left max-lg:order-last">
          <h1 className="text-6xl font-extrabold text-white leading-tight max-xl:text-5xl max-md:text-4xl max-sm:text-3xl">
            {hero?.title || "THE PRODUCT OF THE FUTURE"}
          </h1>
          <p className="text-white/90 text-lg max-sm:text-sm leading-relaxed">
            {hero?.subtitle ||
              "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolor modi iure laudantium necessitatibus ab, voluptates vitae ullam. Officia ipsam iusto beatae nesciunt, consequatur deserunt minima maiores earum obcaecati. Optio, nam!"}
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 max-lg:flex-col max-lg:items-center">
            <Link
              href="#products"
              className="bg-white text-[var(--secondary-color)] font-semibold px-10 py-3 rounded-md shadow hover:bg-gray-100 transition"
            >
              BUY NOW
            </Link>
            <Link
              href="#about"
              className="bg-transparent border-2 border-white text-white font-semibold px-10 py-3 rounded-md hover:bg-white hover:text-[var(--secondary-color)] transition"
            >
              LEARN MORE
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="flex justify-center items-center">
          <Image
            src={hero?.imageUrl || "/favi.png"}
            width={400}
            height={400}
            alt="hero image"
            className="w-auto h-auto max-md:w-[300px] max-md:h-[300px] max-sm:w-[250px] max-sm:h-[250px] drop-shadow-lg"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
