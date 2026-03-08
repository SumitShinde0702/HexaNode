import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AgentList from "../components/AgentList";
import AgentForm from "../components/AgentForm";
import InventoryList from "../components/InventoryList";
import InventoryForm from "../components/InventoryForm";

export default function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [editingInventory, setEditingInventory] = useState(null);

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : []);
    } catch (e) {
      setAgents([]);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setInventory(Array.isArray(data) ? data : []);
    } catch (e) {
      setInventory([]);
    }
  };

  useEffect(() => {
    Promise.all([fetchAgents(), fetchInventory()]).finally(() => setLoading(false));
  }, []);

  const onAgentSaved = () => {
    setShowAgentForm(false);
    setEditingAgent(null);
    fetchAgents();
  };

  const onInventorySaved = () => {
    setShowInventoryForm(false);
    setEditingInventory(null);
    fetchInventory();
  };

  const onEditAgent = (agent) => {
    setEditingAgent(agent);
    setShowAgentForm(true);
  };

  const onEditInventory = (item) => {
    setEditingInventory(item);
    setShowInventoryForm(true);
  };

  const onDeleteAgent = async (id) => {
    if (!confirm("Remove this agent?")) return;
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    fetchAgents();
  };

  const onDeleteInventory = async (product) => {
    if (!confirm("Remove this item?")) return;
    await fetch(`/api/inventory/${product}`, { method: "DELETE" });
    fetchInventory();
  };

  return (
    <div className="min-h-screen bg-void text-gray-200">
      <nav className="border-b border-border/50 bg-surface/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">
            Hexa<span className="text-accent">Node</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/api-docs" className="text-muted hover:text-accent text-sm font-medium transition-colors">
              API Docs
            </Link>
            <Link to="/" className="text-muted hover:text-gray-200 text-sm">
              ← Back
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted mb-10">
          Manage agents (companies) and inventory. Data is saved to JSON.
        </p>

        {loading ? (
          <div className="text-muted">Loading…</div>
        ) : (
          <div className="space-y-12">
            {/* Agents */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Agents</h2>
                <button
                  onClick={() => {
                    setEditingAgent(null);
                    setShowAgentForm(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-accent/20 text-accent font-medium hover:bg-accent/30 transition-colors"
                >
                  + Add Agent
                </button>
              </div>
              <AgentList
                agents={agents}
                onEdit={onEditAgent}
                onDelete={onDeleteAgent}
              />
            </section>

            {/* Inventory */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Inventory</h2>
                <button
                  onClick={() => {
                    setEditingInventory(null);
                    setShowInventoryForm(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-accent/20 text-accent font-medium hover:bg-accent/30 transition-colors"
                >
                  + Add Item
                </button>
              </div>
              <InventoryList
                inventory={inventory}
                onEdit={onEditInventory}
                onDelete={onDeleteInventory}
              />
            </section>
          </div>
        )}
      </main>

      {showAgentForm && (
        <AgentForm
          agent={editingAgent}
          onSave={onAgentSaved}
          onClose={() => {
            setShowAgentForm(false);
            setEditingAgent(null);
          }}
        />
      )}

      {showInventoryForm && (
        <InventoryForm
          item={editingInventory}
          onSave={onInventorySaved}
          onClose={() => {
            setShowInventoryForm(false);
            setEditingInventory(null);
          }}
        />
      )}
    </div>
  );
}
