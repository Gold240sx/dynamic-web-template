import Section from "../section";

export default function OptionalServices() {
  return (
    <Section id="additional-services" title="Dodatne usluge">
      <h3 className="mb-4 text-xl font-semibold">
        Zahtevi za promene (Change requests)
      </h3>
      <p className="mb-4">
        Tokom implementacije i nakon lansiranja projekta, često se dešava da
        klijenti shvate da će biti potrebno izvršiti promene u okviru
        originalnog opsega projekta (promene koje nisu bile prvobitno planirane
        i dogovorene). Da bismo omogućili ovakve zahteve, razvili smo nekoliko
        modela za njihovu implementaciju:
      </p>

      <ul className="mb-4 list-disc space-y-4 pl-6">
        <li>
          <strong>Definisani mesečni honorar (Retainer):</strong> Ovaj paket
          uključuje unapred definisan broj sati mesečno (koji se fakturišu na
          mesečnom nivou) i namenjen je implementaciji promena koje klijent
          zahteva. Mesečna naknada (ili broj sati) je fiksna. Takođe, ukoliko
          mesečni honorar nije dovoljan za realizaciju zahteva, klijent može
          platiti dodatnu naknadu po satu za preostale sate.
        </li>
        <li>
          <strong>Naplaćivanje prema potrošnji:</strong> U ovom modelu, klijent
          se obraća sa zahtevima bez obaveze fiksnog honorara. Na kraju svakog
          meseca, računamo broj sati potrošenih na rešavanje klijentovih
          zadataka i izveštavamo klijenta. Klijent se potom fakturiše na osnovu
          potrošenih sati u tom mesecu.
        </li>
        <li>
          <strong>Naplaćivanje prema proceni:</strong> U ovom sistemu, klijent
          dostavlja svoj zahtev za promenu sa opisom, a tim Builtt-a procenjuje
          vreme potrebno za implementaciju. Procena se šalje klijentu na
          odobrenje. Rad na zadatku počinje nakon odobrenja klijenta. Svi
          odobreni zahtevi fakturišu se mesečno.
        </li>
      </ul>

      <p className="mb-4 font-bold">
        ** Svi zahtevi za promene naplaćuju se po satnoj tarifi od 45 €.
      </p>

      <h4 className="mb-2 mt-6 text-lg font-semibold">
        Zahtev za promenu vs. Izveštaj o grešci (Change Request VS Bug Report)
      </h4>
      <p className="mb-4">
        <strong>Zahtevi za promene:</strong> Ovi zahtevi se odnose na promene
        koje klijent zahteva u vezi sa dogovorenom funkcionalnošću ili dizajnom,
        kao i na dodavanje novih funkcionalnosti i/ili dizajna koji nisu bili
        prvobitno dogovoreni prilikom postavljanja projekta. Na primer, ako
        klijent odobri dizajn stranice, a zatim (npr. dva meseca kasnije)
        zatraži promene na već odobrenom dizajnu, to se smatra zahtevom za
        promenu.
      </p>
      <p className="mb-4">
        <strong>Greške:</strong> Greške su portalne/funkcionalne greške koje
        nisu u skladu sa specifikacijama projekta i javljaju se u garantnom
        periodu. Ako se greška pojavi nakon isteka garantnog perioda, njeno
        rešavanje smatraće se zahtevom za promenu i biće naplaćeno odvojeno.
      </p>

      <h4 className="mb-2 mt-6 text-lg font-semibold">Garantni period</h4>
      <p className="mb-4">
        Garantni period podrazumeva ispravljanje grešaka na portalu/aplikaciji
        tokom prvog meseca nakon lansiranja. Garantni period ne uključuje
        implementaciju zahteva za promene koje klijent postavi tokom tog
        perioda, već samo rešavanje grešaka od strane agencije.
      </p>
      <p className="mb-4">
        U slučaju da je sa Builtt potpisan ugovor o održavanju, garantni period
        se produžava do datuma navedenog u ugovoru, a obim usluga biće definisan
        u odnosu na tip održavanja definisan u tom ugovoru.
      </p>
    </Section>
  );
}
