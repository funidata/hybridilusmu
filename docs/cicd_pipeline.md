# Jatkuva integrointi ja käyttöönotto

## Continuous Integration - Jatkuva integrointi

Pull requesting tekeminen master-haaraan käynnistää node.js.yml workflow:n suorituksen Github Actionssissa. Mocha-yksikkötestit ajetaan PostgreSQL-testitietokannan kanssa ja uusi testikattavuus päivitetään CodeCoviin. Koodin syntaksi tarkastetaan ESlintillä .eslintrc.js-tiedostossa määriteltyjen sääntöjen mukaan. Lopuksi ajetaan Robot Framework end-to-end-testit, joista generoituu raportti workflown alle sekä kommentti testauksen tuloksista committiin. Node.js.yml workflowssa tarvittavat muuttujat on määritelty github salaisuuksina E2E Testing ympäristössä. 

## Continuous Development - Jatkuva käyttöönotto

Käyttöönotto vaatii pull requestin kehityshaarasta master-haaraan, node.js.yml workflown läpimenon sekä hyväksynnän kahdelta katselmoijalta. Kun pull request on hyväksytty mergettäväksi master-haaraan, node.js.yml workflow ajetaan uudelleen ja hyväksytyn ajon jälkeen ajetaan docker-image.yml workflow. Docker-image.yml workflowssa tarvittavat muuttujat on määritelty Docker deployment ympäristössä. Docker-image.yml workflowssa luodaan uusi versio docker imagessa, joka viedään DockerHubiin. Staging-palvelimella haetaan DockerHubista sovelluksen uusin versio. 