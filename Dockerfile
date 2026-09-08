FROM node:24-bookworm

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV CARGO_HOME=/usr/local/cargo
ENV RUSTUP_HOME=/usr/local/rustup

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       bash curl git build-essential pkg-config binaryen ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && corepack prepare pnpm@10.12.1 --activate \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal \
    && rustup toolchain install nightly --component rust-src --target wasm32-unknown-unknown \
    && cargo install wasm-bindgen-cli --version 0.2.105 \
    && cargo install --git https://github.com/r58playz/wasm-snip \
    && git config --global --add safe.directory /app

WORKDIR /app
COPY . .

RUN chmod +x scripts/build-render.sh \
    && RELEASE=1 ./scripts/build-render.sh

ENV NODE_ENV=production
CMD ["node", "render-server.mjs"]
