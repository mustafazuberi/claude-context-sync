# TODO

## Main Problem

Claude Code stores sessions by local folder path:

```text
~/.claude/projects/<encoded-cwd>/<session-id>.jsonl
```

Device A and Device B can have the same repo in different folders:

```text
Device A: C:\Users\Ali\work\my-app
Device B: /Users/ali/dev/my-app
```

If we restore using Device A's path on Device B, Claude Code may not show the session under the right project.

## Solution

Do not match projects by folder path.

Match projects by normalized Git remote origin.

Example:

```text
Device A remote: git@github.com:owner/my-app.git
Device B remote: https://github.com/owner/my-app
```

Both normalize to:

```text
github.com/owner/my-app
```

So we know they are the same repo even if their local paths are different.

## Receive Rule

Use remote origin to identify the repo.

Use Device B's local repo path to decide where Claude sessions should be placed.

Destination:

```text
~/.claude/projects/<encoded-device-b-path>/
```

## Behavior To Build

```text
1. send detects the current repo remote origin.
2. send stores source metadata inside encrypted payload.
3. receive reads encrypted metadata after decrypting.
4. receive searches Device B for a repo with the same normalized remote origin.
5. if found, import sessions into Device B's Claude project folder for that repo.
6. if not found, import sessions into archive/global fallback.
7. never overwrite existing Device B session files.
```

## Expected UX

Best case:

```bash
cd my-app
npx claude-context-sync@latest receive --gist <gistId>
```

If the current repo remote matches the handoff, sessions attach to this repo.

Explicit target:

```bash
npx claude-context-sync@latest receive --gist <gistId> --cwd /path/to/my-app
```

If no matching repo exists:

```text
No matching local repo was found.
Sessions were saved in archive.
Clone the repo, then rerun receive with --cwd to attach them.
```

## Safety Rule

Receive must be additive:

```text
If file does not exist: write it.
If file exists: write imported copy as <name>-imported-<hash>.jsonl.
Never delete local files.
Never overwrite local files.
```
