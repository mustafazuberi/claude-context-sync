import { getFlag, type CliArgs } from "../core/args.js";
import { decryptBytes } from "../core/crypto.js";
import { FriendlyError } from "../core/errors.js";
import { getHandoffPayload } from "../core/gist-client.js";
import { resolveGitHubToken } from "../core/github-token.js";
import { resolvePaths } from "../core/paths.js";
import { askPassphrase } from "../core/prompt.js";
import { mergeSnapshot, readSnapshot } from "../core/snapshot.js";
import { printResult } from "../core/output.js";

export async function receiveCommand(args: CliArgs): Promise<void> {
  const gistId = getFlag(args, "gist") ?? args.positionals[0];
  if (!gistId) throw new FriendlyError("Missing Gist ID.", "Run: npx claude-context-sync@latest receive --gist <gistId>");

  const paths = await resolvePaths(args);
  const token = resolveGitHubToken();
  const payload = await getHandoffPayload(token, gistId);
  const decrypted = await decryptWithRetry(payload);
  const snapshot = await readSnapshot(decrypted.bytes);
  const result = await mergeSnapshot(snapshot, paths.sessionDir);

  printResult(
    args,
    [
      "Received Claude handoff",
      `Gist: ${gistId}`,
      `Imported: ${result.added}`,
      `Renamed: ${result.renamed}`,
      `Skipped: ${result.skipped}`,
      `Destination: ${paths.sessionDir}`,
      "",
      "Next: open Claude Code and resume imported session",
    ].join("\n"),
    {
      ok: true,
      command: "receive",
      gistId,
      destination: paths.sessionDir,
      ...result,
    },
  );
}

async function decryptWithRetry(payload: string) {
  try {
    return await decryptBytes(payload, await askPassphrase());
  } catch (error) {
    if (!(error instanceof FriendlyError)) throw error;
    console.error("Failed: Could not decrypt handoff.");
    console.error("Retry: enter the passphrase again.");
    return decryptBytes(payload, await askPassphrase());
  }
}
