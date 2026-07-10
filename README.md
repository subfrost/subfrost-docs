# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

# SUBFROST Documentation

This repository contains the source code for the SUBFROST documentation website.

SUBFROST is the issuer of frBTC & dxBTC. The SUBFROST protocol operates as a decentralized custodian that enables a trustless DeFi ecosystem on Bitcoin L1. SUBFROST is a Layer 0 system, building fraud proofs as ZK circuits to ensure the integrity of its operations.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Adding a page to the navigation

The sidebar is defined manually in [`sidebars.ts`](./sidebars.ts) (autogeneration is
disabled). Creating a new `.mdx` file under `docs/` is **not** enough — it will be
reachable by direct URL but won't appear in the sidebar until you add its doc ID
(the path under `docs/` without the `.mdx` extension, e.g. `subfrost-app/lending`)
to the appropriate category in `sidebars.ts`.

## Deployment

Deployment is **automatic**. Do **not** run `yarn deploy` — that command targets a
`gh-pages` branch this project doesn't use, and will fail.

Pushing to `master` (for changes under `docs/`, `src/`, `static/`, `sidebars.ts`,
`docusaurus.config.ts`, and related paths) triggers the `deploy` GitHub Actions
workflow, which submits a Cloud Build that builds the Docker image and pushes it to
Google Artifact Registry. Flux's ImagePolicy in the `subfrost-admin` repo then picks
up the new image on its next scan (~5 min) and rolls it out to Cloud Run.

- Pipeline config: [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) and [`cloudbuild.yaml`](./cloudbuild.yaml)
- Expect up to ~5 minutes of lag after the build succeeds before the live site updates.
