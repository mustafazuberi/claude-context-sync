import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

export type ClaudeSyncConfig = {
  installedAt?: string;
  sessionDir?: string;
  sessionReason?: string;
  passphraseVerifier?: string;
};

export async function readConfig(configPath: string): Promise<ClaudeSyncConfig> {
  if (!existsSync(configPath)) return {};
  const raw = await readFile(configPath, "utf8");
  return JSON.parse(raw) as ClaudeSyncConfig;
}

export async function writeConfig(configPath: string, config: ClaudeSyncConfig): Promise<void> {
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}
