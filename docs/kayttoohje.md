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
