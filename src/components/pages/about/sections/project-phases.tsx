import Section from "../section";

export default function ProjectPhases() {
  return (
    <Section id="project-phases" title="Projektne faze">
      <p className="mb-4">
        Ponuda obuhvata sledeće faze konceptualizacije i razvoja veb sajta:
      </p>
      <ol className="mb-6 list-inside list-decimal space-y-2">
        <li>Uvodni sastanak (Discovery and Strategy)</li>
        <li>Wireframe faza (Wireframe)</li>
        <li>Art direkcija</li>
        <li>Faza dizajna</li>
        <li>Faza razvoja (development)</li>
        <li>Objavljivanje sajta na produkcioni server</li>
      </ol>

      <h3 className="mb-2 text-xl font-semibold">Uvodni sastanak</h3>
      <p className="mb-4">
        Naša usluga, istraživanje i strategija - &quot;Discovery and
        Strategy&quot; dizajnirana je da vas postavi na put ka uspehu kroz
        temeljno razumevanje vašeg poslovanja i kreiranje prilagođenog plana.
        Počinjemo detaljnim istraživanjem vaših trenutnih operacija, tržišne
        pozicije i izazova. Ovo uključuje angažovanje vašeg tima, analizu
        podataka i identifikaciju ključnih prilika.
      </p>
      <p className="mb-4">
        Nakon faze istraživanja, prelazimo u fazu Strategije, gde razvijamo
        prilagođeni plan koji definiše specifične akcije potrebne za postizanje
        vaših ciljeva. Ovaj strateški plan će služiti kao vodič za navigaciju
        kroz konkurentski pejzaž, optimizaciju resursa i podsticanje rasta.
      </p>
      <p className="mb-4">
        Investiranjem u ovu fazu osiguravate da svaki naredni korak bude
        informisan, strateški i u skladu sa vašom vizijom za budućnost.
      </p>

      <h3 className="mb-2 text-xl font-semibold">Wireframe Faza</h3>
      <p className="mb-4">
        Wireframe faza je posvećena definisanju strukture i sadržaja vašeg
        sajta. Pošto već imamo postojeće module i sadržaj, fokusiraćemo se na
        poboljšanje sekcija sajta koje zahtevaju najviše pažnje, kao što su
        navigacioni meni, raspored i korisnički tok. Za potrebe ove ponude, naš
        tim je radio na ovoj fazi kako bismo upotpunili tvrdnju da nismo
        zadovoljni dizajnom koji ste dostavili uz zahtev za kreiranje ponude i
        taj materijal vam dostavljamo kao dodatak ovoj ponudi.
      </p>

      <h3 className="mb-2 text-xl font-semibold">Art direkcija</h3>
      <p className="mb-4">
        Pošto klijent još uvek nije potvrdio umetničku direkciju za veb sajt,
        naš tim će pregledati smernice vašeg brenda i usmeriti vizuelni pravac
        za ceo sajt. Ovo će obezbediti doslednost sa vašim identitetom brenda, a
        ujedno poboljšati celokupno korisničko iskustvo.
      </p>

      <h3 className="mb-2 text-xl font-semibold">Faza dizajna</h3>
      <p className="mb-4">
        Tokom faze dizajna, primenićemo utvrđenu &quot;art direkciju&quot; za
        dizajn novih stranica vašeg sajta. Iako već znamo koje module i sadržaj
        imamo, naš dizajnerski tim će se fokusirati na redizajn i
        restrukturiranje tih elemenata kako bi obezbedio najbolje moguće
        korisničko iskustvo i prenošenje poruke vašeg brenda. Za potrebe ove
        ponude, naš tim je radio na ovoj fazi kako bismo upotpunili tvrdnju da
        nismo zadovoljni dizajnom koji ste dostavili uz zahtev za kreiranje
        ponude i taj materijal vam dostavljamo kao dodatak ovoj ponudi. Ukoliko
        vam se svidja definisani pravac i pravac dizajna koji smo kreirali za
        vas, ovo će biti korišćeno kao polazna tačka za razvoj svih ostalih
        stranica koje su neophodne.
      </p>

      <h3 className="mb-2 text-xl font-semibold">Faza razvoja</h3>
      <p className="mb-4">
        Nakon što dizajn bude odobren, naš razvojni tim će započeti proces
        kreiranja vizuelnih i funkcionalnih komponenti sajta. Ovo uključuje
        prevođenje odobrenog dizajna u kod, obezbeđujući da animacije, hover
        efekti na dugmadi za poziv na akciju i druge interakcije budu potpuno
        funkcionalni i u skladu sa dizajnom. Paralelno s tim, razvijaćemo CMS
        prema vašim specifikacijama, omogućavajući jednostavno upravljanje
        sadržajem za vaš tim.
      </p>

      <h3 className="mb-2 text-xl font-semibold">
        Objavljivanje sajta na produkcioni server
      </h3>
      <p className="mb-4">
        Poslednja faza našeg razvojnog ciklusa je objavljivanje projekta na
        produkcioni server. Nakon što dobijemo odobrenje za staging okruženje (i
        frontend i CMS), nastavljamo sa aktivnostima za Go-Live. Vreme trajanja
        ove faze zavisi od okruženja za hosting, bilo da je to naš server ili
        server klijenta.
      </p>
    </Section>
  );
}
