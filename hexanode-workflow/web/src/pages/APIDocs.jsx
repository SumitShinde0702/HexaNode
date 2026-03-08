import { Link } from "react-router-dom";

export default function APIDocs() {
  const baseUrl = "http://localhost:3002";

  return (
    <div className="min-h-screen bg-void text-gray-200">
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <nav className="border-b border-border/50 bg-surface/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">
            Hexa<span className="text-accent">Node</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-muted hover:text-gray-200 text-sm">
              Dashboard
            </Link>
            <Link to="/" className="text-muted hover:text-gray-200 text-sm">
              ← Back
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 relative">
        <h1 className="text-3xl font-bold mb-2">API Reference</h1>
        <p className="text-muted mb-10">
          Register agents via the Infra API, then run one command to get a working CRE workflow.
        </p>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-accent mb-4">Create Your First Agent (3 Steps)</h2>
          <div className="space-y-4 text-sm">
            <p className="text-muted">Start the infra API, then register a buyer or seller.</p>
            <pre className="p-4 rounded-xl bg-surface border border-border/60 overflow-x-auto font-mono text-sm">
{`# Start infra API
cd infra && npm install && npm start
# Runs on ${baseUrl}`}
            </pre>
            <p className="text-muted">Register a buyer (e.g. supermarket with inventory):</p>
            <pre className="p-4 rounded-xl bg-surface border border-border/60 overflow-x-auto font-mono text-sm text-accent">
{`curl -X POST ${baseUrl}/v1/agents \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "buyer",
    "name": "My Supermarket",
    "inventory": [
      { "product": "milk", "quantity": 12, "unit": "gallons", "threshold": 20, "reorderQuantity": 50 }
    ]
  }'`}
            </pre>
            <p className="text-muted">Configure & run from repo root:</p>
            <pre className="p-4 rounded-xl bg-surface border border-border/60 overflow-x-auto font-mono text-sm">
{`node infra/cli/index.js <agent-id>
cd provider && bun run start
cre workflow simulate hexanode-workflow --target staging-settings`}
            </pre>
          </div>
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-accent mb-4">Endpoints</h2>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-surface/80">
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Endpoint</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <tr><td className="px-4 py-3"><span className="text-green-400">POST</span></td><td className="px-4 py-3 font-mono">/v1/agents</td><td className="px-4 py-3 text-muted">Register buyer or seller</td></tr>
                <tr><td className="px-4 py-3"><span className="text-cyan-400">GET</span></td><td className="px-4 py-3 font-mono">/v1/agents</td><td className="px-4 py-3 text-muted">List all agents</td></tr>
                <tr><td className="px-4 py-3"><span className="text-cyan-400">GET</span></td><td className="px-4 py-3 font-mono">/v1/agents/:id</td><td className="px-4 py-3 text-muted">Get agent details</td></tr>
                <tr><td className="px-4 py-3"><span className="text-cyan-400">GET</span></td><td className="px-4 py-3 font-mono">/v1/agents/:id/bundle</td><td className="px-4 py-3 text-muted">Get runnable CRE config</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Schemas */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-accent mb-4">Request Schemas</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Buyer</h3>
              <pre className="p-4 rounded-xl bg-surface border border-border/60 overflow-x-auto font-mono text-sm text-muted">
{`{
  "type": "buyer",
  "name": "Optional name",
  "inventory": [
    { "product": "milk", "quantity": 12, "unit": "gallons", "threshold": 20, "reorderQuantity": 50 }
  ]
}`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">Seller</h3>
              <pre className="p-4 rounded-xl bg-surface border border-border/60 overflow-x-auto font-mono text-sm text-muted">
{`{
  "type": "seller",
  "name": "Company name",
  "catalog": [
    { "product": "milk", "pricePerUnit": 3.5, "minOrder": 10, "slaHours": 24, "tags": ["dairy"] }
  ]
}`}
              </pre>
            </div>
          </div>
        </section>

        <p className="text-muted text-sm">
          Full docs: <a href="https://github.com/SumitShinde0702/HexaNode/blob/main/infra/README.md" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">infra/README.md</a>
        </p>
      </main>
    </div>
  );
}
