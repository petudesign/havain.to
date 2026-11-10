# Research brief

Given to the research agent on 2026-11-10. Written in Finnish; kept verbatim.

Sections A–E map to the case: A = 2D barcodes (the outside change), B = food waste context, C = existing solutions, D = simulation parameters, E = prototype technical checks.

```text
ROOLI JA KONTEKSTI
Olet tutkimusassistentti. Autat UX- ja palvelumuotoilijaa portfolioprojektissa. Tänään on 10.11.2026.

Projekti: vuonna 2025 tein palvelukonseptin (S-hävikki) siitä, miten ruokakaupan työntekijät löytävät päiväykseltään vanhenevat tuotteet hyllystä. Konseptin suurin aukko oli data: tavallinen EAN-viivakoodi ei kerro päiväystä, joten tarkistus on käsityötä. Nyt teen jatkoprojektin, joka tutkii, mitä GS1:n 2D-koodit (päiväys koneluettavana) muuttavat hyllytyössä. Rakennan simulaation, joka vertaa nykyistä tarkistuskierrosta priorisoivaan hyllykarttaan, sekä prototyypin, jossa GS1 Digital Link -QR-koodin skannaus päivittää hyllykartan.

Tarvitsen tutkimuksesta (1) faktapohjan case-tekstiin ja (2) perustellut parametrit simulaatioon. Tarkistan itse jokaisen lähteen, joten lähteiden on oltava jäljitettäviä.

TUTKIMUSKYSYMYKSET

A. GS1 2D-koodit
1. Mikä on GS1 Sunrise 2027? Mitä tarkalleen pitää olla valmiina, ja mihin mennessä?
2. Mikä on tilanne Suomessa: GS1 Finland, S-ryhmä, Kesko, Lidl, valmistajat? Onko pilotteja tai julkisia aikatauluja?
3. Mitkä tuoteryhmät siirtyvät ensin (tuoretuotteet, liha, maito)?
4. Mitä tietoa koodeihin voi sisältyä (sovellustunnisteet, esim. AI 01, 10, 15, 17), ja mitä ero DataMatrixin ja GS1 Digital Link -QR:n välillä on käytännössä?
5. Kansainväliset esimerkit, joissa kauppa käyttää 2D-koodien päiväysdataa hävikin vähentämiseen tai automaattiseen alennukseen. Tulokset numeroina, jos niitä on.
6. Rajoitukset ja kritiikki: kustannukset, painotekniikka, kassajärjestelmät, hidas käyttöönotto.

B. Ruokahävikki: konteksti
7. Kaupan ruokahävikin määrä Suomessa (Luonnonvarakeskus Luke ym.): kokonaismäärä, osuus koko ketjusta ja tuoteryhmittäin, jos saatavilla.
8. EU:n jätedirektiivin uudistuksen ruokahävikkitavoitteet vuodelle 2030 sekä kaupan raportointivelvoitteet. Mikä on hyväksytty ja voimassa, mikä vasta ehdotus?

C. Nykyiset ratkaisut
9. Miten päiväystarkistus tehdään suomalaisissa ruokakaupoissa julkisten lähteiden perusteella? Mitä S-ryhmä ja Kesko kertovat omista hävikkikäytännöistään (punalaput, alennusprosentit, hävikkituotteet sovelluksessa)?
10. Kaupalliset päiväystenhallinnan ja dynaamisen hinnoittelun järjestelmät (esim. sähköiset hintalaput, päiväyssovellukset) sekä kuluttajapalvelut kuten ResQ Club ja Too Good To Go. Lyhyesti: mitä ne ratkaisevat ja mitä eivät.

D. Simulaation parametrit (tärkein osio)
Etsi julkaistua dataa tai tutkimusta, ja anna jokaisesta vaihteluväli ja lähde:
11. Maitotuotteiden ja muiden tuoretuotteiden tyypillinen myyntiaika hyllyllä.
12. Kuinka suuri osa asiakkaista ottaa tuoreimman tuotteen hyllyn takaa?
13. Miten lähellä päiväystä annettu alennus vaikuttaa myyntitodennäköisyyteen?
14. Työaika, jonka päiväystarkistus vie, ja kuinka moni vanheneva tuote jää huomaamatta manuaalisessa tarkistuksessa.
Jos suoraa dataa ei ole, sano se. Älä arvioi lukua itse.

E. Tekninen tarkistus (prototyyppiä varten)
15. Tukeeko iOS Safari BarcodeDetector-rajapintaa marraskuussa 2026? Käyttääkö iOS:n Chrome EU:ssa yhä WebKitiä, vai onko Google julkaissut Blink-moottorilla toimivan version?
16. GS1 Digital Link -URI:n syntaksi. Saako domainina käyttää omaa domainia (esim. https://esimerkki.fi/01/...)? Miten päiväys (AI 17) merkitään?
17. Mitä GTIN-numeroita on asianmukaista käyttää testi- ja demokäytössä, jotta ei käytetä oikeiden tuotteiden koodeja (esim. kauppakohtaiset numeroalueet)?

SÄÄNNÖT
- Käytä ensisijaisesti alkuperäisiä lähteitä: GS1, Luke, EU:n viralliset asiakirjat, yritysten omat tiedotteet, vertaisarvioitu tutkimus. Toissijaiset lähteet (uutiset, blogit) vain, jos ensisijaista ei löydy, ja merkitse ne sellaisiksi.
- Älä keksi lukuja, lähteitä tai URL-osoitteita. Jos et löydä jotain, kirjoita "ei löytynyt".
- Erottele Suomi, EU ja globaali tieto.
- Merkitse jokaiseen tietoon julkaisupäivä. Jos tieto on vanhempaa kuin 2024, mainitse se.
- Jos lähteet ovat ristiriidassa, näytä molemmat.
- Lainauksia korkeintaan muutama lause per lähde. Muuten tiivistä omin sanoin.

TULOSMUOTO (markdown, suomeksi)
1. Tiivistelmä (enintään 10 kohtaa): tärkeimmät löydökset.
2. Löydökset kysymyksittäin (A1–E17). Jokaisesta väitteestä:
   - väite
   - lähde: julkaisija, otsikko, URL, julkaisupäivä
   - lähteen tyyppi: ensisijainen / toissijainen
   - varmuus: korkea / keskitaso / matala ja lyhyt perustelu
3. Parametritaulukko simulaatioon: parametri | arvo tai vaihteluväli | lähde | varmuus | huomio.
4. Avoimet kysymykset ja ristiriidat.
5. Mitä tämä tarkoittaa projektille: enintään 5 kohtaa, erikseen merkittynä omaksi tulkinnaksesi.
6. Lähdeluettelo.
```
