FROM mcr.microsoft.com/devcontainers/typescript-node:20-bookworm

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
  && git lfs install \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g \
    concurrently@8.2.2 \
    inngest-cli@0.32.2 \
    tsx@4.20.6 \
    typescript@5.7.2

USER node
WORKDIR /workspace
