"use client";

import React from "react";
import { FaHeadphones } from "react-icons/fa6";
import { FaRegEnvelope } from "react-icons/fa6";

const HeaderTop = () => {
  return (
    <div className="h-10 text-white bg-[var(--secondary-color)] max-lg:px-5 max-lg:h-16 max-[573px]:px-0">
        <div className="text-sm font-semibold flex justify-center items-center max-[370px]:text-xs text-white">
          🎉 Enjoy free shipping on orders over $50!
        </div>
    </div>
  );
};

export default HeaderTop;
