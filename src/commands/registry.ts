export type CommandCategory =
  | "about"
  | "system"
  | "apps"
  | "media"
  | "games"
  | "utility"
  | "general";

export interface ArgOption {
  name: string;
  description?: string;
}

export interface ArgDefinition {
  name: string;
  description?: string;
  options?: ArgOption[];
}

export interface CommandDefinition {
  name: string;
  description: string;
  usage?: string;
  category: CommandCategory;
  args?: ArgDefinition[];
  handler: (args: string[], context: CommandContext) => Promise<void> | void;
}

export interface CommandContext {
  enterExclusiveMode: () => void;
  exitExclusiveMode: () => void;
}

const CATEGORY_ORDER: CommandCategory[] = [
  "about",
  "system",
  "apps",
  "media",
  "games",
  "utility",
  "general",
];

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  about: "About",
  system: "System",
  apps: "Apps",
  media: "Media",
  games: "Games",
  utility: "Utility",
  general: "General",
};

export class CommandRegistry {
  private commands: Map<string, CommandDefinition> = new Map();

  register(cmd: CommandDefinition): void {
    this.commands.set(cmd.name, cmd);
  }

  resolve(name: string): CommandDefinition | undefined {
    return this.commands.get(name);
  }

  search(prefix: string): CommandDefinition[] {
    const results: CommandDefinition[] = [];
    for (const cmd of this.commands.values()) {
      if (cmd.name.startsWith(prefix)) {
        results.push(cmd);
      }
    }
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  getAll(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  getByCategory(): { category: CommandCategory; label: string; commands: CommandDefinition[] }[] {
    const groups: { category: CommandCategory; label: string; commands: CommandDefinition[] }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const cmds = this.getAll()
        .filter((c) => c.category === cat)
        .sort((a, b) => a.name.localeCompare(b.name));
      if (cmds.length > 0) {
        groups.push({ category: cat, label: CATEGORY_LABELS[cat], commands: cmds });
      }
    }
    return groups;
  }
}
