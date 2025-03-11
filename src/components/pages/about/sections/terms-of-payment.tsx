import Section from "../section";

export default function TermsOfPayment() {
  return (
    <Section id="payment-terms" title="Uslovi plaćanja">
      <p className="mb-4">Raspored plaćanja za projekat biće sledeći:</p>
      <ul className="mb-4 list-disc space-y-2 pl-6">
        <li>15% pri pokretanju projekta</li>
        <li>30% nakon završetka faze dizajna</li>
        <li>55% nakon završetka projekta i spremnosti za lansiranje</li>
      </ul>
      <p className="mb-4">
        U slučaju kašnjenja sa plaćanjem, Builtt zadržava pravo da obustavi
        izvršenje radova dok se ne izvrši uplata.
      </p>
      <p className="mb-4">
        Ako dođe do prekida u realizaciji projekta zbog kašnjenja sa plaćanjem i
        potrebno je ponovno pokrenuti projekat, biće kreiran novi vremenski
        okvir za razvoj projekta, uzimajući u obzir trenutno dostupne resurse.
      </p>
      <p className="mb-4">
        Rok za početak planiranja resursa i projekta biće 3 dana od prijema
        avansne uplate.
      </p>
    </Section>
  );
}
