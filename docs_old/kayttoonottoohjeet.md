# Botin käyttöönotto

Botti ei ole saatavilla slackin lisäosavalikoimasta, vaan se tulee ottaa käyttöön manuaalisesti.

## Slack app -konfigurointi

- [Luo uusi Slack app](https://api.slack.com/apps?new_app=1&ref=bolt_start_hub)
- Valitse "From an app manifest"
- Valitse workspace johon haluat botin lisätä
- Kopioi ja liitä [manifestin sisältö](manifest.yml) sitä kysyttäessä. Formaatti on YAML.
- Klikkaa lopuksi Create

Siirryt Botin hallintapaneelin sivulle "Basic Information":

- Klikkaa "Install to workspace" -> "Allow"

## Ohjelman konfigurointi

Ohjelma yhdistyy Slackin rajapintaan kolmella salausavaimella ympäristömuuttujien kautta. Ympäristömuuttujat voi lisätä halutessaa projektin juureen .env-tiedostoon. Avaimet löytää Slack apin [hallintapaneelista](https://api.slack.com/apps/). Avataksesi hallintapaneelin, valitse linkatulta sivulta sovellus, jota haluat tarkastella. Alla listattu ohjelman konfigurointimuuttujat:

`SLACK_SIGNING_SECRET`: Avain löytyy sivulta "Basic Information", laatikosta "App Credentials" nimellä "Signing Secret".

`SLACK_APP_TOKEN`: "App Credentials" -laatikon alapuolelta löytyy "App-Level Tokens" -laatikko. Paina "Generate Token and Scopes", anna avaimelle nimi ja klikkaa "Add Scope". Valitse "connections:write" ja klikkaa "Generate". Avain näkyy nyt listattuna "App-Level Tokens" -laatikossa. Klikkaamalla avaimen nimeä, pääsee näkemään ja kopioimaan avaimen arvon.

`SLACK_BOT_TOKEN`: Valitse vasemmasta sivupalkista "OAuth & Permissions". Avain löytyy ensimmäisestä laatikosta nimellä "Bot User OAuth Token".

`COMMAND_PREFIX`: Vapaaehtoinen etuliite ohjelman kauttaviivakomennoille. Jos tälle asettaa vaikkapa arvon `h`, niin esimerkiksi komento `/listaa` muuttuu muotoon `/hlistaa`. Tämä vaatii myös etuliitteen lisäämisen manuaalisesti botin komentoihin, eli manifestiin ja [hallintapaneelin](https://api.slack.com/apps/) sivulta "Slash Commands" löytyviin komentoihin. Kauttaviivakomentojen etuliitettä tarvitaan erityisesti kehitysvaiheessa, koska samassa workspacessa olevien bottien kauttaviivakomentojen tulee olla uniikkeja. 

`.env` tiedoston tynkä:

```
COMMAND_PREFIX=
SLACK_SIGNING_SECRET=
SLACK_APP_TOKEN=
SLACK_BOT_TOKEN=
```

PostgreSQL-tietokantayhteys ja konfiguraatio on määritelty tiedostossa `src/config/config.json`, josta löytyy valmiit konfiguraatiot paikallista kehitysympäristöä varten. Konfiguraatio-objekti valitaa `NODE_ENV`-muuttujan perusteella, joka on vakiona `development`.

## Docker-compose

Repositoriossa on [docker-compose](https://github.com/funidata/hybridilusmu/blob/master/docker-compose.yml) -tiedosto jonka avulla saa käynnistettyä botin yhdessä valmiin postgreSQL Docker-kontin kanssa komennolla `docker-compose up --build`.

## Kehitys

Käytetty node versio: 16.13

Kehitystä varten tarvitsee paikallisen postgres instanssin tietokannaksi. Helpoin tapa on käyttää `docker-compose`ssa olevaa postgres palvelua. Tämän saa käyttöön ajamalla `docker-compose up -d postgres` projektin juuressa. Asenna tämän jälkeen node moduulit: `npm install` ja initialisoi tietokanta: `npm run init`. Tietokannan luomisen lisäksi initialisointi-skripti ajaa migraatiot, jotka ajetaan myös aina sovelluksen käynnistymisen yhteydessä. Sovellus on valmis käynnistettäväksi `npm start` komennolla.
