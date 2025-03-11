import Image from "next/image";
import ScrollArrow from "@/components/myComponents/scroll-arrow";
import type React from "react";

interface HeroSectionProps {
  nextSectionRef: React.RefObject<HTMLElement>;
}

const HeroSection: React.FC<HeroSectionProps> = ({ nextSectionRef }) => {
  return (
    <section className="relative flex h-screen flex-col items-center justify-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/builtt_personal_cover_without_logo-kkH3tDxwbYuPQef78SKUFE53nupNRF.png)",
          backgroundSize: "auto",
          backgroundRepeat: "repeat",
          backgroundPosition: "top right",
        }}
      />
      <div className="bg-secondary/40 absolute inset-0 z-0" />
      <div className="text-secondary-foreground relative z-10 mx-auto w-full max-w-4xl px-4 text-center">
        <div className="mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Builtt-monogram-neg-L2JDybset8Y5IvuXocM1lUSq6IVi76.png"
            alt="Builtt Logo"
            width={120}
            height={120}
            className="mx-auto mb-12"
            priority
          />
        </div>
        <h1 className="mb-8 text-center text-6xl font-bold">TESLA</h1>
        <div className="text-center">
          <p className="mb-2">Pripremio: Darko Đoković</p>
          <p className="mb-2">Pripremljeno za: Mirsolava Jeremić</p>
          <p className="mb-2">Datum: 25/01/2025</p>
          <p>Verzija: 1.0</p>
        </div>
      </div>
      <ScrollArrow targetRef={nextSectionRef} />
    </section>
  );
};

export default HeroSection;
