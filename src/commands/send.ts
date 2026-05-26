import os from "node:os";
import path from "node:path";
import { hasFlag, type CliArgs } from "../core/args.js";
import { copyToClipboard } from "../core/clipboard.js";
import { encryptBytes } from "../core/crypto.js";
import { createHandoffGist } from "../core/gist-client.js";
import { resolveGitHubToken } from "../core/github-token.js";
import { resolvePaths } from "../core/paths.js";
import { askPassphrase } from "../core/prompt.js";
import { createSnapshot } from "../core/snapshot.js";
import { printResult } from "../core/output.js";

export async function sendCommand(args: CliArgs): Promise<void> {
  const paths = await resolvePaths(args);
  const token = resolveGitHubToken();
  const passphrase = await askPassphrase();
  const snapshot = await createSnapshot(paths.sessionDir);
  const createdAt = new Date().toISOString();
  const projectHint = path.basename(paths.cwd);

  const payload = await encryptBytes(snapshot, passphrase, {
    createdAt,
    host: os.hostname(),
    projectHint,
  });

  const gist = await createHandoffGist(
    token,
    payload,
    `claudesync-handoff:${createdAt}:${os.hostname()}:${projectHint}`,
  );
  const receiveCommand = `npx claudesync@latest receive --gist ${gist.id}`;
  const copied = hasFlag(args, "copy") ? copyToClipboard(receiveCommand) : false;

  printResult(
    args,
    [
      "Sent Claude handoff",
      `Gist: ${gist.id}`,
      copied ? "Clipboard: receive command copied" : `URL: ${gist.url}`,
      "",
      "On the other device:",
      receiveCommand,
      "",
      "Keep the passphrase private.",
    ].join("\n"),
    {
      ok: true,
      command: "send",
      gistId: gist.id,
      url: gist.url,
      receiveCommand,
      copied,
    },
  );
}
