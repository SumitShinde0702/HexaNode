import { Link } from "react-router-dom";

const CHAINLINK_FILES = [
  { file: "project.yaml", role: "CRE project config, Ethereum Sepolia RPC" },
  { file: "secrets.yaml", role: "Secret declarations (CRE_ETH_PRIVATE_KEY, DEEPSEEK_API_KEY)" },
  { file: "hexanode-workflow/main.ts", role: "CRE workflow entry — orchestration, HTTP, EVM, report" },
  { file: "hexanode-workflow/workflow.yaml", role: "Workflow artifacts, config paths" },
  { file: "hexanode-workflow/config.staging.json", role: "Staging config (inventory, providers, URLs)" },
  { file: "hexanode-workflow/config.production.json", role: "Production config" },
  { file: "contracts/HexaNodeRegistry.sol", role: "Onchain settlement record" },
  { file: "contracts/HexaNodePaymentReceiver.sol", role: "USDC transfers for x402 payments" },
];

const WORKFLOW_STATES = [
  { state: "needDetected", desc: "Scans inventory for items below threshold" },
  { state: "search", desc: "Finds providers by product match" },
  { state: "negotiate", desc: "LLM (DeepSeek) generates structured terms" },
  { state: "payment", desc: "Provider returns 402, workflow pays, provider releases data" },
  { state: "verified", desc: "Deterministic checks; optional onchain record" },
];

const REQUIREMENTS = [
  { label: "CRE workflow as orchestration layer", done: true },
  { label: "Blockchain + external API + LLM integration", done: true },
  { label: "Successful simulation via CRE CLI", done: true },
  { label: "Public source code (GitHub)", done: true },
  { label: "README with Chainlink file links", done: true },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-void text-gray-200">
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-void/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-semibold tracking-tight">
              Hexa<span className="text-accent">Node</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/api-docs" className="text-muted hover:text-accent text-sm font-medium transition-colors">
              API Docs
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg bg-accent/15 text-accent font-medium hover:bg-accent/25 transition-colors"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-28 pb-24 px-6 max-w-5xl mx-auto">
        {/* Hero */}
        <section className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent text-sm font-medium mb-6">
            Chainlink Convergence Hackathon · CRE & AI Track
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
            Autonomous{" "}
            <span className="bg-gradient-to-r from-accent to-cyan-400 bg-clip-text text-transparent">
              agent-to-agent
            </span>{" "}
            procurement
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Detect inventory needs, discover suppliers, negotiate terms, and settle
            via x402 payments—all without human intervention. Built on Chainlink CRE.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="px-8 py-4 rounded-xl bg-accent text-void font-semibold hover:bg-accent-dim transition-all shadow-lg shadow-accent/20"
            >
              Launch Dashboard
            </Link>
            <a
              href="https://github.com/SumitShinde0702/HexaNode"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl border border-border text-gray-300 hover:border-accent/50 hover:text-accent transition-all"
            >
              View on GitHub
            </a>
          </div>
        </section>

        {/* Requirements checklist */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-6 text-accent">Hackathon Requirements</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {REQUIREMENTS.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-surface/50"
              >
                <span className="text-accent text-lg">{r.done ? "✓" : "○"}</span>
                <span className={r.done ? "text-gray-200" : "text-muted"}>{r.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture flow */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-6 text-accent">Architecture</h2>
          <div className="p-6 rounded-2xl border border-border/60 bg-surface/50 font-mono text-sm overflow-x-auto">
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
              <span className="px-3 py-1.5 rounded bg-border/80">inventory</span>
              <span className="text-muted">→</span>
              <span className="px-3 py-1.5 rounded bg-accent/20 text-accent">needDetected</span>
              <span className="text-muted">→</span>
              <span className="px-3 py-1.5 rounded bg-border/80">search</span>
              <span className="text-muted">→</span>
              <span className="px-3 py-1.5 rounded bg-border/80">negotiate</span>
              <span className="text-muted">→</span>
              <span className="px-3 py-1.5 rounded bg-border/80">payment</span>
              <span className="text-muted">→</span>
              <span className="px-3 py-1.5 rounded bg-border/80">verified</span>
              <span className="text-muted">→</span>
              <span className="px-3 py-1.5 rounded bg-cyan-500/20 text-cyan-400">HexaNodeRegistry</span>
            </div>
          </div>
        </section>

        {/* Integration highlights */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-6 text-accent">Integration</h2>
          <p className="text-muted mb-6">
            CRE workflow integrates <strong className="text-gray-300">blockchain</strong>,{" "}
            <strong className="text-gray-300">external API</strong>, and{" "}
            <strong className="text-gray-300">LLM</strong> as required.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border/60 bg-surface/50">
              <h3 className="font-semibold text-accent mb-2">Blockchain</h3>
              <p className="text-muted text-sm">Ethereum Sepolia · HexaNodeRegistry · writeReport</p>
            </div>
            <div className="p-6 rounded-2xl border border-border/60 bg-surface/50">
              <h3 className="font-semibold text-accent mb-2">External API</h3>
              <p className="text-muted text-sm">x402 provider · HTTP 402 payment handshake</p>
            </div>
            <div className="p-6 rounded-2xl border border-border/60 bg-surface/50">
              <h3 className="font-semibold text-accent mb-2">LLM</h3>
              <p className="text-muted text-sm">DeepSeek · structured negotiation terms</p>
            </div>
          </div>
        </section>

        {/* Workflow states */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-6 text-accent">Workflow States</h2>
          <div className="space-y-3">
            {WORKFLOW_STATES.map((s, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/60 bg-surface/50">
                <code className="text-accent font-mono text-sm shrink-0">{s.state}</code>
                <span className="text-muted text-sm">{s.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Chainlink files */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-6 text-accent">Chainlink / CRE Files</h2>
          <p className="text-muted mb-4 text-sm">
            All files that use Chainlink CRE or integrate with the workflow:
          </p>
          <div className="rounded-xl border border-border/60 bg-surface/50 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="px-4 py-3 font-semibold text-accent">File</th>
                  <th className="px-4 py-3 font-semibold text-accent">Role</th>
                </tr>
              </thead>
              <tbody>
                {CHAINLINK_FILES.map((row, i) => (
                  <tr key={i} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3 font-mono text-cyan-400">{row.file}</td>
                    <td className="px-4 py-3 text-muted">{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Simulation command */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-6 text-accent">Run Simulation</h2>
          <div className="p-6 rounded-xl border border-border/60 bg-surface/50 font-mono text-sm">
            <code className="text-accent">cre workflow simulate hexanode-workflow --target staging-settings</code>
          </div>
          <p className="text-muted text-sm mt-3">
            Prerequisites: provider running, CRE CLI installed, <code className="text-accent/80">cre login</code>
          </p>
        </section>

        {/* Footer */}
        <footer className="text-center text-muted text-sm pt-8 border-t border-border/40">
          <p>Chainlink Convergence Hackathon · CRE & AI Track</p>
          <a href="https://github.com/SumitShinde0702/HexaNode" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline mt-1 inline-block">
            github.com/SumitShinde0702/HexaNode
          </a>
        </footer>
      </main>
    </div>
  );
}
