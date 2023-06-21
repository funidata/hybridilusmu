# Tests

## Unit Tests

...

## Integration Tests

...

## End-to-End Tests

E2E tests are implemented with Cypress. (Originally, Robot Framework was used but running the tests in CI was a hassle with no apparent advantage over Cypress.)

### Setup

E2E tests use Slack's web application to run tests in a real Slack workspace.

...

1. **Install local dependencies by running `npm ci` in the `e2e/` directory.** Cypress is used locally to avoid the X server configuration hassle to pipe Cypress' GUI from container to host.

### Environment Variables

Cypress needs secrets as environment variables to authenticate with Slack. There are many ways to pass env vars to Cypress but due to [this bug](https://github.com/cypress-io/cypress/issues/22181) being open at the time of writing, we chose to use only `CYPRESS_`-prefixed bash env vars both locally and in CI. This requires an unpleasant command chain to export the vars from `.env.development` file in some NPM scripts but circumvents the need for custom logic to make `baseUrl` work with `cy.visit()` and `cy.request()`.

#### Local Configuration

In repo root, create a file called `.env.development` and populate it with the variables below.

| Name               | Description          |
| ------------------ | -------------------- |
| `CYPRESS_BASE_URL` | Slack workspace URL. |

#### CI Configuration

Use the variable names from the table in previous section. Configure the CI so that the variables are exported when running the `e2e` service included in the Docker Compose configuration. `compose-ci.yaml` extends the base configuration by mapping the shell environment variables into the test container.

### Commands

Run the commands in repository root unless otherwise noted.

#### Open Cypress

```bash
npm run e2e:open
```

#### Run Cypress Tests (Local)

```bash
npm run e2e:run
```

#### Run Cypress Tests (Container)

```bash
npm run e2e:docker
```
