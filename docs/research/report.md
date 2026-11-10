# S-hävikki 2: GS1 2D-koodit, päiväysdata ja hyllytyö

Tutkimusmuistio · koottu 10.11.2026

**Miten tätä luetaan.** Jokaisen väitteen kohdalla on lähde, sen tyyppi ja varmuus. Merkinnällä **[avattu]** tarkoitan, että luin sivun itse tätä muistiota varten. Merkintä **[ei avattu]** tarkoittaa, että sivu esti automaattisen haun (HTTP 403) ja tieto on peräisin hakukoneen tiivistelmästä. Ne on tarkistettava ennen käyttöä. Jos jotain ei löytynyt, kirjoitan "ei löytynyt" enkä arvioi lukua itse.

---

## 1. Tiivistelmä

1. **Sunrise 2027 on toimialan tavoite, ei laki.** Tavoitteena on, että kassat lukevat GTIN-koodin sekä viivakoodista että 2D-koodista vuoden 2027 loppuun mennessä. EAN-viivakoodi säilyy pakkauksissa rinnalla, kunnes 90 % kassoista lukee 2D-koodeja. (GS1, ohjeistus 12/2025)
2. **Suomessa ollaan pilottivaiheessa.** Kesko toi 2D-koodin 28 Pirkka-kanatuotteeseen 8/2024, mutta koodi sisältää kuluttajatietoa, ei päiväystä. S-ryhmän, Fazerin ja GS1:n pilotissa (12/2025) koodissa on parasta ennen -päiväys ja erätieto, mutta pilotti ei vielä tähtää käyttöönottoon. Julkista kassa-aikataulua ei löytynyt.
3. **Päiväysdatasta on vahvin näyttö Norjasta.** NorgesGruppenin pilotissa (alkoi 2019) tuoretuotteiden hävikki pieneni keskimäärin 18 %. Woolworthsin tapauskuvauksessa hävikki pieneni "jopa 40 %" ja tuottavuus parani "jopa 21 %", mutta luvut ovat GS1:n tapauskuvauksesta.
4. **Suomalainen tutkimus on olemassa.** Lauri Saarisen (Aalto) verkkokauppapilotissa päiväykseen sidotut automaattiset alennukset pienensivät hävikkiä 9,6–10 %, kalliissa tuoteryhmissä jopa 15 %.
5. **Kaupan hävikki Suomessa:** Luken mukaan 0,97 % kaupan läpi kulkevista elintarvikkeista päätyi hävikiksi vuonna 2024 ja 0,92 % vuonna 2025. Vuonna 2018 osuus oli 1,6 %. Suhteessa myyntimäärään hävikki on suurinta tuoreessa leivässä (3,6 %).
6. **Kaupan osuudesta koko ketjun hävikistä on kolme eri lukua:** 7 % (Luke, 2023), noin 13 % (uutinen, 2024) ja 15 % (uutinen, 2024). Ero johtuu luultavasti rajauksista. Tarkista ennen julkaisua.
7. **EU-direktiivi 2025/1892 on hyväksytty ja voimassa (16.10.2025).** Tavoitteet vuoden 2030 loppuun: hävikkiä 10 % vähemmän jalostuksessa ja 30 % vähemmän asukasta kohden kaupassa, ravintoloissa ja kotitalouksissa yhteensä. Vertailutasona on vuosien 2021–2023 keskiarvo. Kansallinen toimeenpano on tehtävä viimeistään 17.6.2027. Pelkälle kaupalle ei ole omaa tavoitetta.
8. **Simulaation parametreista on vähiten dataa.** Hyllyn takaa tuoreimman tuotteen ottavien asiakkaiden osuudesta löytyi yksi kenttämittaus: 29 % kaikista otoista ja 45 % maidossa (Hübner, TUM, 2022), mutta luku pitää vielä tarkistaa. Maitotuotteiden myyntiajasta hyllyssä ja päiväystarkistukseen kuluvasta työajasta ei löytynyt julkaistua dataa.
9. **iOS Safari ei tue BarcodeDetector-rajapintaa oletuksena.** Can I Usen mukaan Safari iOS 17–27.2:ssa ominaisuus on "Disabled by default". Chrome iOS:llä käyttää yhä WebKitiä myös EU:ssa. Prototyyppi tarvitsee siis WebAssembly-pohjaisen lukijan.
10. **Demokäytössä käytetään GS1-etuliitettä 952,** joka on varattu esimerkeille. Kauppakohtaiset numerot (02, 20–29) eivät sovi, koska niitä ei saa yhdistää sovellustunnisteisiin eikä siten Digital Link -osoitteeseen. Oma domain on Digital Linkissä sallittu, ja päiväys merkitään `?17=VVKKPP`.

---

## 2. Löydökset kysymyksittäin

### A. GS1 2D-koodit

#### A1. Mikä on GS1 Sunrise 2027?

| Väite | Lähde | Tyyppi | Varmuus |
|---|---|---|---|
| **Globaali.** Tavoitteena on, että kassat lukevat GTIN-koodin sekä viivakoodista että 2D-koodista vuoden 2027 loppuun mennessä. | GS1, *2D Barcodes at Retail Point-of-Sale Implementation Guideline*, Release 1.1.0, ratifioitu 12/2025. https://ref.gs1.org/guidelines/2d-in-retail/ [avattu] | ensisijainen | korkea: GS1:n oma ohjeistus |
| **Globaali.** Kun pakkauksessa on 2D-koodi, siinä on myös oltava kassalla luettava viivakoodi, kunnes 90 % kassojen lukulaitteista lukee GS1-yhteensopivia 2D-koodeja. 2D-koodin tulee olla enintään 50 mm:n päässä viivakoodin keskikohdasta. | sama | ensisijainen | korkea |
| **Globaali.** Kyse ei ole lakisääteisestä velvoitteesta. GS1 US:n mukaan kaikkia 2D-ominaisuuksia ei tarvitse ottaa käyttöön tavoitepäivään mennessä. | GS1 US, *Sunrise 2027*, https://www.gs1us.org/industries-and-insights/by-topic/sunrise-2027 [avattu, ei päiväystä, © 2026] | ensisijainen | korkea |
| **Ristiriita.** Osa valmistajien ja ratkaisutoimittajien blogeista puhuu "pakosta" (esim. "must be capable by December 31, 2027"). GS1:n omat tekstit eivät käytä velvoittavaa sanamuotoa. | esim. https://www.atlasrfidstore.com/rfid-insider/what-is-gs1s-sunrise-2027-who-is-affected-by-it/ | toissijainen | keskitaso: kaupallinen tulkinta |

#### A2. Tilanne Suomessa

| Väite | Lähde | Tyyppi | Varmuus |
|---|---|---|---|
| **Kesko** toi GS1 2D-koodin ensimmäisenä 28 Pirkka-kanatuotteeseen elokuussa 2024. Koodi sisältää kypsennysohjeita, vastuullisuustietoa ja linkkejä. Päiväystä tai eränumeroa ei ole. Eränumerot ovat Keskon mukaan tulevaisuuden tavoite (hävikki, takaisinvedot, dynaaminen hinnoittelu), ja ne edellyttävät investointeja pakkauslinjoihin. Kesko selvittää kassojen ja varastojärjestelmien valmiutta ja päivittää järjestelmiä vaiheittain. | GS1 Finland, "Kesko tähtää GS1 2D-koodeilla kattavampaan asiakasviestintään", 5.8.2024. https://gs1.fi/fi/uutiset/kesko-tahtaa-gs1-2d-koodeilla-kattavampaan-asiakasviestintaan-helposti-saatavilla-olevalla [avattu] | ensisijainen (yhteistiedote) | korkea |
| **S-ryhmä, Fazer, KLINGER Finland ja GS1** pilotoivat dynaamista 2D-koodia Fazer Remix -makeispussissa joulukuusta 2025 alkaen. Jokaisella pussilla on oma koodi, jossa on GTIN, parasta ennen -päiväys ja erätieto. S-ryhmän mukaan pilotti ei vielä tähtää varsinaiseen käyttöönottoon vaan on oppimisalusta. Kassat lukevat GTIN-koodin kuten EAN-koodin. | S-ryhmä, 4.12.2025. https://s-ryhma.fi/uutinen/fazer-s-ryhma-klinger-finland-ja-gs-1-testaavat-yh/6oHeLx0C0ioksgqC7XfUxG [avattu] | ensisijainen | korkea |
| **GS1 Finland (1/2026):** "Myös Suomessa GS1 2D-koodeja pilotoidaan." Useimmat nykyiset skannerit lukevat 2D-koodeja jo, joten muutos vaatii usein vain ohjelmisto- ja asetuspäivityksiä. Vaiheistettua kansallista aikataulua ei mainita. | GS1 Finland, "GS1 2D-koodi tuo kassalle uuden aikakauden", 26.1.2026. https://gs1.fi/fi/ajankohtaista/blogit/gs1-2d-koodi-tuo-kassalle-uuden-aikakauden [avattu] | ensisijainen | korkea |
| **GS1 Finlandin Food Data -hanke:** vuoden 2026 keskeinen teema on 2D-koodin käyttöönoton edistäminen ruokaketjussa. | https://fooddata.gs1.fi/fi/teemat [ei avattu, hakutiivistelmä] | ensisijainen | keskitaso |
| **Lidl Suomi:** Suomea koskevaa pilottia tai aikataulua ei löytynyt. Lidl on mainittu allekirjoittajana kansainvälisessä kauppajohtajien julkilausumassa 6/2024. | GS1 Finland, 26.6.2024. https://gs1.fi/fi/yritysjohtajien-julkilausuma [ei avattu] | ensisijainen | matala: allekirjoittajalistaa ei tarkistettu |
| **Valmistajat (Valio, Atria, HKScan):** ei löytynyt julkisia 2D- tai päiväyskoodiaikatauluja. | — | — | — |
| **Julkinen kassa-aikataulu Suomessa:** ei löytynyt. | — | — | — |

#### A3. Mitkä tuoteryhmät siirtyvät ensin?

- **Norja:** NorgesGruppen aloitti valikoiduista tuorelihatuotteista, ja koodiin lisättiin GTIN, viimeinen käyttöpäivä, paino ja eränumero. Lähde: Matvett, "Expiry date included in barcode reduces food waste", https://www.matvett.no/bransje/matvett-in-english/expiry-date-included-in-barcode-reduces-food-waste [avattu, ei julkaisupäivää; ratkaisu otettiin käyttöön syksyllä 2019, joten tieto on vanhempaa kuin 2024]. Ensisijainen (toimialan oma organisaatio). Varmuus keskitaso.
- **Suomi:** Kesko aloitti kanatuotteista (kuluttajatieto, ei päiväystä), ks. A2.
- **Suositus:** Saarisen (Aalto) politiikkasuosituksissa painotetaan lihaa ja kalaa sekä nopeasti pilaantuvia tuotteita. Lähde: CBS-seminaarin kuvaus, https://cbs.dk/en/node/550178 (11/2024) [hakutiivistelmä]. Toissijainen. Varmuus keskitaso.
- **GS1:n virallista globaalia tuoteryhmäjärjestystä ei löytynyt.** Maidosta erikseen ei löytynyt tietoa.

#### A4. Koodien sisältö ja DataMatrixin ja QR-koodin ero

| Väite | Lähde | Tyyppi | Varmuus |
|---|---|---|---|
| Kassakäyttöön hyväksytyt 2D-symbolit ovat GS1 DataMatrix (GS1-elementtijono), QR-koodi (GS1 Digital Link -URI) ja Data Matrix (GS1 Digital Link -URI). | GS1 2D in Retail -ohjeistus, Release 1.1.0, 12/2025 [avattu] | ensisijainen | korkea |
| Kaupan sovellustunnisteet (AI) ohjeistuksen taulukossa 4-3: **01** GTIN, **10** erä, **11** valmistuspäivä, **13** pakkauspäivä, **15** parasta ennen, **17** viimeinen käyttöpäivä, **21** sarjanumero, **22**, 240/241/243, 30, **310n/320n** nettopaino, 392n/393n/395n hinta, 422 alkuperämaa, 7003 viimeisen käytön kellonaika, 8008 valmistusaika. **AI 16 (sell-by) puuttuu taulukosta.** Ohjeistuksen mukaan tuetut tunnisteet vaihtelevat kaupan ja lukupaikan mukaan. | sama | ensisijainen | korkea (taulukko luettu sivun alusta; loppuosaa ei luettu) |
| Käytännön erot. **DataMatrix:** elementtijonoja, vaatii erikoissovelluksen, pienin koko, käytössä terveydenhuollossa, kuvantavissa skannereissa usein pelkkä asetuksen kytkentä. **QR + Digital Link:** URI, aukeaa puhelimen kameralla, suurempi koko, vaatii skannerin ohjelmistopäivityksen. | sama | ensisijainen | korkea |
| Kassa voi päiväyksen perusteella estää vanhentuneen tuotteen myynnin, ja päiväysperusteinen automaattinen alennus on mainittu käyttötapauksena. Ohjeistus ei määrittele, miten kassan logiikka toteutetaan. | sama | ensisijainen | korkea |

#### A5. Kansainväliset esimerkit

| Esimerkki | Tulos | Lähde | Tyyppi | Varmuus |
|---|---|---|---|---|
| **NorgesGruppen (Meny, Kiwi, Spar), Norja**, pilotti alkoi 2019 | Hävikki pieneni 18 % rahallisesti 14 valitussa tuotteessa (Matvett). GS1 Finlandin mukaan tuoretuotteiden hävikki pieneni keskimäärin 18 % tuotetta kohden. Kassa päivittää myymälän saldot eräkohtaisesti myynnin yhteydessä. | Matvett [avattu, ei päiväystä]; GS1 Finland 23.6.2026, https://gs1.fi/fi/uutiset/norjalaiskauppa-vahensi-ruokahavikkia-18-prosenttia-uudella-viivakoodiratkaisulla [avattu] | ensisijainen | keskitaso: kaupan oma ilmoitus, ei riippumatonta arviointia, 2019 alkanut pilotti |
| NorgesGruppen, automaattinen alennus | Päiväysdatan avulla hinta alenee automaattisesti päiväyksen lähestyessä, eikä henkilökunnan tarvitse tarkistaa pakkauksia yksitellen. Kassa voi estää vanhentuneen tuotteen myynnin. | GS1 Finland, "Päiväystieto viivakoodissa auttaa vähentämään ruokahävikkiä", 22.9.2026, https://gs1.fi/fi/uutiset/paivaystieto-viivakoodissa-auttaa-vahentamaan-ruokahavikkia [avattu] | ensisijainen | keskitaso |
| **Woolworths, Australia**, kokeilu alkoi 2019 | "Jopa 40 %" vähemmän hävikkiä kokonaan 2D-koodeihin siirtyneissä tuotteissa ja "jopa 21 %" parempi tuottavuus, koska hintoja ei tarvitse merkitä käsin. Koodina GS1 DataMatrix, jossa on GTIN, erä, parasta ennen, nettopaino ja hinta. | GS1 case study, https://www.gs1.org/system/files/case-study-woolworths-gs1australia.pdf (PDF muokattu 5/2022) [ei luettavissa, hakutiivistelmä] | ensisijainen (GS1:n tapauskuvaus) | keskitaso: "jopa"-lukuja, vanhempaa kuin 2024 |
| **Aalto / suomalainen verkkoruokakauppa** | Päiväykseen sidotut automaattiset alennukset pienensivät hävikkiä 10 %, kalliissa tuoteryhmissä jopa 15 %. | GS1 Finland, 8.9.2025, https://gs1.fi/fi/uutiset/2d-viivakoodit-mahdollistavat-ruokakauppojen-havikkiin-muutoksen-josta-hyotyvat-seka-kaupat [avattu] | ensisijainen (tutkijan haastattelu) | keskitaso |
| sama tutkimus | 9,6 % hävikin vähennys keskeisissä tuoretuoteryhmissä | CBS-seminaarin kuvaus, https://cbs.dk/en/node/550178 (11/2024) [hakutiivistelmä] | toissijainen | keskitaso (ks. ristiriidat) |
| **METRO / Makro Puola + Wasteless** | Wastelessin mukaan 30 toimipaikassa kate parani 25 %. METROn koko yhtiön hävikki pieneni 15,3 % vuosina 2017/18–2020/21, mutta lukua ei voi kohdistaa dynaamiseen hinnoitteluun. | https://wasteless.com/success/margins-soar-by-25-at-polish-wholesaler; Packworld [hakutiivistelmä] | toissijainen / toimittajan markkinointi | matala |
| **Tesco, Iso-Britannia** | GS1 Digital Link -QR-kokeilu (päiväystarkkuus, hävikki, vanhentuneiden myynnin esto). Tuloksia ei ole julkaistu. | IT Brief UK, 9.12.2025, https://itbrief.co.uk/story/tesco-trials-2d-qr-barcodes-as-eu-demand-for-data-grows [avattu] | toissijainen | keskitaso (kokeilu on olemassa, tuloksia ei ole) |
| **Hintojen muutostiheys** | Hintamuutokset lisääntyivät 853 % EU-myymälässä, jossa otettiin käyttöön sekä sähköiset hintalaput että laajennetut viivakoodit. Pelkillä hintalapuilla lisäys oli 54 % (UK). | Chehrazi, Sanders & Stamatopoulos, *Marketing Science* (hyväksytty), uutinen 24.7.2024, https://olin.washu.edu/about/news-and-media/news/2024/07/detailed-info-about-grocery-inventories-enable-dynamic-pricing.php [avattu] | ensisijainen (yliopiston tiedote vertaisarvioidusta artikkelista) | keskitaso |

#### A6. Rajoitukset ja kritiikki

- **Kustannukset:** GS1 Finland listaa kustannuserät (yritystunnus, skannerit, kassa- ja varastojärjestelmät, painolaitteet, verkkosisältö, koulutus), mutta **euromääriä ei ole**. Lähde: GS1 Finland, "Mitä GS1 2D-koodin käyttöönotto maksaa?", 25.4.2024, https://gs1.fi/fi/ajankohtaista/blogit/mita-gs1-2d-koodin-kayttoonotto-maksaa [avattu]. Ensisijainen. Varmuus korkea (ja kustannukset puuttuvat).
- **Painaminen:** Päiväyksen ja erän lisääminen vaatii muuttuvan tiedon tulostusta pakkauslinjalla ja investointeja (Kesko 8/2024). GS1 Finlandilla on aiheesta blogi 24.6.2026, jota en avannut.
- **Kassat:** Ohjeistus on valmis vasta, kun 90 % kassoista lukee 2D-koodeja. Siihen asti tarvitaan kaksoismerkintä (A1).
- **Hidas käyttöönotto:** S-ryhmän pilotti "ei vielä tähtää käyttöönottoon" (12/2025). Kesko aloitti kuluttajatiedosta, ei päiväyksestä (8/2024).
- **Riippumatonta kriittistä tutkimusta 2D-koodien kustannus-hyötysuhteesta ei löytynyt.**

### B. Ruokahävikki

#### B7. Kaupan hävikki Suomessa

| Väite | Lähde | Tyyppi | Varmuus |
|---|---|---|---|
| **2025:** 0,92 % kaupan läpi kulkevista elintarvikkeista päätyi hävikiksi. Vuonna 2018 osuus oli 1,6 %, joten lasku on yli 40 %. | Verkkouutiset 23.9.2026 (Luken laskelma, PTY:n tiedote), https://www.verkkouutiset.fi/a/nain-paljon-kauppojen-ruokaa-paatyy-havikkiin/ [avattu] | toissijainen (Luken alkuperäistä tiedotetta ei löytynyt) | keskitaso |
| **2024:** 0,97 %. Suhteessa myyntimäärään hävikki on suurinta tuoreessa leivässä ja leivonnaisissa (3,6 %). Määrältään suurin ryhmä on hedelmät, vihannekset, peruna ja marjat: 24,6 milj. kg vuonna 2018 ja noin 16 milj. kg vuonna 2024. | Verkkouutiset 22.9.2025, https://www.verkkouutiset.fi/a/kaupan-osuus-ruokahavikista-enaa-alle-prosentin/ [avattu] | toissijainen | keskitaso |
| **2023:** noin 0,9 %. Leivän hävikki pieneni noin 7 milj. kg ja kasvisten noin 5 milj. kg vuodesta 2018. | Verkkouutiset 23.9.2024 [avattu] | toissijainen, yli vuoden vanha | keskitaso |
| **Ketjun vaiheet 2023 (Luke):** kotitaloudet ~52 %, elintarviketeollisuus 23 %, ruokapalvelut 13 %, kauppa ja tukku 7 %, alkutuotanto 5 %. Koko ketjussa yli 600 milj. kg ruokahävikkiä ja -jätettä, josta ruokahävikkiä lähes 400 milj. kg. | Luke, CAP-vaikutusindikaattori "Volume of food loss and waste", päivitetty 7.1.2026, https://www.luke.fi/en/statistics/indicators/finlands-cap-impact-indicators/volume-of-food-loss-and-waste [avattu] | ensisijainen | korkea |
| **Ketjun vaiheet 2024:** kauppa ja tukku ~13 %, teollisuus ~13 %, ruokapalvelut ~19 %, alkutuotanto ~10 %, kotitaloudet ~45 %. | Verkkouutiset 23.9.2026 (Luke) [avattu] | toissijainen | keskitaso (ristiriidassa Luken indikaattorin kanssa, ks. luku 4) |
| Kaupan osuus koko ketjun hävikistä on 15 %. | Verkkouutiset 22.9.2025 [avattu] | toissijainen | keskitaso |
| **Maitotuotteiden ja lihan hävikkiprosentit:** ei löytynyt. | — | — | — |
| **Ketjujen omat luvut:** S-ryhmän hävikki oli 1,2 % myynnistä vuonna 2025. K-ryhmän hävikki oli pienentynyt neljänneksellä vuoden 2019 tasosta vuoden 2025 loppuun mennessä. Molempien tavoite on puolittaa hävikki vuoteen 2030 mennessä. | SOK 21.9.2026, https://www.sttinfo.fi/tiedote/72340223/ [avattu]; Kesko 23.4.2026, https://www.kesko.fi/en/media/news-and-releases/news/2026/food-waste-reduced-by-one-million-kilograms--k-food-stores-order-volumes-managed-through-forecasting/ [avattu] | ensisijainen | korkea |

#### B8. EU:n jätedirektiivi

| Väite | Lähde | Tyyppi | Varmuus |
|---|---|---|---|
| **Hyväksytty ja voimassa:** direktiivi (EU) 2025/1892 muuttaa jätedirektiiviä 2008/98/EY. Se allekirjoitettiin 10.9.2025, julkaistiin virallisessa lehdessä 26.9.2025 ja tuli voimaan 16.10.2025. | Euroopan parlamentti, Legislative Train (päivitetty 25.10.2026), https://www.europarl.europa.eu/legislative-train/theme-a-new-plan-for-europe-s-sustainable-prosperity-and-competitiveness/file-revision-of-the-eu-waste-framework [avattu] | ensisijainen | korkea |
| **Sitovat kansalliset tavoitteet 31.12.2030 mennessä:** **−10 %** jalostuksessa ja valmistuksessa, **−30 % asukasta kohden** kaupassa, ravintoloissa, ruokapalveluissa ja kotitalouksissa yhteensä. Vertailutasona on vuosien **2021–2023** keskiarvo. Komission ehdotuksessa vertailuvuosi oli 2020. | sama | ensisijainen | korkea |
| Jäsenvaltioiden on varmistettava, että ruokahävikin kannalta merkittävät toimijat (kansallisesti määriteltävät) **helpottavat myymättä jääneen, turvallisen ruoan lahjoittamista**. | sama | ensisijainen | korkea |
| Kansallinen toimeenpano on tehtävä viimeistään **17.6.2027**. Komissio arvioi vuoden 2030 tavoitteet 31.12.2027 mennessä ja voi ehdottaa uusia. | EUR-Lex, https://eur-lex.europa.eu/eli/dir/2025/1892/oj/eng [sivu ei latautunut, tieto hakutiivistelmästä]; parlamentin sivun mukaan "20 kuukautta voimaantulosta", mikä on yhdenmukaista | ensisijainen | keskitaso: tarkista EUR-Lexistä |
| **Kaupan oma raportointivelvoite:** en löytänyt direktiivistä yksittäiselle kaupalle asetettua raportointivelvoitetta. Direktiivi asettaa velvoitteet jäsenvaltioille. Raportoinnin yksityiskohdat jäivät tarkistamatta. | — | — | matala, ks. luku 4 |
| **Vain ehdotuksia:** parlamentin kanta (−20 % / −40 %, 3/2024) korvautui neuvotelluilla luvuilla. Lähteissä näkyvä "−50 % kaupassa" on YK:n SDG 12.3 -tavoite tai varhainen ehdotus, ei direktiivin tekstiä. | hakutiivistelmä useista lakitoimistolähteistä | toissijainen | keskitaso |

### C. Nykyiset ratkaisut

#### C9. Päiväystarkistus ja hävikkikäytännöt suomalaisissa kaupoissa

| Väite | Lähde | Tyyppi | Varmuus |
|---|---|---|---|
| **K-ruokakaupat:** lähellä päiväystä olevat tuotteet alennetaan ja merkitään punaisella lapulla. Monessa kaupassa ne siirretään erilliselle hävikkihyllylle. Punalappumyynti oli vuonna 2025 yli 40 % suurempi kuin 2021. Valmisruoat ja leipä olivat ostetuimpia. Myymättä jäänyt syötävä ruoka lahjoitetaan. Tilaukset perustuvat ennusteisiin, joissa huomioidaan myös sää. | Kesko 23.4.2026 [avattu] | ensisijainen | korkea |
| **K-ruoan kuluttajakysely (1/2026, n = 867):** punalappuja ostavista 74 % ostaa niitä sopivan tuotteen osuessa kohdalle, 17 % etsii niitä lähes joka käynnillä ja 9 % tulee kauppaan varta vasten. | sama | ensisijainen | korkea (kyselytutkimus) |
| **Keskon viisi keinoa (2023):** ennakointi, punalaput, hävikkilaatikot ja -pussit, hävikistä valmistetut tuotteet sekä biokaasu. 75 % vastaajista osti punalappuja (8/2023). | Kesko 8.9.2023 [avattu] | ensisijainen, vanhempaa kuin 2024 | korkea |
| **S-ryhmä:** punalapputuotteiden −60 % ilta-ale on koko maan käytäntö. Se sai alkunsa henkilökunnan aloitteesta noin vuonna 2017. Asiakkaat ostivat noin 87 milj. punalapputuotetta vuonna 2021. Pelastetuimpia olivat pakattu kala ja liha sekä leipomotuotteet. | SOK 12.9.2022, https://www.sttinfo.fi/tiedote/69950337/ [avattu] | ensisijainen, **vanhempaa kuin 2024** | keskitaso: käytäntö voi olla muuttunut |
| **Ensimmäisen punalapun alennusprosentti ja ajoitus (S- ja K-ryhmä):** julkista virallista tietoa ei löytynyt. | — | — | — |
| **Punalapputuotteet sovelluksessa (S-mobiili, K-Ruoka):** ei löytynyt julkista tietoa. | — | — | — |
| **Itse tarkistusrutiini** (kuka, kuinka usein, millä välineellä): julkista kuvausta ei löytynyt. Saarinen (GS1 Finland 9/2025) toteaa yleisesti, että hyllyssä on usein saman tuotteen eri päiväyksiä eikä kaupalla ole niistä ajantasaista tietoa. | GS1 Finland 8.9.2025 [avattu] | ensisijainen | keskitaso |

#### C10. Kaupalliset järjestelmät ja kuluttajapalvelut (lyhyesti)

| Ratkaisu | Mitä ratkaisee | Mitä ei ratkaise | Lähde |
|---|---|---|---|
| **Sähköiset hintalaput (ESL)** | Hinnan voi muuttaa nopeasti ja usein. | Ilman eräkohtaista päiväysdataa hinta muuttuu koko tuotteelle, ei yksittäiselle erälle (Chehrazi ym.: +54 % pelkillä ESL:illä vs. +853 % laajennettujen viivakoodien kanssa). | WashU 24.7.2024 [avattu] |
| **Päiväyssovellukset** (esim. Upshop, Scandit) | Ohjaavat tarkistusta ja ehdottavat alennuksia. Upshopin mukaan tarkistusaika lyheni "jopa 70 %". | Päiväys syötetään yhä käsin tai luetaan kuvasta. Upshopin väitteelle ei ole lähtötasoa eikä menetelmää. | https://upshop.com/the-labor-advantage-of-prompted-expiry-date-software/ (toimittaja, matala) |
| **Dynaaminen hinnoittelu** (Wasteless) | Laskee alennuksen algoritmilla. | Vaatii päiväystiedon erästä. Tulosväitteet ovat toimittajan omia. | Wasteless (matala) |
| **ResQ Club** | Kauppa myy ylijäämän sovelluksessa. Lähes 2,5 milj. pelastettua annosta tammi–syyskuussa 2025, 1,1 milj. rekisteröitynyttä käyttäjää. | Toimii vasta, kun tuote on jo tunnistettu hävikiksi. Ei auta löytämään vanhenevia tuotteita hyllystä. | ResQ Club, tiedote 9/2025, https://www.sttinfo.fi/tiedote/71460836/ [hakutiivistelmä] |
| **Too Good To Go** | Sama malli. | Sama rajoite. Suomen kauppayhteistyöstä ei löytynyt tietoa. | ei löytynyt |

### D. Simulaation parametrit

#### D11. Maito- ja tuoretuotteiden myyntiaika hyllyssä

**Ei löytynyt.** Julkaistua dataa siitä, montaa päivää maitotuote on hyllyssä tai paljonko myyntiaikaa on jäljellä tuotteen saapuessa myymälään, ei löytynyt suomalaisista eikä kansainvälisistä lähteistä. Löydetyt luvut koskevat laboratorio-olosuhteiden säilyvyyttä (esim. pastöroitu maito noin 25 päivää kontrolliryhmässä, PMC9914688) eivätkä kuvaa myymälää. Niitä ei pidä käyttää parametrina.

Mahdollisia jatkolähteitä: valmistajien ilmoittamat myyntiajat (Valio), Hübnerin väitöskirja (TUM, 2023), Akkaş ym. *Management Science* -julkaisut tuotteiden vanhenemisesta.

#### D12. Kuinka moni asiakas ottaa tuoreimman tuotteen hyllyn takaa?

| Väite | Lähde | Tyyppi | Varmuus |
|---|---|---|---|
| Kenttämittauksen mukaan 29 % otoista (4 809 havaintoa) oli tuotteita, joiden päiväys oli myöhempi kuin edessä olevalla tuotteella. Maidossa osuus oli suurin, 45 %, ja kasvisproteiineissa pienin, 5 %. | A. Hübner (TUM), keynote, Smart Retail Summit, Göttingen, 11/2022, https://uni-goettingen.de/de/document/download/43177edc6917b4c346966777ecb444e3.pdf/1_HÜBNER_KEYNOTE_Smart_Retail_Summit.pdf [PDF ladattiin, tekstiä ei saatu luettua; luvut hakukoneen tiivistelmästä] | ensisijainen (tutkijan esitys) | **keskitaso–matala:** tarkista dioista. Vanhempaa kuin 2024 |
| Sama tutkimusryhmä: "Seeking the Freshest? Preventing Customer Picking for Expiration Dates with Retail Operations". Ensimmäinen kenttämittaus, yli 700 tuntia inventointia, 42 tuotetta, 6 tuoteryhmää. | Hübner, Ostermeier, Schäfer, Winkler, SSRN 4731442 (2024), https://dx.doi.org/10.2139/ssrn.4731442 [ei avattu] | ensisijainen (working paper) | keskitaso: tuloslukuja ei saatu |
| Laboratoriokokeen mukaan kestävyysviestit ja suuremmat alennukset lisäävät aiemmin vanhenevien tuotteiden ostoja. Osa koehenkilöistä ei muuttanut käytöstään. Mallissa kaupan kustannukset ovat jopa 30,25 % pienemmät, jos asiakkaat ottavat vanhimman tuotteen ensin, kuin jos he ottavat tuoreimman. Jos todellista käyttäytymistä ei tunneta, vanhimman ottavien osuus kannattaa yliarvioida mieluummin kuin aliarvioida. | Vogt, Lowery, Sachs, Thonemann, *European Journal of Operational Research* 331(1), 2026, s. 156–169, https://eprints.lancs.ac.uk/id/eprint/232843 [avattu, abstrakti] | ensisijainen, vertaisarvioitu | korkea (abstrakti), osuuksia ei saatu |
| Kuluttajat eivät tiedä hyllyssä olevien tuotteiden päiväyksiä, ja päiväysten tutkiminen on heille vaivalloista. | "Uninformed Choices in Perishables", *Marketing Science*, https://pubsonline.informs.org/doi/10.1287/mksc.2021.0264 [ei avattu] | ensisijainen | keskitaso |

#### D13. Lähellä päiväystä annetun alennuksen vaikutus

| Väite | Lähde | Tyyppi | Varmuus |
|---|---|---|---|
| Päiväykseen sidottu automaattinen alennus pienensi hävikkiä 9,6–10 %, kalliissa ryhmissä jopa 15 %. Kyse on hävikin vähenemisestä, ei myyntitodennäköisyydestä. | Saarinen / GS1 Finland 8.9.2025 ja CBS 11/2024 | ensisijainen / toissijainen | keskitaso |
| Simulaatiossa dynaaminen päiväysalennus toi useimmissa kokeissa noin 2 % lisämyyntiä. Hollantilaisissa kaupoissa kiinteä 35 % alennus on yleinen. | Haijema, Duijvestijn, Akkerman, Cruijssen, "Dynamic expiration date-based discounting of fresh food products", *Int. J. Production Economics* 2025, https://www.sciencedirect.com/science/article/pii/S0925527325003093 [ei avattu] | ensisijainen, vertaisarvioitu | keskitaso: tarkista luvut artikkelista |
| 30 % alennuksella 15 %, 30 % ja 45 % tuoreinta tuotetta valitsevista vaihtaa vanhempaan tuotteeseen. **Nämä ovat mallin skenaariooletuksia, eivät mitattuja lukuja.** | *Int. J. Production Research* 2025, https://www.tandfonline.com/doi/full/10.1080/00207543.2025.2603570 [ei avattu] | ensisijainen | matala: oletus, ei empiriaa |
| Kenttäkoe eurooppalaisessa ketjussa vertasi kolmea dynaamista hinnoittelujärjestelmää ja hävikkituotteiden kylmäkoria. Suositus: järjestelmiä on arvioitava sen mukaan, kuinka moni vanheneva tuote myydään, ei algoritmin hienouden mukaan. | Knox, Cruijssen, van Lin, Wagenaar, SSRN 7048139, https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7048139 [ei avattu] | ensisijainen (working paper) | keskitaso: kertoimia ei saatu |
| Kuluttajat odottavat pilaantuvien tuotteiden laadun heikkenevän ajan myötä (69–84 %). Klassinen tutkimus päiväyksen ja maksuhalukkuuden yhteydestä. | Tsiros & Heilman, *Journal of Marketing* 69(2), 2005, s. 114–129 [ei avattu, toissijaisen lähteen kautta] | ensisijainen | matala: vanha, lukuja ei tarkistettu |
| **Suoraa empiiristä lukua muodossa "X % alennus → myyntitodennäköisyys Y" ei löytynyt.** | — | — | — |

#### D14. Päiväystarkistuksen työaika ja huomaamatta jäävät tuotteet

**Ei löytynyt** vertaisarvioitua tai riippumatonta mittausta tarkistukseen kuluvasta työajasta eikä manuaalisessa tarkistuksessa huomaamatta jäävien tuotteiden osuudesta.

Lähimmät, mutta eivät suoraan sovellettavat:
- Woolworths: "jopa 21 %" tuottavuusparannus, kun päiväyksiä hallitaan järjestelmällä (GS1:n tapauskuvaus, 2022). Prosentti ei kerro lähtötason tunteja.
- Upshop: "jopa 70 %" vähemmän tarkistusaikaa (toimittajan väite, ei menetelmää).
- Turkkilainen työkuormatutkimus: hyllytys ja tuotteiden järjestely vievät yli 30 % myymälätyöntekijöiden ajasta. Päiväystarkistusta ei ole eritelty. https://www.researchgate.net/publication/357329724 [hakutiivistelmä]

### E. Tekninen tarkistus

#### E15. BarcodeDetector ja Chrome iOS:llä

| Väite | Lähde | Tyyppi | Varmuus |
|---|---|---|---|
| Safari iOS 17.0–27.2 ja Safari macOS 17.0–27.3: BarcodeDetector **"Disabled by default"** (kokeellinen asetus). iOS 16.7 ja vanhemmat: ei tukea. Chrome for Android 157: tuettu. | Can I Use, https://caniuse.com/mdn-api_barcodedetector [avattu 10.11.2026; käyttötilastot 10/2026] | toissijainen (kokoaa MDN:n datan) | korkea |
| WebKitin bugiraportin mukaan rajapinta lakkasi toimimasta Safari 17.6:n jälkeen silloinkin, kun kokeellinen asetus on päällä. | WebKit Bugzilla 281848, https://bugs.webkit.org/show_bug.cgi?id=281848 [ei avattu] | ensisijainen | keskitaso |
| **Chrome iOS:llä käyttää yhä WebKitiä myös EU:ssa.** BrowserEngineKit (iOS 17.4, DMA) sallii vaihtoehtoiset moottorit EU:ssa, mutta App Storessa ei ole julkaistu Blink-pohjaista Chromea. Googlella ja Bravella on prototyyppejä (Brave 10/2026). | piunikaweb 29.10.2026; AppleInsider 17.6.2026; Wikipedia "Google Chrome" [hakutiivistelmät] | toissijainen | keskitaso: Googlen omaa ilmoitusta ei löytynyt |
| **Ristiriita:** SpyHunterin vanha artikkeli väittää, että Chrome käyttää Blinkiä iOS:llä EU:ssa. Tuoreemmat lähteet kumoavat väitteen. | https://www.spyhunter.com/shm/apple-list-of-alternate-browsers-available-to-eu-users-in-ios/ | toissijainen, yli 2 v vanha | matala |

#### E16. GS1 Digital Link -URI

| Väite | Lähde | Tyyppi | Varmuus |
|---|---|---|---|
| Rakenne: `https://{domain}/01/{GTIN-14}[/10/{erä}][/21/{sarjanumero}]?17=VVKKPP`. GTIN kirjoitetaan aina 14-numeroisena, ja lyhyemmät GTIN-koodit täytetään alusta nollilla. Erä ja sarjanumero ovat polussa tässä järjestyksessä, kumpikin 1–20 merkkiä. | GS1 Digital Link Standard: URI Syntax, Release 1.7.0, ratifioitu 8/2026, https://ref.gs1.org/standards/digital-link/uri-syntax/ [avattu] | ensisijainen | korkea |
| **Oma domain on sallittu** (esim. `https://brand.example.com/01/09520123456788`). Kanoninen muoto käyttää osoitetta `id.gs1.org`. Sovellus ei saa olettaa, että syntaksin mukainen URL osoittaa resolveriin. | sama | ensisijainen | korkea |
| **Päiväys (AI 17)** on data-attribuutti, joten se kirjoitetaan kyselymerkkijonoon: `?17=VVKKPP`, tasan 6 numeroa (esim. `?17=180426` on 26.4.2018). | sama | ensisijainen | korkea |

Esimerkki prototyyppiin (rakenne standardin mukainen, GTIN keksitty): `https://esimerkki.fi/01/09520123456788/10/ERA42?17=261115`. GTIN-koodin `09520123456788` olen kopioinut standardin esimerkistä. Jos teet omia 952-koodeja, laske jokaiselle GTIN-koodille tarkistusnumero (mod 10).

#### E17. GTIN-numerot demokäyttöön

| Väite | Lähde | Tyyppi | Varmuus |
|---|---|---|---|
| **GS1-etuliite 952** on varattu esimerkeille ja demoille, ja kuka tahansa saa käyttää sitä dokumenteissa ja esityksissä. | GS1 Style Guide, Release 5.5 (11/2024), sääntö "GS1 prefix 952 for examples", https://gs1.org/standards/gs1-style-guide/current-standard [hakutiivistelmä] | ensisijainen | keskitaso–korkea: tarkista sääntöteksti |
| Kauppakohtaiset numerot (**RCN, etuliitteet 02 ja 20–29**) on tarkoitettu suljettuun käyttöön, ja niiden rakenteen määrittelee kansallinen GS1-organisaatio. **RCN-koodeja ei saa koodata sovellustunnisteilla**, ainoastaan EAN-8-, EAN-13-, UPC-A- ja UPC-E-symboleihin. Ne eivät siis sovi Digital Link -URI:in (`/01/...`). | GS1 General Specifications [hakutiivistelmä useista versioista]; GSCN 23-006 RCN, https://www.gs1.org/docs/barcodes/GSCN-23-006-RCN.pdf [ei avattu] | ensisijainen | keskitaso–korkea |

---

## 3. Parametritaulukko simulaatioon

| Parametri | Arvo / vaihteluväli | Lähde | Varmuus | Huomio |
|---|---|---|---|---|
| Kaupan hävikki, osuus läpivirtauksesta | 0,92 % (2025), 0,97 % (2024), 1,6 % (2018) | Luke via Verkkouutiset 2025–2026 | keskitaso | Koko kaupan keskiarvo kilogrammoina. Ei suoraan sovellettavissa yksittäiseen tuoteryhmään. |
| Hävikki, tuore leipä | 3,6 % myyntimäärästä (2024) | Luke via Verkkouutiset 22.9.2025 | keskitaso | Ainoa löytynyt tuoteryhmäkohtainen prosentti |
| Hävikki, maito ja liha | **ei löytynyt** | — | — | — |
| Myyntiaika hyllyssä, maitotuotteet | **ei löytynyt** | — | — | Käytä vaihtelua herkkyysanalyysinä ja kerro, että arvo on oletus |
| Tuoreimman ottavien asiakkaiden osuus | 29 % kaikista otoista, maito 45 %, vaihteluväli 5–45 % tuoteryhmittäin | Hübner 11/2022 | keskitaso–matala | Tarkista dioista. Vogt ym. 2026 suosittaa yliarvioimaan vanhimman ottavien osuutta, jos osuutta ei tunneta. |
| Kustannusero: kaikki ottavat vanhimman vs. kaikki ottavat tuoreimman | enintään 30,25 % pienemmät kustannukset, kun asiakkaat ottavat vanhimman | Vogt ym., EJOR 2026 | korkea | Mallin tulos, ei kenttädataa |
| Päiväysalennuksen vaikutus hävikkiin | −9,6…−10 %, kalliissa ryhmissä −15 % | Saarinen (Aalto) 2024–2025 | keskitaso | Verkkokauppa, ei kivijalkakaupan hylly |
| Päiväysdatan vaikutus tuoretuotteiden hävikkiin | −18 % (14 tuotetta / tuoretuotteet) | NorgesGruppen 2019→, Matvett ja GS1 Finland 2026 | keskitaso | Kaupan oma ilmoitus |
| Päiväysdatan vaikutus hävikkiin, yläraja | "jopa −40 %" | Woolworths / GS1 2022 | matala–keskitaso | "Jopa"-luku, ei keskiarvo |
| Tyypillinen alennus | −60 % (S-ryhmän ilta-ale), 35 % kiinteä (Hollanti) | SOK 2022; Haijema ym. 2025 | keskitaso | S-ryhmän tieto vuodelta 2022 |
| Dynaamisen alennuksen lisämyynti | noin +2 % useimmissa kokeissa | Haijema ym. 2025 | keskitaso | Simulaatio, ei kenttädataa |
| Vaihtaminen tuoreimmasta vanhempaan 30 % alennuksella | 15 / 30 / 45 % | IJPR 2025 | **matala** | Mallin oletus, ei mittaus. Käytä korkeintaan skenaarioina. |
| Päiväystarkistuksen työaika | **ei löytynyt** | — | — | Toimittajien "−70 %" ja "+21 % tuottavuus" eivät ole lähtöarvoja |
| Huomaamatta jäävät tuotteet manuaalisessa tarkistuksessa | **ei löytynyt** | — | — | — |

---

## 4. Avoimet kysymykset ja ristiriidat

1. **Kaupan osuus ketjun hävikistä:** Luken indikaattorin mukaan 7 % (2023), mutta Verkkouutisten Luke-viittausten mukaan noin 13 % (2024) ja 15 %. Ero johtuu todennäköisesti rajauksista (hävikki vs. hävikki ja jäte, kauppa vs. kauppa ja tukku). Kysy Lukelta tai tarkista alkuperäinen raportti.
2. **Hävikin mittaustapa:** S-ryhmä ilmoittaa 1,2 % myynnistä (todennäköisesti euroina), Luke 0,92 % läpivirtauksesta (kilogrammoina). Lukuja ei voi verrata suoraan.
3. **Saarisen tulos:** 9,6 % (CBS 2024) vs. 10 % (GS1 Finland 2025). Todennäköisesti pyöristys. Alkuperäistä SSRN-paperia ("Reaping the Benefits of Expiration Tracking") en löytänyt.
4. **NorgesGruppenin 18 %:** Matvettin mukaan luku koskee 14 valittua lihatuotetta ja rahallista arvoa, GS1 Finlandin mukaan "tuoretuotteita keskimäärin per tuote". Laajuus on tarkistettava.
5. **Sunrise 2027:** "pakko" vs. "vapaaehtoinen". GS1:n omat tekstit tukevat vapaaehtoisuutta.
6. **EU-direktiivin raportointi:** kaupan yrityskohtaisia velvoitteita ei löytynyt. Kansallinen toimeenpano on kesken (määräaika 17.6.2027). Selvitä ympäristöministeriön valmistelu ja EU:n mittausmenetelmä (komission delegoitu päätös), joita en tarkistanut.
7. **Hübnerin 29 % / 45 %:** luvut tulevat hakukoneen tiivistelmästä, koska dioja ei voinut lukea. Avaa PDF itse.
8. **Suomen aikataulu:** onko S-ryhmällä, Keskolla tai Lidlillä julkista suunnitelmaa päiväyksen lukemisesta kassalla? Ei löytynyt. GS1 Finlandin hankesivun mainintaa "vaiheittainen käyttöönotto keväällä 2026" en pystynyt vahvistamaan avatuista lähteistä.
9. **Avaamatta jääneet ensisijaiset lähteet** (403-esto): SSRN-paperit, ScienceDirect, Taylor & Francis, INFORMS, EUR-Lex, gs1.org ja ECR:n raportti päiväyskoodeista (GS1 UK). Avaa nämä selaimella.

---

## 5. Mitä tämä tarkoittaa projektille

> **Oma tulkintani, ei lähteistä suoraan johdettu.**

1. **Aukko on todellinen ja ajankohtainen.** GS1 Finland itse sanoo, ettei EAN-koodi kerro päiväystä, ja Suomessa ollaan vasta pilottivaiheessa. S-hävikki 2 sijoittuu siis väliin, jossa standardi on valmis mutta kaupan prosessit eivät.
2. **Kehystä simulaatio skenaarioina, älä ennusteena.** Kahdesta tärkeimmästä parametrista (myyntiaika hyllyssä ja tarkistuksen työaika) ei ole julkaistua dataa. Näytä vaihteluvälit ja herkkyysanalyysi, ja kerro case-tekstissä, mitkä arvot ovat oletuksia.
3. **Asiakkaiden poimintakäyttäytyminen kannattaa ottaa simulaatioon omaksi muuttujakseen.** Maidossa tuoreimman ottavien osuus on löydetyn datan mukaan suurin (45 %), joten järjestyksen merkitys on maitohyllyssä luultavasti suurin.
4. **Rakenna prototyyppi WebAssembly-lukijan varaan** (esim. ZXing-pohjainen polyfill), koska iOS:llä ei ole BarcodeDetectoria. Käytä etuliitettä 952 ja omaa domainia, ja lue päiväys parametrista `?17=`.
5. **Norjan 18 % ja Aallon noin 10 % ovat uskottavimmat vertailuluvut case-tekstiin.** Woolworthsin "jopa 40 %" kannattaa mainita vain ylärajana ja lähteen luonne kertoen.

---

## 6. Lähdeluettelo

**GS1 (ensisijaiset)**
- GS1. *2D Barcodes at Retail Point-of-Sale Implementation Guideline*, Release 1.1.0, 12/2025. https://ref.gs1.org/guidelines/2d-in-retail/
- GS1. *GS1 Digital Link Standard: URI Syntax*, Release 1.7.0, 8/2026. https://ref.gs1.org/standards/digital-link/uri-syntax/
- GS1. *GS1 Style Guide*, Release 5.5, 11/2024. https://gs1.org/standards/gs1-style-guide/current-standard
- GS1. GSCN 23-006 RCN. https://www.gs1.org/docs/barcodes/GSCN-23-006-RCN.pdf
- GS1. Woolworths Australia case study (PDF, 2022). https://www.gs1.org/system/files/case-study-woolworths-gs1australia.pdf
- GS1 US. *Sunrise 2027* (ei päiväystä). https://www.gs1us.org/industries-and-insights/by-topic/sunrise-2027
- GS1 Finland. Uutis- ja blogilistaus. https://gs1.fi/fi/uutisia-ja-blogikirjoituksia-gs1-2d-koodista
- GS1 Finland. Kesko tähtää GS1 2D-koodeilla kattavampaan asiakasviestintään, 5.8.2024.
- GS1 Finland. Mitä GS1 2D-koodin käyttöönotto maksaa?, 25.4.2024.
- GS1 Finland. 2D-viivakoodit mahdollistavat ruokakauppojen hävikkiin muutoksen…, 8.9.2025.
- GS1 Finland. GS1 2D-koodi tuo kassalle uuden aikakauden, 26.1.2026.
- GS1 Finland. Norjalaiskauppa vähensi ruokahävikkiä 18 prosenttia…, 23.6.2026.
- GS1 Finland. Päiväystieto viivakoodissa auttaa vähentämään ruokahävikkiä, 22.9.2026.

**Kaupat (ensisijaiset)**
- S-ryhmä. Fazer, S-ryhmä, KLINGER Finland ja GS1 testaavat yhdessä 2D-koodia…, 4.12.2025. https://s-ryhma.fi/uutinen/fazer-s-ryhma-klinger-finland-ja-gs-1-testaavat-yh/6oHeLx0C0ioksgqC7XfUxG
- SOK. Hitiksi muodostunut punalapputuotteiden ilta-ale jo viisi vuotta…, 12.9.2022. https://www.sttinfo.fi/tiedote/69950337/
- SOK. Kauppojen hävikki kutistuu, ruoka-apu kärsii…, 21.9.2026. https://www.sttinfo.fi/tiedote/72340223/
- Kesko. Five methods that grocery stores use to prevent food waste, 8.9.2023.
- Kesko. Food waste reduced by one million kilograms…, 23.4.2026.
- Matvett (Norja). Expiry date included in barcode reduces food waste (ei päiväystä).

**Viranomaiset ja tutkimuslaitokset (ensisijaiset)**
- Luke. Volume of food loss and waste (CAP-indikaattori), päivitetty 7.1.2026.
- Euroopan parlamentti. Legislative Train: Revision of the EU Waste Framework Directive, päivitetty 25.10.2026.
- EUR-Lex. Directive (EU) 2025/1892. https://eur-lex.europa.eu/eli/dir/2025/1892/oj/eng (ei latautunut)

**Tutkimus (ensisijaiset)**
- Vogt, T., Lowery, B., Sachs, A.-L., Thonemann, U. W. Inventory control and picking behavior: The roles of sustainability messages and price discounts. *EJOR* 331(1), 2026. https://eprints.lancs.ac.uk/id/eprint/232843
- Haijema, R., Duijvestijn, L., Akkerman, R., Cruijssen, F. Dynamic expiration date-based discounting of fresh food products. *IJPE* 2025. https://www.sciencedirect.com/science/article/pii/S0925527325003093
- Hübner, A., Ostermeier, M., Schäfer, F., Winkler, T. Seeking the Freshest? SSRN 4731442, 2024. https://dx.doi.org/10.2139/ssrn.4731442
- Hübner, A. Keynote, Smart Retail Summit, Göttingen, 11/2022 (PDF).
- Knox, G., Cruijssen, F., van Lin, A., Wagenaar, J. Navigating the Waste-Markdown Tradeoff. SSRN 7048139.
- Chehrazi, N., Sanders, R. E., Stamatopoulos, I. Inventory Information Frictions Explain Price Rigidity in Perishable Groceries. *Marketing Science* (WashU-tiedote 24.7.2024).
- Uninformed Choices in Perishables. *Marketing Science*. https://pubsonline.informs.org/doi/10.1287/mksc.2021.0264
- Tsiros, M., Heilman, C. M. *Journal of Marketing* 69(2), 2005.
- *Int. J. Production Research* 2025, https://www.tandfonline.com/doi/full/10.1080/00207543.2025.2603570

**Toissijaiset**
- Verkkouutiset 23.9.2024, 22.9.2025 ja 23.9.2026 (Luken laskelmat kaupan hävikistä).
- IT Brief UK, 9.12.2025 (Tesco).
- CBS (Copenhagen Business School), seminaarikuvaus, 11/2024. https://cbs.dk/en/node/550178
- Can I Use: BarcodeDetector. https://caniuse.com/mdn-api_barcodedetector
- piunikaweb 29.10.2026; AppleInsider 17.6.2026 (Blink iOS:llä).
- Wasteless, Upshop (toimittajien omat väitteet).
- ResQ Club, tiedote 9/2025.
