export type CliArgs = {
  command?: string;
  flags: Record<string, string | boolean>;
  positionals: string[];
};

export function parseArgs(argv: string[]): CliArgs {
  const command = argv[0]?.startsWith("--") ? undefined : argv[0];
  const rest = command ? argv.slice(1) : argv;
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value.startsWith("--")) {
      const key = value.slice(2);
      const next = rest[index + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        index += 1;
      } else {
        flags[key] = true;
      }
    } else {
      positionals.push(value);
    }
  }

  return { command, flags, positionals };
}

export function getFlag(args: CliArgs, name: string): string | undefined {
  const value = args.flags[name];
  return typeof value === "string" ? value : undefined;
}

export function hasFlag(args: CliArgs, name: string): boolean {
  return args.flags[name] === true;
}
