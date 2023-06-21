# Developing Hybridilusmu

This document guides you through the development process of Hybridilusmu.

## Development Environment

The development environment is arranged with Docker containers. However, developing Slack apps also requires proper access to a Slack workspace. You will not be able to run this program purely locally.

### Requirements

These are required to be installed on the development machine:

- Docker
- Node.js

Fairly recent versions will do.

### Configuration

Create `.env.development` file at project root and populate it with the variables below.

| Name                 | Description                                                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SLACK_APP_TOKEN      | _App-Level Token_ with the `connections:write` scope. Used to authenticate the WebSocket connection (found under _Basic Information_ > _App-Level Tokens_). |
| SLACK_BOT_TOKEN      | _Bot User OAuth Token_ (found under _OAuth & Permissions_).                                                                                                 |
| SLACK_SIGNING_SECRET | _Signing Secret_ (found under _Basic Information_ > _App Credentials_).                                                                                     |

### Installation (optional)

#### Install dependencies locally

```bash
npm run init
```

Used to enable intellisense for local tools such as VS Code extensions. The containerized development environment does not require this to function.

### Usage

#### Start Development Environment

```bash
npm start
```

#### Stop Development Environment

```bash
npm stop
```

#### View Logs

```bash
npm run logs
```

(Using `npm start`, the containers start detached.)

#### Run Linter

```bash
npm run lint
```

### Environment Maintenance

#### Reset Database

Postgres data is persisted in a Docker volume. Removing the volume will cause a new database to be created on next run.

```bash
docker compose down
docker container rm lusmu-db
docker volume rm hybridilusmu_lusmu-db
```

Note that your volume may be named differently depending on where you cloned the repository to.
