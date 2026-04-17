// "use client";

import StoreClientWrapper from "@/components/pages/storeWrapper";
import ThemeInjector from "@/components/productPage/ThemeInjector";
import { redirect } from 'next/navigation';
import NotFound from "../not-found";
import { getSubdomainFromHeaders } from "@/lib/utils/subdomain";
import { headers } from "next/headers";
import { getStoreByDomain } from "@/lib/data/store";
import { getProductsByOwner } from "@/lib/data/products";

// import HeroSection from "@/components/home/HeroSection";
// import AboutSection from "@/components/home/AboutSection";
// import HowItWorks from "@/components/home/HowItWorks";
// import FeaturesSection from "@/components/home/FeaturesSection";
// import PlansSection from "@/components/home/PlansSection";
// import ServicesSection from "@/components/home/otherServicesSection";
// import TestimonialsSection from "@/components/home/TestimonialsSection";
// import FAQsSection from "@/components/home/FAQsSection";
// import CallToAction from "@/components/home/CallToAction";
// import Footer from "@/components/home/Footer";


// export default function Home() {
//   return (
//     <>
//       <HeroSection />
//       <AboutSection />
//       <HowItWorks />
//       <FeaturesSection />
//       <PlansSection />
//       <ServicesSection/>
//       <TestimonialsSection />
//       <FAQsSection />
//       <CallToAction />
//       <Footer />
//     </>
//   );
// }

export default async function RootPage() {
  // Check if we're using subdomain (exclude main domains like www, app, admin)
  const headersList = await headers();
  const subdomain = await getSubdomainFromHeaders(headers, { 
      mainDomains: ['www', 'app', 'admin'] 
  });
  
  // Also check the x-subdomain header set by middleware
  const subdomainFromHeader = headersList.get('x-subdomain');
  
  const storeSubdomain = subdomain || subdomainFromHeader;
  
  if (storeSubdomain) {
      // If subdomain exists, load the store page
      const storeDomain = storeSubdomain.toLowerCase().trim();
      const store = await getStoreByDomain(storeDomain);
      
      if (!store || !store.owner) {
          return <NotFound/>;
      }
      
      // Ensure owner is a valid string
      const ownerId = typeof store.owner === 'string' ? store.owner : store.owner;
      const products = await getProductsByOwner(ownerId);
      
      return (
          <>
              <ThemeInjector theme={store.theme} />
              <StoreClientWrapper store={store} products={products} />
          </>
      );
  }
  
  // No subdomain, redirect to default locale
  redirect('/en/services');
}