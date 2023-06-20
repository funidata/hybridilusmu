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