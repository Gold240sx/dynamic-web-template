import Section from "../section";

export default function ProjectBenefits() {
  return (
    <Section id="project-benefits" title="Prednosti ovog projekta">
      <h3 className="mb-4 text-xl font-semibold">Ciljevi projekta</h3>
      <p className="mb-4">
        <strong>Prepoznatljivost brenda:</strong> Kreiraćemo prilagođeno rešenje
        koje ne samo da se usklađuje sa identitetom brenda Tesla, već i pruža
        besprekorno, korisniku prijateljsko iskustvo, čime se dodatno učvršćuje
        prisutnost brenda u digitalnom prostoru.
      </p>
      <p className="mb-4">
        <strong>Podrška za više jezika:</strong> Veb sajt će podržavati 20+
        jezika, a njegova arhitektura biće dizajnirana tako da u budućnosti
        podrži bilo koji broj jezika, čime se obezbeđuje globalna dostupnost i
        pristupačnost.
      </p>
      <p className="mb-4">
        <strong>SEO funkcionalnosti:</strong> Optimizovaćemo veb sajt za
        pretraživače, sa ciljem da postignemo SEO rezultat veći od 90 na
        PageSpeed Insights, čime ćemo osigurati dobar rang i efikasne
        performanse sajta. Ovo je tehnički deo SEO-a.
      </p>
      <p className="mb-4">
        <strong>Usklađenost sa GDPR-om:</strong> Veb sajt će biti usklađen sa
        GDPR propisima, uključujući jasne politike privatnosti i mehanizme za
        saglasnost sa kolačićima, obezbeđujući zaštitu podataka i privatnost
        korisnika na svim tačkama kontakta.
      </p>
      <h3 className="mb-4 text-2xl font-semibold">
        Predloženo rešenje: Headless CMS (Payload CMS) sa Next.js
      </h3>
      <p className="mb-4">
        Predlažemo moderno rešenje za razvoj veb sajta koje kombinuje Payload
        CMS (headless CMS) za back-end i Next.js za front-end. Ova kombinacija
        pruža fleksibilnost, performanse i skalabilnost koja je potrebna za
        budućnost vama prilagođenog digitalnog iskustva.
      </p>

      <h4 className="mb-2 text-lg font-semibold">
        Zašto Headless CMS (Payload CMS) i Next.js?
      </h4>
      <ul className="mb-4 list-disc space-y-2 pl-6">
        <li>
          <strong>Razdvojena arhitektura:</strong> Sa headless CMS-om kao što je
          Payload CMS, front-end (ono što korisnik vidi) i back-end (upravljanje
          sadržajem) su odvojeni. Ovo omogućava veću fleksibilnost i
          skalabilnost. Sadržaj se upravlja kroz Payload CMS i može se
          distribuirati na bilo koju platformu (vlasnički sajt, mobilne
          aplikacije, IoT uređaji) putem API-ja, bez da bude vezan za specifičan
          frontend dizajn ili tehnologiju.
        </li>
        <li>
          <strong>Brzina i performanse:</strong> Next.js je poznat po brzini i
          koristi server-side rendering (SSR) ili static site generation (SSG),
          što rezultira bržim učitavanjem stranica i boljim korisničkim
          iskustvom. Sajtovi izgrađeni pomoću Next.js učitavaju se brže, što je
          ključno za korisničko zadovoljstvo i SEO. Brži sajt znači bolje
          korisničko iskustvo i bolji rang na pretraživačima.
        </li>
        <li>
          <strong>Skalabilnost:</strong> Ovaj pristup je inherentno skalabilan.
          Kako vaše poslovanje raste, arhitektura omogućava lako proširivanje.
          Dodavanje novih stranica, proizvoda, ili čak novih jezika može se
          obaviti bez većih tehničkih promena. Fleksibilnost Payload CMS i
          Next.js znači da vaš sajt može brzo da se prilagodi novim
          tehnologijama ili rastućim potrebama za sadržajem.
        </li>
      </ul>

      <h4 className="mb-2 text-lg font-semibold">
        Upravljanje sadržajem bez problema
      </h4>
      <p className="mb-4">
        Payload CMS nudi intuitivno i lako za korišćenje sučelje koje
        pojednostavljuje upravljanje sadržajem. Nema potrebe da budete tehnički
        stručnjak da biste ažurirali sadržaj sajta. Lako možete upravljati
        tekstovima, slikama, video sadržajem, pa čak i složenim strukturama
        sadržaja sa centralizovane nadzorne ploče, čineći proces efikasnim i
        pojednostavljenim.
      </p>

      <h4 className="mb-2 text-lg font-semibold">Priprema za budućnost</h4>
      <p className="mb-4">
        Pošto je Payload CMS odvojen od front-end-a, lako se prilagođava novim
        tehnologijama i može se lako integrisati sa budućim platformama. Možete
        unapređivati sajt bez brige o ograničenjima koja dolaze sa zastarelim
        CMS rešenjima.
      </p>

      <h4 className="mb-2 text-lg font-semibold">
        Prednosti u odnosu na custom ili tradicionalna CMS rešenja
      </h4>
      <ul className="mb-4 list-disc space-y-2 pl-6">
        <li>
          <strong>Fleksibilnost:</strong> Tradicionalni CMS sistemi kao što su
          WordPress ili custom rešenja su tesno povezani sa strukturom svog
          front-end-a. To znači da ako želite da redizajnirate ili ažurirate
          sajt, to može biti dugotrajan proces. Sa headless CMS-om, front-end i
          back-end su nezavisni, pa se promene u dizajnu ili ažuriranje sadržaja
          mogu vršiti bez uticaja na drugi deo.
        </li>
        <li>
          <strong>Prilagođavanje:</strong> Za razliku od tradicionalnih CMS
          platformi koje često koriste unapred definisane teme ili šablone,
          Next.js omogućava potpunu prilagodbu dizajna i funkcionalnosti sajta.
          Imate potpunu kontrolu nad korisničkim iskustvom i možete napraviti
          zaista jedinstven i brendiran sajt.
        </li>
        <li>
          <strong>Brži razvoj:</strong> Tradicionalni CMS sistemi zahtevaju
          upravljanje mnogim ugrađenim funkcijama koje možda nisu potrebne za
          vaše poslovanje. Sa Next.js i Payload CMS možemo izgraditi tačno ono
          što vam treba, bez nepotrebnog opterećenja. Ovo smanjuje vreme razvoja
          i omogućava efikasniji proces izgradnje.
        </li>
        <li>
          <strong>Skalabilnost za rast:</strong> Sa tradicionalnim CMS
          rešenjima, kako sajt raste (više sadržaja, više posetilaca), može
          postati sporiji ili složeniji za upravljanje. Next.js i Payload CMS su
          dizajnirani da se nose sa velikim količinama sadržaja i saobraćaja,
          bez ugrožavanja performansi ili funkcionalnosti. Ovo je posebno važno
          kako vaše poslovanje raste i treba vam platforma koja može da prati
          taj rast.
        </li>
        <li>
          <strong>SEO optimizacija:</strong> Next.js je dizajniran da bude
          SEO-prijateljski od samog početka. Mogućnost renderovanja stranica na
          serveru omogućava pretraživačima lakše indeksiranje vašeg sadržaja,
          što nije uvek slučaj sa tradicionalnim CMS platformama, posebno onima
          koje se oslanjaju na klijentsko renderovanje.
        </li>
        <li>
          <strong>Laka integracija:</strong> Payload CMS je izgrađen sa
          pristupom zasnovanim na API-ju, što olakšava integraciju sa drugim
          sistemima, uslugama ili alatima koje vaše poslovanje može koristiti u
          budućnosti. Tradicionalni CMS sistemi često zahtevaju komplikovane
          dodatke ili custom razvoj za integracije, što može usporiti napredak.
        </li>
      </ul>

      <h4 className="mb-2 text-lg font-semibold">Ukratko:</h4>
      <p className="mb-4">
        Kombinacija Headless CMS (Payload CMS) i Next.js vam pruža:
      </p>
      <ul className="mb-4 list-disc space-y-2 pl-6">
        <li>Veću fleksibilnost i skalabilnost za budući rast.</li>
        <li>
          Brže performanse sajta koje poboljšavaju korisničko iskustvo i SEO.
        </li>
        <li>
          Pojednostavljeno upravljanje sadržajem sa intuitivnim nadzornim
          panelom.
        </li>
        <li>
          Potpunu prilagodbu koja omogućava izradu jedinstvenog, brendiranog
          digitalnog iskustva.
        </li>
        <li>Laku integraciju sa alatima i uslugama trećih strana.</li>
        <li>
          Pripremu za budućnost koja se lako prilagođava novim tehnologijama.
        </li>
      </ul>
      <p className="mb-4">
        Ovo rešenje vam daje najbolje od oba sveta: fleksibilan, brz i
        skalabilan sajt koji može da raste sa vašim poslovanjem, sve to uz
        platformu koja je korisniku prijateljska za upravljanje sadržajem.
        Birajući Payload CMS i Next.js, ulažete u moderno, efikasno i robusno
        veb rešenje koje će nastaviti da pruža vrednost u budućnosti.
      </p>
    </Section>
  );
}
