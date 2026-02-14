import chalk from "chalk";
import { exec } from "child_process";
import os from "os";

const BAYMAX = [
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣶⣶⣶⣦⣤⡀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⣤⣤⣄⣀⡀⠀⠀⠀⠀⠀⠀⣴⡟⠉⠀⠀⠀⠀⠙⢻⣆⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⠾⠛⠋⠉⠉⠉⠉⠙⠻⢷⣤⡀⠀⠀⣼⠏⠀⠀⠀⠀⠀⠀⠀⠀⣿⡆",
  "⠀⠀⠀⠀⠀⠀⠀⠀⢠⣾⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡄⣼⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⡇",
  "⠀⠀⠀⠀⠀⠀⠀⢀⣿⠃⠀⠀⠀⠀⠀⠀⠀⣀⣰⣶⡆⠀⠀⠘⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⠁",
  "⠀⠀⠀⠀⠀⠀⠀⢸⡇⠀⠀⢰⣿⡖⠒⠈⠉⠀⠀⠉⠀⠀⠀⢠⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⠇⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠘⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣞⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣾⠏⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⢹⣷⣄⡀⠀⠀⠀⠀⠀⠀⣀⣠⠴⠚⠁⠈⢧⡀⠀⠀⠀⠀⠀⢀⣴⡿⠁⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⢀⣴⠟⢫⠿⠉⠛⠒⠒⠒⠛⠉⠉⠀⢀⠤⢄⠀⡐⢷⠀⠀⠀⣠⣴⠿⠋⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⢀⣴⠟⠁⠀⡞⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⢗⠀⢐⠂⠁⠸⣧⣶⠿⠛⠁⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⢠⣾⢫⠀⠀⢰⣃⣀⣇⣀⣀⣀⣀⣀⣀⣀⣀⣀⣉⣀⣀⣀⣀⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⢠⡿⠁⡈⠀⣠⠏⠀⠰⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠡⠀⠙⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⢠⣿⠃⡐⠁⣰⠃⠀⡰⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠡⡀⠘⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⣼⡟⠊⠀⢠⣏⠤⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠢⣸⣷⠀⠀⠀⠀⠀⠀⠀⠀",
  "⢠⣿⠀⠀⠀⣼⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⡇⠀⠀⠀⠀⠀⠀⠀",
  "⢸⡟⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀",
  "⢸⣇⠀⠀⠀⠸⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⠃⠀⠀⠀⠀⠀⠀⠀",
  "⠘⣿⠀⠀⠀⠀⠹⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⠏⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⢻⣧⠀⠀⠀⠀⢸⠳⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡴⢻⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠻⣧⣀⠀⠀⣸⡆⠀⡝⠓⠦⣤⣀⣀⡀⠀⠀⠀⣀⣀⣤⠴⠚⢹⠀⣸⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠈⠛⠛⠛⢻⣧⠜⠀⠀⠀⠀⠀⠈⠉⢹⣏⠉⠉⠀⠀⠀⠀⠀⢣⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⢻⣦⠀⠀⠀⠀⠀⠀⠀⣾⣿⡀⠀⠀⠀⠀⠀⢠⣾⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣷⣄⡀⠀⠀⠀⣴⡟⢻⣷⣀⠀⣀⣠⣴⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠛⠿⠿⠟⠋⠀⠀⠙⠛⠿⠟⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
];

const GRADIENT = [
  [0, 255, 200],
  [0, 220, 255],
  [80, 180, 255],
  [140, 140, 255],
  [200, 100, 255],
] as const;

const platform = os.platform();

function playSound(name: string): void {
  if (platform === "darwin") {
    exec(`afplay "/System/Library/Sounds/${name}.aiff" &`, () => {});
  } else if (platform === "win32") {
    // Map macOS sound names to Windows SystemSound equivalents
    const winMap: Record<string, string> = {
      Blow: "SystemStart",
      Hero: "SystemExclamation",
      Pop: "SystemAsterisk",
      Glass: "SystemHand",
    };
    const winSound = winMap[name] || "SystemDefault";
    exec(
      `powershell -c "(New-Object Media.SoundPlayer 'C:\\Windows\\Media\\Windows Notify System Generic.wav').PlaySync()" 2>nul || powershell -c "[System.Media.SystemSounds]::${winSound}.Play()"`,
      () => {}
    );
  } else {
    // Linux: try paplay (PulseAudio), aplay (ALSA), or terminal bell
    exec(
      `paplay /usr/share/sounds/freedesktop/stereo/message-new-instant.oga 2>/dev/null || aplay /usr/share/sounds/freedesktop/stereo/message-new-instant.oga 2>/dev/null || printf '\\a'`,
      () => {}
    );
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function gradientText(text: string, colors: readonly (readonly [number, number, number])[]): string {
  const chars = [...text];
  const len = chars.length || 1;
  return chars
    .map((ch, i) => {
      const t = i / (len - 1 || 1);
      const segCount = colors.length - 1;
      const seg = Math.min(Math.floor(t * segCount), segCount - 1);
      const localT = t * segCount - seg;
      const [r1, g1, b1] = colors[seg];
      const [r2, g2, b2] = colors[seg + 1];
      return chalk.rgb(lerp(r1, r2, localT), lerp(g1, g2, localT), lerp(b1, b2, localT))(ch);
    })
    .join("");
}

async function fadeIn(text: string, steps = 3, stepDelay = 60): Promise<void> {
  const levels = [chalk.hidden, chalk.dim, chalk.reset];
  for (let s = 0; s < steps; s++) {
    const render = s < levels.length ? levels[s] : chalk.reset;
    process.stdout.write(`\r${render(text)}`);
    await sleep(stepDelay);
  }
  process.stdout.write(`\r${text}\n`);
}

export async function showResume() {
  const W = 68;
  console.log("");

  // --- Baymax art: fast scan reveal ---
  playSound("Blow");
  for (let i = 0; i < BAYMAX.length; i++) {
    const t = i / (BAYMAX.length - 1);
    const r = lerp(100, 255, t);
    const g = lerp(200, 255, t);
    const b = lerp(255, 255, t);
    console.log(chalk.rgb(r, g, b)(`  ${BAYMAX[i]}`));
    await sleep(25);
  }

  await sleep(300);

  // --- Name with gradient ---
  playSound("Hero");
  await fadeIn(`  ${gradientText("Minh Tam Nguyen", GRADIENT)}  ${chalk.dim("(MTosity)")}`);
  await sleep(100);
  await fadeIn(`  ${chalk.rgb(0, 220, 255).bold("Software Engineer")}`);
  await fadeIn(chalk.dim.italic(`  "Baymax Engineer - I'll do everything that interesting and challenging"`));
  console.log("");
  console.log(
    chalk.dim("  ") +
      chalk.rgb(0, 255, 200).underline("mtosity.com") +
      chalk.dim("  ·  ") +
      chalk.rgb(0, 220, 255)("mtosity@gmail.com") +
      chalk.dim("  ·  ") +
      chalk.rgb(80, 180, 255)("github.com/mtosity") +
      chalk.dim("  ·  ") +
      chalk.rgb(200, 100, 255)("linkedin.com/in/mtosity")
  );

  await sleep(400);

  // --- Tech Stack card ---
  console.log("");
  playSound("Pop");
  const techHeader = `${chalk.rgb(0, 255, 200).bold("  TECH STACK")}`;
  console.log(techHeader);
  console.log("");

  const techRows = [
    { label: "Frontend", items: ["React", "Next.js", "Vue.js", "Redux", "Tailwind"] },
    { label: "Backend", items: ["Node.js", "Express", "Golang", "Python", "GraphQL"] },
    { label: "Data/ML", items: ["TensorFlow", "PyTorch", "Scikit-learn", "D3.js"] },
    { label: "Database", items: ["PostgreSQL", "MongoDB", "MySQL", "Firebase"] },
    { label: "DevOps", items: ["AWS", "Azure", "Docker", "Linux", "Datadog"] },
    { label: "Testing", items: ["Jest", "Cypress", "React Testing Library"] },
  ];

  for (const row of techRows) {
    const tags = row.items.map((item) => chalk.rgb(80, 180, 255)(` ${item} `)).join(chalk.dim(" · "));
    console.log(`    ${chalk.bold.white(row.label.padEnd(10))} ${tags}`);
    await sleep(50);
  }

  await sleep(300);

  // --- Experience card ---
  console.log("");
  const line = chalk.dim("  " + "─".repeat(W));
  console.log(line);
  console.log("");
  playSound("Pop");
  console.log(chalk.rgb(0, 255, 200).bold("  EXPERIENCE"));
  console.log("");

  const jobs = [
    { company: "Coalition Inc", role: "Software Engineer II", period: "Jun 2022 – Present" },
    { company: "Pixie", role: "Frontend Engineer", period: "Mar 2021 – Jun 2022" },
    { company: "Vinbrain", role: "Software Engineer", period: "Nov 2020 – Feb 2021" },
    { company: "Facebook Developer Circle", role: "Teaching Assistant", period: "May 2020 – Sep 2020" },
  ];

  for (const job of jobs) {
    console.log(
      `    ${chalk.bold.white(job.company)}  ${chalk.dim("·")}  ${chalk.rgb(0, 220, 255)(job.role)}  ${chalk.dim("·")}  ${chalk.dim(job.period)}`
    );
    await sleep(80);
  }

  await sleep(300);

  // --- Projects card ---
  console.log("");
  console.log(line);
  console.log("");
  playSound("Pop");
  console.log(chalk.rgb(0, 255, 200).bold("  PROJECTS"));
  console.log("");

  const projects = [
    { name: "Real-time Wildfires Tracker", tech: "Next.js, NASA FIRMS" },
    { name: "TheStockie.com", tech: "Stock analysis with LLM" },
    { name: "Coalition Cyber Experience", tech: "Insurance platform" },
    { name: "Pixie Social App", tech: "Social connections at scale" },
    { name: "E-commerce Platform", tech: "Full-stack MERN" },
    { name: "Animal Detection", tech: "ML thesis · CNN, SVM" },
  ];

  for (const proj of projects) {
    console.log(`    ${chalk.bold.white(proj.name)}  ${chalk.dim("—")}  ${chalk.dim(proj.tech)}`);
    await sleep(60);
  }

  // --- Footer ---
  console.log("");
  console.log(line);
  console.log("");
  playSound("Glass");
  console.log(gradientText("  \"Let's build something great together.\"", GRADIENT));
  console.log("");
}
