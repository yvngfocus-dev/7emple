<wizard-report>
# PostHog post-wizard report

The wizard has completed a PostHog integration for the 7EMPLE website. The `posthog-node` SDK (v5.28.2) was installed and initialised in `serve.mjs`, the project's static file server. PostHog credentials are stored in `.env` (covered by `.gitignore`) and referenced via `process.env`. Two events are now captured on every request, and a graceful shutdown hook ensures queued events are flushed when the server exits.

| Event | Description | File |
|---|---|---|
| `page_viewed` | Fired when a visitor successfully loads an HTML page (`.html` extension) | `serve.mjs` |
| `file_not_found` | Fired when the server returns a 404 for a requested path | `serve.mjs` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behaviour, based on the events we just instrumented:

- **Dashboard — Analytics basics:** https://eu.posthog.com/project/141308/dashboard/569322
- **Page views over time:** https://eu.posthog.com/project/141308/insights/Ce7bSsLH
- **Unique visitors per day:** https://eu.posthog.com/project/141308/insights/lV4DHh2M
- **404 errors over time:** https://eu.posthog.com/project/141308/insights/iBUo5ZOq
- **Page views vs 404 errors (weekly bar):** https://eu.posthog.com/project/141308/insights/OV5U7bTb

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-javascript_node/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
