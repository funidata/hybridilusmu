# Hosting

## Services

Hybridilusmu uses PostgreSQL database for persistence. Currently we are developing on version 14.7 but any fairly recent version should work.

## Server Configuration

The environment variables below are required

| Name | Description |
| --- | --- |
| `SLACK_APP_TOKEN` | App-Level Token with the `connections:write` scope. Used to authenticate the WebSocket connection (found under _Basic Information > App-Level Tokens_). |
| `SLACK_BOT_TOKEN` | Bot User OAuth Token (found under _OAuth & Permissions_). |
| `SLACK_SIGNING_SECRET` | Signing Secret (found under _Basic Information > App Credentials_). |
| `DATABASE_USERNAME` | PostgreSQL username. |
| `DATABASE_PASSWORD` | PostgreSQL password. |
| `DATABASE_NAME` | PostgreSQL database name. |
| `DATABASE_HOST` | PostgreSQL hostname. |
