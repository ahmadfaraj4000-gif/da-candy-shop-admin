import { CreditCard, LogOut, Package, ShoppingBag } from "lucide-react";

export default function Navbar({ activeTab, onTabChange, onLogout }) {
  return (
    <header className="admin-nav">
      <div className="admin-brand">
        <img src={`${import.meta.env.BASE_URL}da-candy-shop-logo.png`} alt="Da Candy Shop" />
        <strong>Admin</strong>
      </div>
      <nav className="tab-list">
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => onTabChange("orders")}>
          <ShoppingBag size={18} /> Orders
        </button>
        <button className={activeTab === "inventory" ? "active" : ""} onClick={() => onTabChange("inventory")}>
          <Package size={18} /> Inventory
        </button>
        <button className={activeTab === "payments" ? "active" : ""} onClick={() => onTabChange("payments")}>
          <CreditCard size={18} /> QR Payments
        </button>
      </nav>
      <button className="icon-button" onClick={onLogout} title="Log out"><LogOut size={18} /></button>
    </header>
  );
}
