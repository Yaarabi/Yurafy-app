"use client";

import React from "react";
import { FaHeadphones } from "react-icons/fa6";
import { FaRegEnvelope } from "react-icons/fa6";

const HeaderTop = () => {
  return (
    <div className="min-h-[40px] sm:h-10 text-white bg-[var(--secondary-color)] px-3 sm:px-5">
        <div className="text-sm sm:text-sm font-semibold flex justify-center items-center text-white py-2">
          🎉 Enjoy free shipping on orders over $50!
        </div>
    </div>
  );
};

export default HeaderTop;
