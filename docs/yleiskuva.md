# Hyllykartta: yleiskuva (tilanne 10.11.2026)

Tiivistelmä, jonka voi antaa toiselle avustajalle (esim. ChatGPT) kontekstiksi. Tarkemmat tiedot ovat docs-kansion muissa tiedostoissa.

## Mikä tämä on

Petteri Helttulan portfolioprojekti (petu.design). Se jatkaa vuoden 2025 palvelukonseptia **S-hävikki**, joka käsitteli päiväykseltään vanhenevien tuotteiden löytämistä ruokakaupan hyllystä. S-hävikin suurin aukko oli data: tavallinen EAN-viivakoodi ei kerro päiväystä, joten tarkistus on käsityötä.

**Uusi kysymys:** mitä GS1:n 2D-koodit (päiväys koneluettavana, "Sunrise 2027") muuttavat hyllytyössä, ja auttaako hyllykartta oikeasti?

**Pääviesti:** *2D-koodi kertoo mitä ja milloin. Hyllykartta kertoo missä.*

- Oma projekti, joka viittaa S-hävikkiin. S-hävikki pysyy portfoliossa ennallaan.
- Ketjuneutraali, ei sidottu S-ryhmään. Petterin oma kokemus on Keskolta (K-Citymarketin maito-osasto, n. 4 v, vuoteen 2021). Nykyinen kosketus kauppaan tulee henkilökohtaisten kontaktien kautta eri kokoisissa K-kaupoissa (tarkemmat tiedot vain paikallisesti, `docs/private/`).
- Repo: https://github.com/petudesign/hyllykartta (paikallisesti `Documents/ChatGPT/Hyllykartta`). **Mitään ei ole vielä commitoitu eikä pushattu.**
- Kieli: koodi ja dokumentaatio englanniksi (case kirjoitetaan englanniksi), prototyypin käyttöliittymä suomeksi ja englanniksi.

## Mitä on tehty

1. **Tutkimus** (`docs/research/`): tutkimusagentin raportti (`report.md`) ja lähteiden tarkistuslista (`verification.md`), jonka Petteri käy läpi. Tärkeimmät löydökset:
   - Sunrise 2027 on toimialan tavoite, ei laki.
   - Suomessa ollaan pilottivaiheessa: Keskon Pirkka-kana (2024) ja S-ryhmän, Fazerin ja GS1:n pilotti (12/2025, päiväys ja erä koodissa).
   - Norjassa NorgesGruppen vähensi hävikkiä 18 %, kun päiväys oli viivakoodissa.
   - Aalto (Saarinen): automaattiset päiväysalennukset vähensivät hävikkiä n. 10 %.
   - Kaupan hävikki Suomessa on 0,92 % (Luke 2025).
   - EU-direktiivi 2025/1892: −30 % asukasta kohden vuoteen 2030 mennessä.
   - Hyllyn takaa poimii maidossa 45 % asukkaista (Hübner; tarkistamatta).
   - **Kahdesta tärkeimmästä parametrista ei ole julkaistua dataa:** kuinka kauan maitotuote on hyllyssä ja kauanko päiväystarkistus vie.
2. **Simulaatio** (`sim/model.js`, sivu `index.html`): yksi maitohylly (40 hyllyosiota), 4 viikkoa, 200 ajoa. Neljää tapaa verrataan samalla kysynnällä ja samalla työajalla:
   - **Kierros** (nykytapa)
   - **Käsin päivitetty kartta** (S-hävikki 2025)
   - **Kartta + 2D-data**
   - **Kartta + 2D + myyntitahti** (lappu vain sille määrälle, joka ei ehdi myydä)
3. **Puhelinprototyyppi** (`app/`):
   - iPhonen kamera lukee GS1 Digital Link -QR-koodin. Uusi erä kirjataan vastaanotetuksi, ja jos erällä on tehtävä, skannaus vahvistaa oikean tuotteen.
   - Tehtävät näkyvät yksi kerrallaan selkokielellä.
   - "En löydä" on normaali vastaus, ja jokaisen toiminnon voi perua.
   - Hyllykartassa tila näytetään ikonilla ja sanalla.
   - Roolirajaus, kielet suomi ja englanti, demotyökalut sekä QR-arkki (`app/qr.html`).
   - Demokoodeissa käytetään GS1:n esimerkkietuliitettä 952.
4. **Dokumentaatio** (`docs/`): päätösloki, rakennusloki, käyttäjät, suunnitteluperiaatteet, kenttähavainnot, ideat sekä tutkimuksen brief ja raportti.

## Tärkeimmät tulokset (mallissa, oletuksilla)

20 minuuttia päivässä, per hylly per viikko, verrattuna nykytapaan:

| Tapa | Kate | Kate työaika huomioiden (20 €/h, oletus) | Hävikki € | Huomaamatta jääneet | Työaika/pv |
|---|---|---|---|---|---|
| Kierros | 0 | 0 | 21 | 4,5 | 19 min |
| Käsin päivitetty kartta | ±0 | +14 € | 15 | 0,8 | 14 min |
| Kartta + 2D | ±0 | +32 € | 13,5 | 0 | 4 min |
| Kartta + 2D + myyntitahti | ±0 | +41 € | 16,5 | 0,3 | 3 min |

- **Hyöty syntyy työajasta ja hävikistä.** Hävikki laskee noin kolmanneksella, eikä katteessa ole eroa, kun työaikaa ei lasketa.
- **Uusi työntekijä:** nykytavassa huomaamatta jäävät 5–14 tuotetta viikossa koko testatulla taitotasojen vaihteluvälillä. Kartta + 2D jättää 0, ja sen tulos ei riipu siitä, kuka on töissä.
- **Saldoheitto** (varkaudet, rikkoutuneet, hukatut tuotteet) aiheuttaa turhia käyntejä mutta ei huomaamatta jääviä eriä.
- **Lappu ei ole pelastus:** noin 6–8 lapullista tuotetta viikossa päätyy silti hävikkiin.
- **Tärkeä tarina casea varten:** ensimmäinen malli väitti, että 2D-kartta heikentää katetta. Petterin kenttäkokemus osoitti tuloksen johtuneen epärealistisesta hyllystä, koska nopeat myyjät eivät käytännössä koskaan ehdi lähelle päiväystä. Korjattu malli on maltillisempi mutta uskottavampi.
- **Tulokset ovat vertailua oletusten varassa, eivät ennusteita.** Useimmat parametrit ovat oletuksia, jotkin Petterin kokemukseen perustuvia (`experience`). Casessa esitetään vaihteluvälejä, ei yksittäisiä lukuja.

## Suunnitteluperiaatteet (`docs/design-principles.md`)

- **P1:** suunnitellaan vuoron uusimmalle työntekijälle. Alalla on suuri vaihtuvuus, eikä uusi työntekijä tunne kauppaa.
- **P2:** työkalu ei syrji. Myös erityistarpeiset työntekijät pystyvät käyttämään sitä. Perustana kognitiivinen saavutettavuus (W3C COGA, WCAG 2.2): yksi tehtävä kerrallaan, selkokieli, ei aikapainetta, peruminen, väri ei koskaan ainoa vihje ja tehtävien rajaus roolin mukaan.
- **P3:** ei vain maito-osastoa eikä yhtä ketjua tai kauppakokoa.
- **P4:** kartta kehottaa tarkistamaan eikä väitä saldoa todeksi.
- **P5:** lappu ei ole pelastus.

## Avoimet ideat (`docs/ideas.md`)

**I1, sähköiset hintalaput:**
- Kun vanheneva erä on hyllypaikallaan ainoa, sähköinen hintalappu vaihtaa alennushinnan automaattisesti, eikä paperilappua tarvita.
- Jos eriä on useita, tarvitaan kassa, joka lukee 2D-päiväyksen, tai sitten paperilappu.
- Vastaanottoskannaus päättää alennuksen, kun hyllyyn tuodaan uusi erä.
- Mallissa yhden erän tilanteita on 0 %, jos hylly täytetään joka aamu, ja 41–67 %, jos täydennetään kokonaisina laatikoina. Oikea täydennystapa selvitetään haastatteluissa.

## Mitä seuraavaksi

1. **Commit ja push GitHubiin, sitten Vercel-julkaisu** (esim. `hyllykartta.petu.design`). Rewrite-sääntö on valmiina `vercel.json`:ssa. Ennen julkaisua prototyyppiä voi testata iPhonella samassa wifissä osoitteessa `http://<koneen IP>:8010/app/qr.html`.
2. **Lähteiden tarkistus** (`docs/research/verification.md`), erityisesti Hübnerin 45 %.
3. **Haastattelut, 3–5 kpl.** Mukana tuttuja kaupan työntekijöitä ja vähintään yksi haastateltava, jota Petteri ei tunne, tai toisesta ketjusta. Kysymykset löytyvät tiedostosta `docs/field-notes.md`. Tärkeimmät:
   - kauanko päiväystarkistus oikeasti vie
   - miten hylly täydennetään
   - onko kaupassa sähköiset hintalaput
   - kuinka paljon lapullisia tuotteita päätyy hävikkiin
   - Kysy lupa ennen kuin ketään mainitaan casessa.
4. **Tutkimuksen jatkokysymykset F1–F9** (`docs/research/follow-up.md`): vaihtuvuus, erityistarpeisten työllistäminen, saavutettavuus, muut tuoteryhmät, kauppakoot, perehdytys, sähköiset hintalaput, hintamerkintäsäännöt ja Saarisen tutkimus.
5. **Malli:**
   - hintalappustrategia (M11) ja täydennystapa (M12)
   - tuoteryhmäprofiilit (M9) ja kauppakoot (M8)
   - järjestelmän takaisinmaksulaskelma (M6)
   - uuden työntekijän skenaario simulaatiosivulle (M10)
6. **Prototyyppi:** sähköisen hintalapun automaattinen alennus ("tehty automaattisesti") ja käytettävyystesti uudella työntekijällä.
7. **Case-sivu portfolioon** ja S-hävikki-caseen linkki "Revisited in 2026 →". Case-sivu kirjoitetaan lopuksi docs-kansion pohjalta.

## Paikallinen ajo

```bash
node /Users/petu/Documents/ChatGPT/Hyllykartta/tools/dev-server.mjs 8010
```

- Simulaatio: http://localhost:8010/
- Prototyyppi: http://localhost:8010/app/
- Jos mallia muutetaan, aja `node sim/precompute.mjs` (sivun tulokset) ja `node sim/run.mjs` (tulokset komentoriville).
- Testit: `node tests/digital-link.test.mjs`
