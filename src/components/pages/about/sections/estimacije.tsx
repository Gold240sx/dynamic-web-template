import Section from "../section";
import { Lorem } from "../lorem";

export default function Estimacije() {
  return (
    <Section id="section8" title="Estimacije">
      <h3 className="mb-4 text-xl font-semibold">Pregled Estimacija</h3>
      <Lorem paragraphs={2} />

      <h4 className="mb-2 mt-6 text-lg font-semibold">Metodologija</h4>
      <Lorem paragraphs={1} />

      <h4 className="mb-2 mt-6 text-lg font-semibold">Faktori Uticaja</h4>
      <Lorem paragraphs={2} />

      <h4 className="mb-2 mt-6 text-lg font-semibold">Proces Estimacije</h4>
      <Lorem paragraphs={1} />

      <h4 className="mb-2 mt-6 text-lg font-semibold">Zaključak</h4>
      <Lorem paragraphs={1} />
    </Section>
  );
}
