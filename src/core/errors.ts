export class FriendlyError extends Error {
  constructor(
    message: string,
    readonly fix?: string,
  ) {
    super(message);
  }
}

export function formatError(error: unknown): string {
  const debug = process.argv.includes("--debug");
  if (error instanceof FriendlyError) {
    return [`Failed: ${error.message}`, error.fix ? `Fix: ${error.fix}` : undefined].filter(Boolean).join("\n");
  }

  if (debug && error instanceof Error) {
    return error.stack ?? error.message;
  }

  return "Failed: Something went wrong.\nFix: rerun with --debug";
}
