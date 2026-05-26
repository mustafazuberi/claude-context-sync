import { installCommand } from "./commands/install.js";
import { sendCommand } from "./commands/send.js";
import { receiveCommand } from "./commands/receive.js";
import { doctorCommand } from "./commands/doctor.js";
import { FriendlyError, formatError } from "./core/errors.js";
import { parseArgs } from "./core/args.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args.command;

  if (!command || args.flags.help) {
    printHelp();
    return;
  }

  if (command === "install") return installCommand(args);
  if (command === "send" || command === "push") return sendCommand(args);
  if (command === "receive" || command === "pull") return receiveCommand(args);
  if (command === "doctor") return doctorCommand(args);

  throw new FriendlyError(`Unknown command: ${command}`, "Run: npx claudesync@latest --help");
}

function printHelp() {
  console.log(`ClaudeSync\n\nUsage:\n  claudesync install\n  claudesync send [--copy]\n  claudesync receive --gist <gistId>\n  claudesync doctor\n\nOptions:\n  --cwd <path>    Resolve paths from another folder\n  --json          Print machine-readable output\n  --debug         Show technical errors`);
}

main().catch((error: unknown) => {
  console.error(formatError(error));
  process.exit(error instanceof FriendlyError ? 1 : 2);
});
