import { Eye, Trash2 } from "lucide-react";
import { money } from "../lib/format.js";

const statuses = ["Pending", "Ready", "Completed", "Cancelled"];

export default function OrderTable({ orders, onView, onStatus, onDelete }) {
  if (orders === undefined) return <div className="state-card">Loading orders...</div>;
  if (!orders.length) return <div className="state-card">No orders match the current filters.</div>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Order Number</th><th>Customer Name</th><th>Phone</th><th>Pickup Date</th><th>Pickup Time</th><th>Products Ordered</th><th>Quantities</th><th>Promo</th><th>Total</th><th>Payment</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td data-label="Order">{order.orderNumber}</td>
              <td data-label="Customer">{order.customerName}</td>
              <td data-label="Phone">{order.phone}</td>
              <td data-label="Pickup Date">{order.pickupDate}</td>
              <td data-label="Pickup Time">{order.pickupTime}</td>
              <td data-label="Products">{order.items?.map(item => item.name).join(", ")}</td>
              <td data-label="Quantities">{order.items?.map(item => item.quantity).join(", ")}</td>
              <td data-label="Promo">{order.promo?.label || "-"}</td>
              <td data-label="Total">{money(order.total)}</td>
              <td data-label="Payment">
                <span className={`payment-status ${order.paymentStatus || "pending"}`}>
                  {order.paymentMethod === "stripe" ? "Online" : "Store"} - {order.paymentStatus || "pending"}
                </span>
              </td>
              <td data-label="Status">
                <select value={order.status} onChange={event => onStatus(order._id, event.target.value)}>
                  {statuses.map(status => <option key={status}>{status}</option>)}
                </select>
              </td>
              <td className="actions">
                <div className="action-group">
                  <button className="icon-button" onClick={() => onView(order)} title="View order"><Eye size={17} /></button>
                  <button className="icon-button danger" onClick={() => onDelete(order)} title="Delete order"><Trash2 size={17} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
