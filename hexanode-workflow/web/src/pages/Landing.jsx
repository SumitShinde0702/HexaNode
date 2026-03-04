import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-void text-gray-200">
      {/* Glow orbs */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-void/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-semibold tracking-tight">
              Hexa<span className="text-accent">Node</span>
            </span>
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg bg-accent/15 text-accent font-medium hover:bg-accent/25 transition-colors"
          >
            Open Dashboard
          </Link>
        </div>
      </nav>

      <main className="relative pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
            Autonomous{" "}
            <span className="bg-gradient-to-r from-accent to-cyan-400 bg-clip-text text-transparent">
              agent-to-agent
            </span>{" "}
            procurement
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            Detect inventory needs, discover suppliers, negotiate terms, and settle
            via x402 payments—all without human intervention. Built on Chainlink CRE.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="px-8 py-4 rounded-xl bg-accent text-void font-semibold hover:bg-accent-dim transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30"
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
        </div>

        <div className="max-w-5xl mx-auto mt-24 grid md:grid-cols-3 gap-6">
          {[
            { title: "Need Detection", desc: "Inventory thresholds trigger autonomous procurement cycles." },
            { title: "Supplier Discovery", desc: "Semantic search matches needs to agent companies." },
            { title: "x402 Settlement", desc: "Payments flow on-chain via Base Sepolia USDC." },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-border/60 bg-surface/50 backdrop-blur-sm hover:border-accent/30 transition-colors"
            >
              <h3 className="font-semibold text-accent mb-2">{item.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-muted text-sm mt-16">
          Chainlink Convergence Hackathon · CRE & AI Track
        </p>
      </main>
    </div>
  );
}
