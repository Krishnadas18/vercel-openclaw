---
name: sandbox-lifecycle-debug
description: "Sandbox lifecycle debugging for vercel-openclaw: create, resume, stop, snapshotting, reset, stale-running reconciliation, persistent Sandbox v2 behavior, hot spares, and lifecycle locks. Use when sandbox state transitions, status polling, stop/resume, reset, or lifecycle recovery is wrong."
---

# Sandbox Lifecycle Debug

Use this skill when the sandbox state machine is the primary suspect.

## Start Here

Read `lat.md/sandbox-lifecycle.md` sections `Status State Machine`, `Triggers -- What Causes State Transitions`, and the specific trigger involved. Run `lat locate "Sandbox Lifecycle"` or `lat search "sandbox lifecycle <symptom>"` when unsure.

Collect before edits:

- `GET /api/status` and any UI state that triggered the action.
- `GET /api/admin/sandbox-diag`.
- `GET /api/admin/logs` filtered for `sandbox.`, `gateway.`, `watchdog.`, `proxy.`.
- Local `git rev-parse HEAD`, remote `git ls-remote origin main`, and live deployment proof.

## Split The State

Report these separately:

- metadata status in `SingleMeta.status`
- Vercel Sandbox SDK status
- gateway readiness on port 3000
- snapshot / persistent resume target availability
- lifecycle lock and start lock state when visible
- UI polling status

Do not use `running` as shorthand for gateway-ready or user-ready.

## Common Paths

- Admin ensure: `/api/admin/ensure` -> `ensureSandboxRunning()` / `ensureSandboxReady()`.
- Gateway request: auth -> `ensureSandboxRunning()` -> token refresh -> `touchRunningSandbox()` -> proxy.
- Stop/snapshot: `stopSandbox()` -> cleanup -> cron persistence -> `sandbox.stop({ blocking: false })` -> `snapshotting`.
- Status polling: `GET /api/status` -> stale running or snapshotting reconciliation.
- Reset: `resetSandbox()` destroys active sandbox and snapshots, clears cron and token metadata.

## Fix Boundaries

- Primary: `src/server/sandbox/lifecycle.ts`, `src/server/sandbox/controller.ts`.
- Routes: `src/app/api/admin/{ensure,stop,snapshot,reset,status}/**` and `src/app/api/status/route.ts`.
- Tests: lifecycle and harness tests under `src/server/sandbox/**.test.ts` and `src/test-utils/harness`.
- Docs: `lat.md/sandbox-lifecycle.md`, `docs/lifecycle-and-restore.md`.

## Verification

Use the narrowest command that covers the path, then run the repo verifier when the change has broad lifecycle impact:

```bash
node scripts/verify.mjs --steps=test,typecheck
lat check
```

For live lifecycle incidents, include before/after `/api/status`, `/api/admin/sandbox-diag`, and relevant log events.
