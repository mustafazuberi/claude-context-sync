import type { CliArgs } from "./args.js";

export function printResult(args: CliArgs, human: string, json: unknown): void {
  if (args.flags.json) {
    console.log(JSON.stringify(json, null, 2));
    return;
  }

  console.log(human);
}
