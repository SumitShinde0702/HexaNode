export default function InventoryList({ inventory, onEdit, onDelete }) {
  if (inventory.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center text-muted">
        No inventory items. Add one to get started.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-surface/50 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/60">
            <th className="text-left py-3 px-4 text-muted font-medium">Product</th>
            <th className="text-left py-3 px-4 text-muted font-medium">Qty</th>
            <th className="text-left py-3 px-4 text-muted font-medium">Threshold</th>
            <th className="text-left py-3 px-4 text-muted font-medium">Reorder</th>
            <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
            <th className="w-20" />
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => {
            const low = item.quantity < item.threshold;
            return (
              <tr
                key={item.product}
                className="border-b border-border/40 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-4 font-medium">{item.product}</td>
                <td className="py-3 px-4 font-mono">{item.quantity} {item.unit}</td>
                <td className="py-3 px-4 font-mono">{item.threshold}</td>
                <td className="py-3 px-4 font-mono">{item.reorderQuantity}</td>
                <td className="py-3 px-4">
                  <span
                    className={
                      "inline-block px-2 py-0.5 rounded-md text-xs " +
                      (low ? "bg-red-500/20 text-red-400" : "bg-accent/15 text-accent")
                    }
                  >
                    {low ? "Low" : "OK"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-xs text-accent hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item.product)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
