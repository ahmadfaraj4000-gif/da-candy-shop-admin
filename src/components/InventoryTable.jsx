import { Edit, Trash2 } from "lucide-react";
import { money } from "../lib/format.js";

export default function InventoryTable({ inventory, onEdit, onDelete }) {
  if (inventory === undefined) return <div className="state-card">Loading inventory...</div>;
  if (!inventory.length) return <div className="state-card">No strains match the current filters.</div>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Image</th><th>Name</th><th>Type</th><th>Price</th><th>THC</th><th>CBD</th><th>Potency</th><th>Inventory Quantity</th><th>Featured</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(strain => (
            <tr key={strain._id}>
              <td data-label="Image">
                {strain.image ? <img className="inventory-thumb" src={strain.image} alt={strain.name} /> : <span className="muted">No image</span>}
              </td>
              <td data-label="Name">{strain.name}</td>
              <td data-label="Type">{strain.strainType}</td>
              <td data-label="Price">{money(strain.price)}</td>
              <td data-label="THC">{strain.thc}%</td>
              <td data-label="CBD">{strain.cbd}%</td>
              <td data-label="Potency">{strain.potency}</td>
              <td data-label="Quantity">{strain.quantity}</td>
              <td data-label="Featured">{strain.featured ? "Yes" : "No"}</td>
              <td className="actions">
                <div className="action-group">
                  <button className="icon-button" onClick={() => onEdit(strain)} title="Edit strain"><Edit size={17} /></button>
                  <button className="icon-button danger" onClick={() => onDelete(strain._id)} title="Delete strain"><Trash2 size={17} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
