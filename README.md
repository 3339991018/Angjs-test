# Angjs-test

This AngularJS sample hosts a single-page component for summarizing Unily content and preparing Slack announcements.

## Getting started
1. Open `index.html` in a browser (no build step required).
2. Fill in your Unily content details, choose a target Slack channel, and paste a Slack bot token if you want to post directly.
3. Leave **Dry run** enabled to preview the Slack payload without posting, or disable it to send via the Slack Web API.

## Notes
- The Slack call uses `chat.postMessage` with the token and channel you provide at runtime. Nothing is stored in the repository.
- Summaries are generated in the browser by trimming the supplied title and body to the requested word count.
