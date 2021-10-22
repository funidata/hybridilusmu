# Botin käyttöönotto

Botti ei ole saatavilla slackin lisäosavalikoimasta, vaan se tulee ottaa käyttöön manuaalisesti.

## Slack app -konfigurointi

- [Luo uusi Slack app](https://api.slack.com/apps?new_app=1&ref=bolt_start_hub)
- Valitse "From an app manifest"
- Valitse workspace johon haluat botin lisätä
- Kopioi ja liitä [manifestin sisältö](https://github.com/hytuslain/hytuslain/blob/master/manifest.yml) sitä kysyttäessä. Formaatti on YAML.
- Klikkaa lopuksi Create

Siirryt Botin hallintapaneelin etusivulle:

- Klikkaa "Install to workspace" -> "Allow"

## Ohjelman konfigurointi

Ohjelma yhdistyy Slackin rajapintaan kolmella salausavaimella ympäristömuuttujien kautta. Avaimet löytää Slack apin [hallintapaneelista](https://api.slack.com/apps/):

`SLACK_SIGNING_SECRET`: Avain löytyy suoraan oikean botin etusivulta laatikosta "App credentials" nimellä "Signing Secret"

`SLACK_APP_TOKEN`: Klikkaa "Generate Token and Scopes" etusivun "App-Level Tokens" -laatikosta. Anna avaimelle nimi ja klikkaa "Add Scope". Valitse "connections:write" ja klikkaa "Generate". Avain tulee näkyviin seuraavaan laatikkoon.

`SLACK_BOT_TOKEN`: Valitse vasemmasta sivupalkista "OAuth & Permissions". Avain löytyy ensimmäisestä laatikosta nimellä "Bot User OAuth Token".


Ohjelma yhdistää postgreSQL-tietokantaan ympäristömuuttujilla `DB_HOST`, `DB_PORT`, `DB_USER` ja `DB_PASSWORD`.


Repositoriossa on [docker-compose](https://github.com/hytuslain/hytuslain/blob/master/docker-compose.yml) -tiedosto jonka avulla saa käynnistettyä botin yhdessä valmiin postgreSQL Docker-kontin kanssa.
