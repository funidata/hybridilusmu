FROM python:3.11.2-bullseye

# Install poetry.
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="$PATH:/root/.local/bin"

# Install dependencies.
WORKDIR /usr/src/app
COPY pyproject.toml poetry.lock ./
RUN poetry install

CMD poetry run robot -d results -v BROWSER=headlesschrome testcases
