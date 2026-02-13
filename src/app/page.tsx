import { Terminal } from "@/components/terminal";

export default function Home() {
  return (
    <main className="h-screen w-screen p-3 sm:p-6 flex flex-col overflow-hidden bg-terminal-bg">
      {/* Ambient glow background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-terminal-green/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-terminal-cyan/3 rounded-full blur-3xl" />
      </div>

      {/* Terminal */}
      <div className="relative z-10 flex-1 min-h-0">
        <Terminal />
      </div>
    </main>
  );
}
