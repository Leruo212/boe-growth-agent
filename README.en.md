<h1 align="center">BOE Growth Agent</h1>

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/%E4%B8%AD%E6%96%87-SWITCH-4E9A06?style=flat-square" alt="Switch to Chinese"></a>
  &nbsp;
  <img src="https://img.shields.io/badge/English-CURRENT-1F4E79?style=flat-square" alt="English">
</p>

<p align="center">
  Say what you did today. It becomes a structured report at the interval you actually need to hand in.
</p>

## What it does

Weekly reporting fails for a boring reason: by Friday nobody remembers what happened on Tuesday. This application takes the opposite approach. You talk to it as things happen, in whatever language you would use with a colleague, and it accumulates those fragments into structured summaries at five granularities:

- daily
- weekly
- monthly
- quarterly
- yearly

Each level is generated from the same underlying record, so the weekly report and the quarterly report cannot contradict each other.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS 4 |
| Backend | Express 5 (Node.js) |
| AI | Coze Open API v3 |
| Icons | Lucide React |

Front end and back end are separate processes in development and can be deployed independently.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start both front and back end
npm run dev
```

### Configuring the Coze API

The application reads its credentials from environment variables. Without them it still runs: the summarisation falls back to a local template path, so the interface and the record-keeping work, and only the language generation is degraded.

To connect the real model, create a Coze bot, obtain the bot ID and an access token, and place them in the environment file. The repository's configuration section documents the exact variable names.

## When no API is configured

The local fallback groups entries by date and emits a fixed template. This is intentional: a reporting tool that refuses to start because a key is missing is worse than one that produces plain output.

## Project structure

```
client/          React 19 front end
server/          Express 5 API, Coze client, prompt assembly
shared/          types shared across the two sides
```

## Design notes

**Why five granularities instead of one.** A weekly summary and a quarterly summary answer different questions. Generating them from a shared store, rather than asking the model five times, keeps them consistent and makes each one cheaper to produce.

**Why a fallback path.** The tool's core value is the record, not the prose. Separating the two means the record survives an API outage.

## Licence

MIT. See [LICENSE](LICENSE).
