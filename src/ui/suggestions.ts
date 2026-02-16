import { CommandRegistry } from "../commands/registry";
import { SuggestionItem } from "./renderer";

const MAX_SUGGESTIONS = 8;

export class SuggestionEngine {
  constructor(private registry: CommandRegistry) {}

  getSuggestions(input: string): SuggestionItem[] {
    // Only show suggestions when input starts with /
    if (!input.startsWith("/")) return [];

    const spaceIndex = input.indexOf(" ");

    // No space yet — suggest commands
    if (spaceIndex === -1) {
      const prefix = input.slice(1); // remove the /
      let matches = prefix.length === 0
        ? this.registry.getAll()
        : this.registry.search(prefix);

      return matches
        .slice(0, MAX_SUGGESTIONS)
        .map((cmd) => ({
          name: cmd.name,
          description: cmd.description,
          label: `/${cmd.name}`,
          completion: `/${cmd.name} `,
        }));
    }

    // Has a space — suggest positional argument completions
    const cmdName = input.slice(1, spaceIndex);
    const cmd = this.registry.resolve(cmdName);
    if (!cmd || !cmd.args) return [];

    const afterCmd = input.slice(spaceIndex + 1);
    // Split into parts: completed args + current partial
    const parts = afterCmd.split(" ");
    // argIndex is which argument position we're currently typing
    // e.g. "/harmonica " → parts=[""] → argIndex=0
    // e.g. "/harmonica file.wav " → parts=["file.wav",""] → argIndex=1
    // e.g. "/harmonica file.wav e" → parts=["file.wav","e"] → argIndex=1
    const argIndex = parts.length - 1;
    const partial = parts[argIndex];

    const argDef = cmd.args[argIndex];
    if (!argDef) return [];

    if (argDef.options) {
      // Selectable options — filter by prefix
      const matches = argDef.options.filter((o) =>
        o.name.startsWith(partial)
      );

      // Build the completion prefix from already-typed args
      const completedArgs = parts.slice(0, argIndex).join(" ");
      const prefix = completedArgs ? `/${cmdName} ${completedArgs} ` : `/${cmdName} `;

      return matches
        .slice(0, MAX_SUGGESTIONS)
        .map((opt) => ({
          name: opt.name,
          description: opt.description || "",
          label: opt.name,
          completion: `${prefix}${opt.name} `,
        }));
    }

    // Placeholder hint — only show when user hasn't started typing this arg
    if (partial === "") {
      return [{
        name: argDef.name,
        description: argDef.description || "",
        label: argDef.name,
        completion: "",
        hint: true,
      }];
    }

    return [];
  }
}
