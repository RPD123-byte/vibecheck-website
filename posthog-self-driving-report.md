# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for this web landing page. Session Replay, Error Tracking, and Support were enabled with server-managed defaults; health, error, and support responders were enabled for the Self-driving inbox.

Fresh scouts are scheduled to start within about 30 minutes. Findings will appear in the [Self-driving inbox](https://us.posthog.com/project/76085/inbox) as they accumulate.

## AI data processing

Approved by the wizard's organization-level gate before this setup ran.

## GitHub

The PostHog GitHub App was already connected before this run. GitHub Issues was not selected as an external responder, so no GitHub Issues warehouse source or responder was added.

## Products enabled

| Product | Result | Repository check |
|---|---|---|
| Session Replay | enabled | Web SDK initialization does not disable recording. No recordings existed at setup time. |
| Error Tracking | enabled | Web SDK exception capture is enabled; server-side exception capture is also configured. |
| Support | enabled | Support needs an inbound email, inbox, or Slack channel before tickets can arrive. |

## Signal sources

| Source product | Source type | Action |
|---|---|---|
| `signals_scout` | `cross_source_issue` | No row created; scout findings are allowed by the server default. |
| `health_checks` | `health_issue` | Enabled. |
| `error_tracking` | `issue_created` | Enabled. |
| `error_tracking` | `issue_reopened` | Enabled. |
| `error_tracking` | `issue_spiking` | Enabled. |
| `conversations` | `ticket` | Enabled. |
| `session_replay` | `session_analysis_cluster` | Deliberately skipped; this retired source is replaced by Replay Vision scanners. |
| `replay_vision` | — | Deliberately skipped; each scanner authorizes its own inbox output with `emits_signals`. |

## Connected tools

No external tools were selected in the connected-tools step. No warehouse sources were present at setup time, and no external responders were added.

## Scout troop

**Budget:** 100 runs/day enforced; 0 used at setup, 100 remaining. Announcement: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

### Enabled (6)

| Scout | Why it is enabled |
|---|---|
| `signals-scout-general` | Cross-product patterns and otherwise uncovered surfaces. |
| `signals-scout-health-checks` | Self-driving and instrumentation health. |
| `signals-scout-product-analytics` | Product-flow regressions. |
| `signals-scout-web-analytics` | Landing-page traffic, attribution, and page health. |
| `signals-scout-download-reliability` | Download-route reliability and click-to-resolution continuity. |
| `signals-scout-cta-conversion` | Landing-page conversion and download-entry volume. |

### Disabled (23)

| Scout | Reason |
|---|---|
| `signals-scout-ai-observability` | No LLM telemetry or AI-observability surface found. |
| `signals-scout-anomaly-detection` | No saved insight or dashboard inventory identified to watch. |
| `signals-scout-apm` | No APM or tracing usage found. |
| `signals-scout-conversations` | Support has no connected inbound channel yet; native ticket responder is already enabled. |
| `signals-scout-csp-violations` | No CSP-reporting configuration found. |
| `signals-scout-customer-analytics` | No account/group analytics surface found. |
| `signals-scout-data-pipelines` | No CDP, batch-export, or workflow surface found. |
| `signals-scout-data-warehouse` | No warehouse source exists. |
| `signals-scout-error-tracking` | Covered by the enabled native Error Tracking responders. |
| `signals-scout-experiments` | No experiment usage found. |
| `signals-scout-feature-flags` | No feature-flag usage found. |
| `signals-scout-inbox-validation` | Fresh inbox has no resolved reports to validate yet. |
| `signals-scout-insight-alerts` | No insight-alert inventory found. |
| `signals-scout-logs` | No PostHog Logs usage found. |
| `signals-scout-mcp-tool-calls` | Not a product surface of this application. |
| `signals-scout-observability-gaps` | Kept off to reserve troop capacity for focused download and conversion coverage. |
| `signals-scout-replay-vision` | Kept off because there were no prior Replay Vision observations; it can be enabled later after scanners are running. |
| `signals-scout-revenue-analytics` | No payment or revenue source found. |
| `signals-scout-session-replay` | Covered by Replay Vision scanners when their templates are available. |
| `signals-scout-skills-store` | No project-specific skills-store monitoring need identified. |
| `signals-scout-surveys` | No surveys exist. |
| `signals-scout-tasks` | No PostHog Tasks surface identified. |
| `signals-scout-web-vitals` | No confirmed web-vitals telemetry yet. |

## Custom scouts

Two approved, daily, inbox-emitting custom scouts were created and registered:

| Scout | Surface and discriminator | Why it is distinct |
|---|---|---|
| `signals-scout-download-reliability` | Download resolution failure rate and the share of clicks that become successful download resolutions, gated by active click volume. | Built-in web and product analytics do not directly reconcile the critical server-side download route with click intent. |
| `signals-scout-cta-conversion` | Download click-through rate relative to confirmed landing-page traffic, paired with absolute click volume. | This detects a traffic-supported loss of download intent that generic traffic monitoring or a saved-flow rate watcher can miss. |

Each treats collected values as untrusted data, stores only durable baselines or dedupe information, checks for an existing inbox report before authoring, and excludes incomplete windows and low-volume noise. If either proves noisy, set its `emit` configuration to `false` in PostHog to keep it running in dry-run mode.

Other surfaces were considered and ruled out because they had no evidence of use: revenue, AI/LLM, surveys, feature flags, experiments, logs, CSP reporting, data warehouse imports, and account analytics. Error tracking and replay are routed through their dedicated responder/scanner paths rather than duplicate scouts.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and can push qualifying visual defects to the inbox. Scanner findings have half weight and need independent corroboration before becoming an inbox report. This is the only setup component that spends Replay Vision quota.

| Monitor brief | Status | Scope / spend |
|---|---|---|
| Breakage monitor | Deferred | The required locked `replay-vision-scanners-core` and broken-experience templates were unavailable in this environment. No recordings existed yet; quota was verified as 2,500 credits remaining, but no safe template-backed query or estimate could be made. |
| Frustration monitor | Deferred | The required locked `replay-vision-scanner-user-frustration` template was unavailable. No broad or improvised scanner was created, preventing overlapping signal-emitting scans. |

## Files modified or created

| File | Change |
|---|---|
| `posthog-self-driving-report.md` | Created this setup report. |

No application source files were changed. Existing browser and server PostHog initialization already uses environment-based configuration and enables exception capture without disabling session recording.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) in PostHog so the enabled Support responder can receive tickets.
- [ ] Install or make available the shared Replay Vision scanner templates, then create the two template-backed monitors for landing-page breakage and rage-click frustration. They are safe to arm even before the first recording arrives.
- [ ] Revisit the disabled specialists if the product later adopts their surfaces, especially web vitals, feature flags, surveys, revenue, or a connected warehouse source.

## What happens next

The scout coordinator picks up the fresh configurations within roughly 30 minutes. Scheduled runs use the verified daily budget, cluster qualifying findings into reports, and route them to the [Self-driving inbox](https://us.posthog.com/project/76085/inbox). Immediately actionable reports can then begin coding tasks.
