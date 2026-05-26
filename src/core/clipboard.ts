import { spawnSync } from "node:child_process";
import os from "node:os";

export function copyToClipboard(text: string): boolean {
  const platform = os.platform();
  if (platform === "win32") return spawnSync("clip", { input: text }).status === 0;
  if (platform === "darwin") return spawnSync("pbcopy", { input: text }).status === 0;
  return spawnSync("xclip", ["-selection", "clipboard"], { input: text }).status === 0;
}
