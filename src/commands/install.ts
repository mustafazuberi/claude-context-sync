import os from "node:os";
import { encryptBytes } from "../core/crypto.js";
import { readConfig, writeConfig } from "../core/config.js";
import { resolveGitHubToken } from "../core/github-token.js";
import { resolvePaths } from "../core/paths.js";
import { askConfirmedPassphrase } from "../core/prompt.js";
import { printResult } from "../core/output.js";
import type { CliArgs } from "../core/args.js";

export async function installCommand(args: CliArgs): Promise<void> {
  const paths = await resolvePaths(args);
  resolveGitHubToken();
  const passphrase = await askConfirmedPassphrase();
  const config = await readConfig(paths.configPath);
  const verifier = await encryptBytes(Buffer.from("claudesync", "utf8"), passphrase, {
    createdAt: Date.now(),
  });

  await writeConfig(paths.configPath, {
    ...config,
    installedAt: new Date().toISOString(),
    sessionDir: paths.sessionDir,
    sessionReason: paths.sessionReason,
    passphraseVerifier: verifier,
  });

  printResult(
    args,
    [
      "Installed ClaudeSync",
      "GitHub: OK",
      `Sessions: ${paths.sessionDir}`,
      `Config: ${paths.configPath}`,
      "",
      "Next:",
      "npx claudesync@latest send",
    ].join("\n"),
    {
      ok: true,
      command: "install",
      host: os.hostname(),
      sessionDir: paths.sessionDir,
      configPath: paths.configPath,
    },
  );
}
