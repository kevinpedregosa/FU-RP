import type { Metadata } from "next";

import ExampleGallery from "@/components/landing/ExampleGallery";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";

export const metadata: Metadata = {
  title: "Home",
  description: "Automated duckweed frond counting using computer vision and deep learning",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <ExampleGallery />
    </main>
  );
}
