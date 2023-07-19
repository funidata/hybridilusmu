# Loppukäyttäjän käyttöohje

Hybridilusmun käyttäminen on suoraviivaista ja helppoa. Tässä asiakirjassa
kerrotaan hieman ohjelman perusperiaatteista. Ohjeessa oletetaan, että sovellus
on jo [asennettu onnistuneesti](kayttoonottoohjeet.md) käytettävään
Slack-työtilaan.

## Vieraskäyttäjistä

Vieraskäyttäjät eivät voi käyttää sovellusta.

## Ilmoittautumistyypit

Ohjelmassa voi ilmoittautua joko toimistolla läsnäolevaksi tai toimistolta
poissaolevaksi. Näistä jälkimmäinen on merkitty termillä "etänä".

Käyttäjä voi asettaa myös viikonpäiväkohtaiset oletukset ilmoittautumisilleen.
Käsin asetetuilla ilmoittautumisilla voi kuitenkin yliajaa nämä oletukset,
sillä manuaaliset ilmoittautumiset ovat tärkeysjärjestyksessä niitä
korkeammalla.

## Automaattiviestit

Ohjelma lähettää joka arkipäivä viestin kaikille niille kanaville, joille se
on lisätty.

Mikäli kanava on listattu jonkin Slack-työtilan user groupin oletuskanavissa,
tehdään automaattiviestille tiimirajaus kyseisen user groupin perusteella.
Mikäli kanava on listattu useamman user groupin kohdalla, lähetetään jokaista
täsmäävää user groupia vastaava tiimirajattu listaus.

Kuka tahansa kanavan käyttäjä voi vaihtaa automaattiviestin toimitusaikaa:
tällöin ohjelma lähettää kanavalle kaikille kanavan käyttäjille näkyvän
ilmoituksen toimitusajankohdan muuttamisesta.

_Tällä hetkellä automaattiviestien toimitusajan kanavakohtainen konfigurointi
toimii vain slash-komennolla `/tilaa`._

## Graafinen käyttöliittymä

Graafinen käyttöliittymä on esillä Slack-työtilan sivupalkin "Apps" -kohdasta
löytyvän Hybridilusmu-sovelluksen "Home" -välilehdellä.

_Mikäli et näe Hybridilusmua sovelluslistauksessa, voit napsauttaa listauksen
kohtaa "[+] Add apps". Hybridilusmun pitäisi löytyä avautuvasta listauksesta ja
sen napsauttaminen lisää sen sivupalkkiisi äppylöiden alle._

Graafisen käyttöliittymän päänäkymä päivittyy aina silloin, kun sen kohdalle
navigoidaan. Tämän lisäksi se päivittyy aina, kun muutat ilmoittautumisiasi tai
oletusilmoittautumisasetuksiasi. Koska päänäkymä ei päivity sinun kohdallasi,
kun joku muu säätää omia ilmoittautumisiaan, löytyy päänäkymästä myös
manuaalinen päivitysnappi.

### Ilmoittautuminen

Päänäkymä näyttää parin viikon verran arkipäiviä nykyhetkestä eteenpäin.
Jokaiselle päivälle on omat nappinsa, joilla voi ilmoittautua joko toimistolle
tai etäilijäksi. Nappien yläpuolella päivän alla komeilee lista kyseisen päivän
läsnäolijoista.

Jos päivälle ei ole määritelty oletusasetuksia tai tehty manuaalista
ilmoittautumista, niin napit ovat tylsän koruttomia.

Jos päivälle löytyy vain oletusasetus, niin asetusta vastaava nappi on
koristeltu robottiemojilla.

Jos päivälle löytyy käsin tehty ilmoittautuminen, niin sitä vastaava nappi on
koristeltu kirjoitusemojilla. Tuolloin käsin tehdyn ilmoittautumisen voi
poistaa koristeltua nappia painamalla, jolloin koristelu vaihtuu joko
oletusasetusta ilmaisevaksi robottiemojiksi tai vaihtoehtoisesti katoaa
kokonaan. Tämä riippuu siitä, onko vastaavaa viikonpäivää varten asetettu
oletusasetus vai ei.

### Oletusilmoittautumisten asettaminen

Oletusilmoittautumisia pääsee säätämään napin "Oletusasetukset" kautta. Sen
painaminen avaa Slack-sovelluksen sisäisen dialogin, joka muistuttaa ylempänä
käsiteltyä ilmoittautumiskäyttöliittymää. Tyhjän napin painaminen asettaa sen
napin arvon oletusasetukseksi asianmukaiselle viikonpäivälle. Korostettu nappi
merkkaa valittua asetusta. Jos korostettua nappia painaa, niin päivän
oletusasetus poistetaan.

## Tekstikäyttöliittymä (ns. slash-komennot)

Ohjelmaa voi käyttää myös slash-komennoin. Vastaukset slash-komentoihin tulevat
pääasiassa vain käyttäjälle itselleen näkyvinä viesteinä, sille kanavalle jolla
komentoa on käyttänyt. Mikäli ohjelmalla ei ole pääsyä kanavalle, jolta
komentoa on kutsuttu, niin ohjelma vastaa yksityisviestillä.

Jokaiselle komennolle on mahdollista antaa "help" -parametri, mikä laittaa
ohjelman vastaamaan käyttäjälle kyseisen komennon käyttöohjeella.

Alla on lyhyt kuvaus kunkin komennon käytöstä. Tarkempaa tietoa komennoista
kannattaa kysellä itse ohjelmalta edellämainitun "help" -parametrin avulla.

### `/listaa [<päivä>] [<tiimi>]`

Listaa toimiston läsnäolijat annetulle päivälle. Mikäli päivää ei ole annettu,
listaa tämän päivän läsnäolijat.

Mikäli komennolle antaa myös tiimin @-maininnan, listaus rajoitetaan kyseisen
tiimin jäseniin.

Parametrien järjestyksellä ei ole väliä.

Esimerkkejä:
- `/listaa`
- `/listaa huomenna`
- `/listaa @kahvi perjantai`
- `/listaa 11.11. @pannu`

### `/ilmoita [def] <päivä> <status>`

Lisää ilmoittautumisen (tai oletusilmoittautumisen) määritellylle päivälle.

Jos parametri `def` on annettu komennon ensimmäisenä parametrina, tehdään
oletusilmoittautuminen.

Esimerkkejä:
- `/ilmoita maanantai toimisto`
- `/ilmoita def perjantai etä`
- `/ilmoita 1.5. etä`

### `/poista [def] <päivä>`

Poistaa ilmoittautumisen (tai oletusilmoittautumisen) määritellyltä päivältä.

Jos parametri `def` on annettu komennon ensimmäisenä parametrina, poistetaan
oletusilmoittautuminen.

Esimerkkejä:
- `/poista maanantai`
- `/poista def tänään`

### `/tilaa <kellonaika>`

Tilaa automaattiviestin toimitettavaksi tälle kanavalle tiettyyn kellonaikaan
joka arkipäivä.

_Ohjelman tulee olla jo lisätty kanavalle, jolta tätä komentoa kutsutaan._

Poikkeuksena valtaosaan muista komennoista, onnistuneeseen tilaukseen vastaus
tulee kaikille näkyvänä viestinä. Tämä käytäntö on tehty läpinäkyvyyden ja
käyttäjäystävällisyyden vuoksi.

Esimerkkejä:
- `/tilaa 7.15`
- `/tilaa 06:45`
- `/tilaa 11`
