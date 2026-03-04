export default function AgentList({ agents, onEdit, onDelete }) {
  if (agents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center text-muted">
        No agents yet. Add one to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="group rounded-2xl border border-border/60 bg-surface/50 p-6 hover:border-accent/30 transition-all"
        >
          <h3 className="font-semibold text-lg mb-1">{agent.name}</h3>
          <p className="text-muted text-sm font-mono mb-3">{agent.id}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(agent.products || []).map((p) => (
              <span
                key={p}
                className="px-2 py-0.5 rounded-md bg-accent/15 text-accent text-xs"
              >
                {p}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>${agent.basePricePerUnit ?? 0}/unit</span>
            <span>·</span>
            <span>Min {agent.minOrderQuantity ?? 0}</span>
            <span>·</span>
            <span>{agent.slaHours ?? 0}h SLA</span>
          </div>
          <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(agent)}
              className="text-xs text-accent hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(agent.id)}
              className="text-xs text-red-400 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
