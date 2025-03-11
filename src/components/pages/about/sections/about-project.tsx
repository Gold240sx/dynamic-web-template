import Section from "../section";

export default function AboutProject() {
  return (
    <Section id="about-project" title="O projektu">
      <p className="mb-4">
        Tesla zahteva razvoj prilagođenog, višejezičkog B2C veb sajta, kao i
        integraciju B2B i teslagiveaways.com veb sajtova. Nova platforma će
        podržavati 18 jezika i dizajnirana je da unapredi prepoznatljivost
        brenda, poboljša korisničko iskustvo i prikaže rastući katalog
        proizvoda.
      </p>
      <p className="mb-4">
        Veb sajt će sadržati jasnu i korisnički prijatnu UI, optimizovanu za
        mobilni pristup, u skladu sa identitetom brenda Tesla. Ključne
        funkcionalnosti uključuju:
      </p>
      <ul className="mb-4 list-disc pl-6">
        <li>
          Katalog proizvoda sa stranicama za detalje proizvoda (PDP) i stranice
          za listu proizvoda (PLP)
        </li>
        <li>Pretragu proizvoda i funkcionalnost poređenja</li>
        <li>Do 25 prilagođenih UI elemenata</li>
      </ul>
      <p className="mb-4">
        Iako je Tesla dostavio početni dizajn, tim za dizajn Builtt-a je uočio
        oblasti u kojima trenutni dizajn ne u potpunosti odgovara potrebama
        klijenta. Stoga, ova ponuda uključuje kompletan redizajn sva tri sajta
        (B2C, B2B i teslagiveaways.com), uključujući mobilnu i desktop verziju.
      </p>
      <p className="mb-4">
        Projekat će takođe obuhvatiti migraciju podataka, prenos svih blogova sa
        trenutnog sajta u novi CMS, kao i unos sadržaja na svim 18 jezika. Tesla
        je odgovoran za obezbeđivanje celokupnog sadržaja i prevoda za sajt.
      </p>
      <p className="mb-4">
        Rešenje će biti optimizovano za SEO, usklađeno sa GDPR-om, efikasno u
        upravljanju resursima i podržavaće bogat sadržaj. Sajt će uključivati
        praćenje korisnika i analitiku, a dizajnirana je sa ciljem buduće
        skalabilnosti, uključujući mogućnost dodavanja novih prodavnica po
        zemljama.
      </p>
      <p>
        Veb sajt neće sadržavati korisničke naloge ili cene u svom početnom
        lansiranju.
      </p>
    </Section>
  );
}
