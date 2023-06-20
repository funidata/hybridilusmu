# Building from custom Dockerfile is required in order to use TS.
FROM cypress/included:12.14.0

WORKDIR /e2e
COPY . .
RUN npm ci

# Unset entrypoint to require explicit command for better readability.
ENTRYPOINT [ "" ]
