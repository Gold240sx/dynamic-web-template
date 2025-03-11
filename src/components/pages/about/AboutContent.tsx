"use client";

import { useRef } from "react";
import TableOfContents from "./table-of-contents";
import HeroSection from "./hero-section";
import AboutBuiltt from "./sections/about-builtt";
import AboutProject from "./sections/about-project";
import ProjectPhases from "./sections/project-phases";
import ProjectBenefits from "./sections/project-benefits";
import TermsAndConditions from "./sections/terms-and-conditions";
import TermsOfPayment from "./sections/terms-of-payment";
import OptionalServices from "./sections/optional-services";

export default function Home() {
  const firstSectionRef = useRef<HTMLElement>(null);

  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection nextSectionRef={firstSectionRef} />
      <div className="bg-primary text-primary-foreground flex-grow">
        <div className="container mx-auto flex gap-8 px-4 py-8">
          <TableOfContents />
          <main className="flex-1">
            <AboutBuiltt />
            <AboutProject />
            <ProjectPhases />
            <ProjectBenefits />
            <TermsOfPayment />
            <OptionalServices />
            <TermsAndConditions />
          </main>
        </div>
      </div>
    </div>
  );
}
