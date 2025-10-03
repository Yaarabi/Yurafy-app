"use client";

import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturesSection from "@/components/home/FeaturesSection";
import PlansSection from "@/components/home/PlansSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CallToAction from "@/components/home/CallToAction";
import Footer from "@/components/home/Footer";
import ServicesSection from "@/components/home/otherServicesSection";
import LoginForm from "@/components/login/loginForm";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <HowItWorks />
      <FeaturesSection />
      <PlansSection />
      <ServicesSection/>
      <TestimonialsSection />
      <CallToAction />
      <Footer />
    </>
  );
}
