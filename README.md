# Angjs-test

Demo AngularJS component that listens to a UNILY news repository, summarizes new posts, and ships the digest to a Slack channel through an incoming webhook.

## Getting started

1. Serve the `app` directory with any static file server. For example:

   ```bash
   npx http-server app -p 8080
   ```

2. Open `http://localhost:8080` in your browser.

3. Update the `site-url`, `repository-id`, and `webhook-url` attributes on the `<unily-news-summary>` component inside `app/index.html` to match your UNILY tenant and Slack workspace settings.

## How it works

- `NewsRepositoryService` polls the UNILY news API for new posts at the cadence defined by `poll-interval` (default 60 seconds).
- `SummarizerService` distills the article body into a concise headline and up to three bullet points.
- `SlackWebhookService` formats the summary and forwards it to the configured Slack channel using a webhook.
- The `unilyNewsSummary` component wires everything together and presents a UI for monitoring recent posts and manually triggering Slack notifications.

Adjust the services or component bindings to integrate the workflow into your production portal.
