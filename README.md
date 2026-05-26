# ClaudeSync

Move Claude Code sessions from one device to another with an encrypted GitHub Gist handoff.

ClaudeSync packages your local Claude Code session files, encrypts them on your machine, uploads the encrypted payload to a private Gist in your GitHub account, and imports it on another device without deleting existing Claude sessions.

## Why

Claude Code stores session history locally. When you switch computers, the new machine usually cannot continue the same local session. ClaudeSync gives you a simple handoff flow:

```bash
# Device A
npx claudesync@latest send

# Device B
npx claudesync@latest receive --gist <gistId>
```

## Requirements

- Node.js 20 or newer
- GitHub CLI
- Claude Code already used at least once on the source machine

Authenticate GitHub:

```bash
gh auth login
gh auth refresh -s gist
```

ClaudeSync uses GitHub CLI auth so you do not need to paste a personal access token into the tool.

## Install

Run once on each device:

```bash
npx claudesync@latest install
```

You will create a passphrase. Use the same passphrase when receiving the handoff on another device.

## Send From Device A

```bash
npx claudesync@latest send
```

ClaudeSync creates a new private Gist and prints something like:

```text
Sent Claude handoff
Gist: abc123
URL: https://gist.github.com/...

On the other device:
npx claudesync@latest receive --gist abc123

Keep the passphrase private.
```

Every `send` creates a separate private Gist, so each handoff has its own Gist ID.

## Receive On Device B

```bash
npx claudesync@latest receive --gist <gistId>
```

Enter the same passphrase used on Device A.

ClaudeSync imports the pulled sessions into the local Claude session directory. Existing sessions are preserved. If a file already exists, the imported copy is renamed with an `-imported-<hash>` suffix.

## Where Sessions Are Read From

ClaudeSync reads Claude Code sessions from:

```text
Windows: C:\Users\<you>\.claude\projects
macOS:   /Users/<you>/.claude/projects
Linux:   /home/<you>/.claude/projects
```

You normally do not need to configure this.

For development or debugging only, you can override the session directory:

```bash
CLAUDESYNC_SESSION_DIR=/path/to/test-sessions npx claudesync@latest send
```

## Check Setup

```bash
npx claudesync@latest doctor
```

`doctor` checks GitHub auth, the resolved Claude session directory, and local ClaudeSync config.

## Useful Options

Copy the receive command to clipboard when supported:

```bash
npx claudesync@latest send --copy
```

Print machine-readable output:

```bash
npx claudesync@latest send --json
npx claudesync@latest receive --gist <gistId> --json
```

Show technical errors:

```bash
npx claudesync@latest doctor --debug
```

## Security

- Session data is encrypted locally before upload.
- GitHub stores only encrypted ciphertext.
- The Gist ID identifies the handoff, but it is not enough to decrypt it.
- The passphrase is never uploaded.
- Normal output does not print secrets or stack traces.

## Troubleshooting

### GitHub login required

Run:

```bash
gh auth login
gh auth refresh -s gist
```

Then retry the ClaudeSync command.

### No Claude sessions found

Open Claude Code once in the project you want to move, then rerun:

```bash
npx claudesync@latest send
```

### Wrong passphrase

Use the same passphrase you entered when sending the handoff.

### Need diagnostics

Run:

```bash
npx claudesync@latest doctor
```

## Development

Clone the repo and run:

```bash
npm install
npm run build
node bin/claudesync.js --help
```

Use a fake session directory while developing so you do not touch real Claude sessions:

```bash
CLAUDESYNC_SESSION_DIR=.dev-sessions/a node bin/claudesync.js send
CLAUDESYNC_SESSION_DIR=.dev-sessions/b node bin/claudesync.js receive --gist <gistId>
```

`.dev-sessions` is only a local test folder. Normal users should not use it.

## Publish Checklist

Before publishing:

```bash
npm run build
npm pack --dry-run
```

Confirm the package includes `bin/`, `dist/`, `README.md`, and `package.json`.
