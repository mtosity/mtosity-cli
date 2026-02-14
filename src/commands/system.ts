import chalk, { ChalkInstance } from "chalk";
import si from "systeminformation";
import os from "os";
import { getPublicIP, getLocalIP } from "../utils/network";

interface OsLogo {
  art: string[];
  color: ChalkInstance;
}

function getOsLogo(platform: string, distro: string): OsLogo {
  const d = distro.toLowerCase();

  if (platform === "darwin") {
    return {
      color: chalk.green,
      art: [
        "                 ###",
        "               ####",
        "               ###",
        "       #######    #######",
        "     ######################",
        "    #####################",
        "    ####################",
        "    ####################",
        "    #####################",
        "     ######################",
        "      ####################",
        "        ################",
        "         ####     #####",
      ],
    };
  }

  if (platform === "win32") {
    return {
      color: chalk.blue,
      art: [
        "  ################  ################",
        "  ################  ################",
        "  ################  ################",
        "  ################  ################",
        "  ################  ################",
        "  ################  ################",
        "                                    ",
        "  ################  ################",
        "  ################  ################",
        "  ################  ################",
        "  ################  ################",
        "  ################  ################",
        "  ################  ################",
      ],
    };
  }

  // Linux distros
  if (d.includes("ubuntu")) {
    return {
      color: chalk.hex("#E95420"),
      art: [
        "             ..-***-.. ",
        "          .:+##########*.:",
        "        .=################=.",
        "       :####****####****####:",
        "      *##=.      **      .=##*",
        "     +##-    :*####*:    -##+",
        "    .##*    *########*    *##.",
        "    :##:   .##########.   :##:",
        "    .##*    *########*    *##.",
        "     +##-    :*####*:    -##+",
        "      *##=.      **      .=##*",
        "       :####****####****####:",
        "        .=################=.",
      ],
    };
  }

  if (d.includes("debian")) {
    return {
      color: chalk.red,
      art: [
        "       _____",
        "      /  __ \\",
        "     |  /    |",
        "     |  \\___-",
        "     -_",
        "       --_",
        "            ---___",
        "                 \\",
        "                  |",
        "                 /",
        "              ---",
        "           --",
        "          -",
      ],
    };
  }

  if (d.includes("arch")) {
    return {
      color: chalk.cyan,
      art: [
        "        /\\",
        "       /  \\",
        "      /\\   \\",
        "     /  ..  \\",
        "    /  '  '  \\",
        "   / ..'  '.. \\",
        "  / ..'    '.. \\",
        " /_'          '_\\",
        "                 ",
        "                 ",
        "                 ",
        "                 ",
        "                 ",
      ],
    };
  }

  if (d.includes("fedora")) {
    return {
      color: chalk.hex("#3C6EB4"),
      art: [
        "         _____",
        "        /   __)\\ ",
        "        |  /  \\ \\ ",
        "     ___|  |__/ /",
        "    / (_    _)_/",
        "   / /  |  |",
        "   \\ \\__/  |",
        "    \\(_____/",
        "                 ",
        "                 ",
        "                 ",
        "                 ",
        "                 ",
      ],
    };
  }

  // Generic Linux (Tux)
  return {
    color: chalk.yellow,
    art: [
      "        .--.  ",
      "       |o_o | ",
      "       |:_/ | ",
      "      //   \\ \\",
      "     (|     | )",
      "    /'\\_   _/`\\",
      "    \\___)=(___/",
      "               ",
      "               ",
      "               ",
      "               ",
      "               ",
      "               ",
    ],
  };
}

export async function runNeofetch() {
  const [cpu, mem, osInfo, graphics, publicIP] = await Promise.all([
    si.cpu(),
    si.mem(),
    si.osInfo(),
    si.graphics(),
    getPublicIP(),
  ]);

  const osName = [osInfo.distro, osInfo.release, osInfo.codename]
    .filter(Boolean)
    .join(" ");
  const gpu = graphics.controllers?.[0];
  const gpuName = gpu ? `${gpu.vendor} ${gpu.model}` : "unknown";
  const localIP = getLocalIP();

  const { art, color } = getOsLogo(osInfo.platform, osInfo.distro);

  const info = [
    `${chalk.bold(os.userInfo().username)}@${chalk.bold(os.hostname())}`,
    chalk.dim("─".repeat(30)),
    `${chalk.bold("OS")}:        ${osName}`,
    `${chalk.bold("Arch")}:      ${osInfo.arch}`,
    `${chalk.bold("Kernel")}:    ${osInfo.kernel}`,
    `${chalk.bold("Uptime")}:    ${(os.uptime() / 3600).toFixed(2)} hours`,
    `${chalk.bold("Shell")}:     ${process.env.SHELL || "unknown"}`,
    `${chalk.bold("CPU")}:       ${cpu.manufacturer} ${cpu.brand} (${cpu.cores} cores)`,
    `${chalk.bold("GPU")}:       ${gpuName}`,
    `${chalk.bold("Memory")}:    ${(mem.used / 1024 / 1024 / 1024).toFixed(2)}GiB / ${(mem.total / 1024 / 1024 / 1024).toFixed(2)}GiB`,
    `${chalk.bold("Local IP")}:  ${localIP}`,
    `${chalk.bold("Public IP")}: ${publicIP}`,
    "",
  ];

  // Pad art lines to equal width
  const artWidth = Math.max(...art.map((l) => l.length));
  const paddedArt = art.map((l) => l.padEnd(artWidth));

  const lines = Math.max(paddedArt.length, info.length);
  const output: string[] = [];

  for (let i = 0; i < lines; i++) {
    const artLine = paddedArt[i] || " ".repeat(artWidth);
    const infoLine = info[i] || "";
    output.push(`  ${color(artLine)}   ${infoLine}`);
  }

  console.log("\n" + output.join("\n") + "\n");
}
