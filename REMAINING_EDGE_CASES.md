# Remaining Edge Cases

These are known cases we are not fully handling yet.

## Repo Matching

```text
No origin remote:
Need to check all git remotes, not only origin.

Fork vs upstream:
Exact remote match may fail if Device A uses fork and Device B uses upstream.

Multiple matching repos:
Need interactive picker, or fail with --cwd suggestion in non-interactive mode.

Repo missing on Device B:
Need archive/global fallback.
```

## Import Safety

```text
Same Gist received twice:
Need conflict-safe imported filenames.

Partial import failure:
Need temp staging before writing final files.

Claude Code running:
Need warning or --force behavior before modifying session files.
```

## Session Data

```text
Absolute paths inside JSONL:
Need to decide whether to preserve or rewrite. Recommendation for v1: preserve.

Different branch:
Need to show source branch, but still import.

Huge handoff:
Need size check before uploading to Gist.
```

## GitHub

```text
Missing Gist permission:
Need exact fix: gh auth refresh -s gist

Wrong GitHub account:
Need clear error if Device B cannot access the private Gist.

Deleted Gist:
Need clear "handoff not found" message.
```

## Platform

```text
Windows/macOS/Linux path differences:
Need path normalization before encoding Claude project path.

Claude storage changes:
Need doctor and CLAUDESYNC_SESSION_DIR override to remain reliable.
```
