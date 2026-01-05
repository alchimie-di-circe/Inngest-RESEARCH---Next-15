FROM mcr.microsoft.com/devcontainers/typescript-node:20-bullseye

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    git-lfs \
    gnupg \
    jq \
    postgresql-client \
    python3-minimal \
    docker.io \
  && git lfs install \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g \
    concurrently \
    inngest-cli \
    tsx \
    typescript \
    turbo

USER node
WORKDIR /workspace
