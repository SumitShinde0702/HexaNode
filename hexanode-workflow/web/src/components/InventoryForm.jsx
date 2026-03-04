import { useState, useEffect } from "react";

export default function InventoryForm({ item, onSave, onClose }) {
  const [form, setForm] = useState({
    product: "",
    quantity: "",
    unit: "units",
    threshold: "",
    reorderQuantity: "",
  });

  useEffect(() => {
    if (item) {
      setForm({
        product: item.product ?? "",
        quantity: String(item.quantity ?? ""),
        unit: item.unit ?? "units",
        threshold: String(item.threshold ?? ""),
        reorderQuantity: String(item.reorderQuantity ?? ""),
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      product: form.product.trim().toLowerCase(),
      quantity: parseInt(form.quantity, 10) || 0,
      unit: form.unit.trim() || "units",
      threshold: parseInt(form.threshold, 10) || 0,
      reorderQuantity: parseInt(form.reorderQuantity, 10) || 0,
    };

    const url = item ? `/api/inventory/${encodeURIComponent(item.product)}` : "/api/inventory";
    const method = item ? "PUT" : "POST";
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
          {item ? "Edit Item" : "Add Inventory Item"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Product</label>
            <input
              type="text"
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
              required
              disabled={!!item}
              className="w-full px-4 py-2 rounded-lg bg-void border border-border text-gray-200 focus:border-accent focus:outline-none disabled:opacity-60"
              placeholder="milk"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-void border border-border text-gray-200 focus:border-accent focus:outline-none"
                placeholder="12"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Unit</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-void border border-border text-gray-200 focus:border-accent focus:outline-none"
                placeholder="gallons"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Reorder threshold</label>
            <input
              type="number"
              value={form.threshold}
              onChange={(e) => setForm({ ...form, threshold: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-void border border-border text-gray-200 focus:border-accent focus:outline-none"
              placeholder="20"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Reorder quantity</label>
            <input
              type="number"
              value={form.reorderQuantity}
              onChange={(e) => setForm({ ...form, reorderQuantity: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-void border border-border text-gray-200 focus:border-accent focus:outline-none"
              placeholder="50"
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
