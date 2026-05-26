# ClaudeSync Product Gaps and Decisions

This file captures the product decisions made so far and the gaps that must be solved before ClaudeSync feels reliable enough to publish.

## Core Product Decision

ClaudeSync is an encrypted Claude Code session handoff tool.

The core flow is:

```bash
# Device A
npx claudesync@latest send

# Device B
npx claudesync@latest receive --gist <gistId>
```

Each `send` creates a new private GitHub Gist containing one encrypted handoff payload. Device B downloads the exact handoff by Gist ID and decrypts it using the user's passphrase.

## Storage Decision

- Use the user's GitHub account.
- Use private Gists.
- Create one Gist per handoff.
- Store only encrypted ciphertext in GitHub.
- Do not use ClaudeSync-owned backend storage in v1.

Reasoning: this avoids asking users to trust our infrastructure while still removing manual file transfer.

## Security Decision

- Encrypt locally before upload.
- Require passphrase on receive.
- Gist ID is only a locator, not the secret.
- Passphrase is never uploaded.
- Normal output must not print secrets or stack traces.

## Import Decision

Receive must be additive.

- Never delete existing Device B sessions.
- Never overwrite existing Device B session files.
- If a conflict exists, import using a deterministic suffix like `-imported-<hash>`.

## Major Gap: Project Path Mapping

Claude Code stores sessions by current working directory:

```text
~/.claude/projects/<encoded-cwd>/<session-id>.jsonl
```

That means Device A and Device B may store the same repo under different paths:

```text
Device A: C:\Users\Ali\work\my-app
Device B: /Users/ali/dev/my-app
```

If ClaudeSync restores sessions under Device A's encoded path, the sessions may not appear naturally under Device B's project.

## Proposed Feature: Project Remapping

Feature name: **Project Remapping**

Project Remapping means ClaudeSync maps an imported handoff from Device A's project identity to the correct local project path on Device B.

The strongest matching signal is Git remote origin.

### Send Metadata

On `send`, include non-secret metadata in the encrypted payload:

- source cwd
- source encoded Claude project folder
- git remote origin URL, if available
- git branch, if available
- project folder name
- session IDs included
- created timestamp

### Receive Matching Strategy

On `receive`, ClaudeSync should try to find the matching repo on Device B.

Matching order:

1. If user passes `--cwd <path>`, import into that path's Claude project folder.
2. If current directory is a git repo and its normalized origin matches the handoff origin, import into current directory's Claude project folder.
3. Search known local repos for matching normalized origin.
4. If exactly one match is found, import into that repo's Claude project folder.
5. If multiple matches are found, ask user to choose.
6. If no match is found, import into a global/archive bucket and explain clearly.

## Local Repo Discovery Gap

ClaudeSync needs a way to discover repos on Device B.

Potential sources:

- Current working directory.
- Recently seen repos stored in `~/.claudesync/config.json`.
- Claude's existing `~/.claude/projects` session metadata, because JSONL entries often include `cwd`.
- Optional configured scan roots, for example:

```text
~/code
~/dev
~/projects
```

Open decision: repo scanning should be conservative in v1 to avoid slow filesystem walks.

## Global Import Fallback

If Project Remapping cannot confidently find a local repo, receive should still succeed.

Fallback behavior:

- Import sessions into a ClaudeSync-managed archive project folder.
- Preserve all sessions.
- Print a clear note that this was a global/archive import.

Example output:

```text
Received Claude handoff
Imported: 4
Destination: global ClaudeSync archive

Note:
No matching local repo was found.
Sessions were added safely without overwriting local history.
```

Open question: exact archive folder naming must be verified against Claude Code behavior.

## UX Decision

The user should not need to understand encoded Claude project paths.

Preferred receive UX:

```bash
cd my-app
npx claudesync@latest receive --gist <gistId>
```

Meaning:

```text
Import this handoff into the project I am currently in.
```

If ClaudeSync uses a fallback, it must say so explicitly.

## Other Known Gaps

### Claude Session Format

We need to verify exactly which files are required for useful resume:

- `~/.claude/projects/<encoded-cwd>/*.jsonl`
- `~/.claude/file-history/<session-id>/`
- subagent transcript files, if present
- metadata files, if present

### Session Rewriting

JSONL entries may contain the original `cwd`.

Open question:

- Should ClaudeSync rewrite `cwd` fields to Device B's target path?
- Or should it preserve original transcripts exactly and only remap storage location?

Default assumption for now:

- Preserve JSONL content exactly.
- Only remap destination path.

### Conflict Handling

Current decision:

- Keep both local and imported files.
- Rename imported conflicts.

Open question:

- Should user output show imported session IDs and original source project?

### Gist Lifecycle

Current decision:

- Create one private Gist per handoff.

Open questions:

- Should `receive` offer to delete the Gist after successful import?
- Should `send` support `--expires` metadata even though GitHub Gist cannot auto-expire?
- Should `list` show previous handoff Gists from the user's account?

### GitHub Permissions

GitHub CLI may need Gist scope:

```bash
gh auth refresh -s gist
```

Open requirement:

- Detect missing Gist scope and show this exact fix command.

### Package UX

README should stay user-facing.

Internal planning and gap documents should not ship in npm package contents unless intentionally included.

## Current Implementation Gap

The current implementation snapshots and merges relative paths from the whole session directory.

That is not enough for robust cross-device project handoff.

Required implementation change:

- `send` should package sessions with project identity metadata.
- `receive` should resolve target project path using Project Remapping.
- `receive` should place imported sessions into the resolved Device B Claude project folder, or into a global/archive fallback.
