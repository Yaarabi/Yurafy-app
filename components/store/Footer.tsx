import Image from "next/image";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white" aria-labelledby="footer-heading">
      <div>
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-screen-2xl px-6 lg:px-8 pt-24 pb-14">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <Image
              src="/logo.png"
              alt="Singitronic logo"
              width={100}
              height={100}
              className="h-auto w-auto"
            />
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-lg font-bold leading-6 text-[var(--secondary-color)]">
                    Sale
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li><a href="#" className="text-sm leading-6 text-black hover:text-gray-700">Featured Deals</a></li>
                    <li><a href="#" className="text-sm leading-6 text-black hover:text-gray-700">Clearance</a></li>
                    <li><a href="#" className="text-sm leading-6 text-black hover:text-gray-700">Bundle Offers</a></li>
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-base font-bold leading-6 text-[var(--secondary-color)]">
                    About Us
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li><a href="#" className="text-sm leading-6 text-black hover:text-gray-700">Company Info</a></li>
                    <li><a href="#" className="text-sm leading-6 text-black hover:text-gray-700">Careers</a></li>
                    <li><a href="#" className="text-sm leading-6 text-black hover:text-gray-700">Press</a></li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-base font-bold leading-6 text-[var(--secondary-color)]">
                    Buying
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li><a href="#" className="text-sm leading-6 text-black hover:text-gray-700">How to Buy</a></li>
                    <li><a href="#" className="text-sm leading-6 text-black hover:text-gray-700">Payment Options</a></li>
                    <li><a href="#" className="text-sm leading-6 text-black hover:text-gray-700">Shipping Info</a></li>
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-base font-bold leading-6 text-[var(--secondary-color)]">
                    Support
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li><a href="#" className="text-sm leading-6 text-black hover:text-gray-700">Help Center</a></li>
                    <li><a href="#" className="text-sm leading-6 text-black hover:text-gray-700">Returns</a></li>
                    <li><a href="#" className="text-sm leading-6 text-black hover:text-gray-700">Contact Us</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
