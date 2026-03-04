import { useState, useEffect } from "react";

export default function AgentForm({ agent, onSave, onClose }) {
  const [form, setForm] = useState({
    name: "",
    products: "",
    tags: "",
    basePricePerUnit: "",
    minOrderQuantity: "",
    slaHours: "",
  });

  useEffect(() => {
    if (agent) {
      setForm({
        name: agent.name ?? "",
        products: (agent.products || []).join(", "),
        tags: (agent.tags || []).join(", "),
        basePricePerUnit: String(agent.basePricePerUnit ?? ""),
        minOrderQuantity: String(agent.minOrderQuantity ?? ""),
        slaHours: String(agent.slaHours ?? ""),
      });
    }
  }, [agent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      products: form.products.split(/[,\s]+/).filter(Boolean),
      tags: form.tags.split(/[,\s]+/).filter(Boolean),
      basePricePerUnit: parseFloat(form.basePricePerUnit) || 0,
      minOrderQuantity: parseInt(form.minOrderQuantity, 10) || 0,
      slaHours: parseInt(form.slaHours, 10) || 0,
    };
    if (agent?.id) payload.id = agent.id;

    const url = agent ? `/api/agents/${agent.id}` : "/api/agents";
    const method = agent ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <h3 className="text-lg font-semibold mb-4">
          {agent ? "Edit Agent" : "Add Agent (Company)"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Company name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg bg-void border border-border text-gray-200 focus:border-accent focus:outline-none"
              placeholder="Fresh Dairy Co"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Products (comma-separated)</label>
            <input
              type="text"
              value={form.products}
              onChange={(e) => setForm({ ...form, products: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-void border border-border text-gray-200 focus:border-accent focus:outline-none"
              placeholder="milk, yogurt, cream"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-void border border-border text-gray-200 focus:border-accent focus:outline-none"
              placeholder="dairy, local"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Base price / unit</label>
              <input
                type="number"
                step="0.01"
                value={form.basePricePerUnit}
                onChange={(e) => setForm({ ...form, basePricePerUnit: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-void border border-border text-gray-200 focus:border-accent focus:outline-none"
                placeholder="3.50"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Min order qty</label>
              <input
                type="number"
                value={form.minOrderQuantity}
                onChange={(e) => setForm({ ...form, minOrderQuantity: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-void border border-border text-gray-200 focus:border-accent focus:outline-none"
                placeholder="10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">SLA (hours)</label>
            <input
              type="number"
              value={form.slaHours}
              onChange={(e) => setForm({ ...form, slaHours: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-void border border-border text-gray-200 focus:border-accent focus:outline-none"
              placeholder="24"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-accent text-void font-medium hover:bg-accent-dim"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-muted hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
