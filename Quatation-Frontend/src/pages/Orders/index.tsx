// src/pages/Orders/index.tsx

import { useEffect, useState, useCallback } from "react";
import {
  ClipboardList,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ConfirmModal,
  PageHeader,
  StatPill,
  EmptyState,
  ErrorBanner,
} from "../../components/ui";
import { orderService, type Order } from "../../services/orderService";
import { useAuthStore } from "../../store/authStore";
import { useSettingsStore } from "../../store/settingsStore";
import OrderDetailModal from "./OrderDetailModal";

function StatusBadge({ status }: { status: "draft" | "saved" }) {
  return (
    <span
      className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full w-fit"
      style={{
        background: status === "saved" ? "#e6f9f0" : "#fff3e0",
        color: status === "saved" ? "#0f8050" : "#f28c1a",
      }}
    >
      {status === "saved" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
      {status === "saved" ? "Saved" : "Draft"}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

export default function OrdersPage() {
  const role = useAuthStore((s) => s.user?.role);
  const settingsCompany = useSettingsStore((s) => s.company);
  const settingsQuotation = useSettingsStore((s) => s.quotation);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "draft" | "saved">("");
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setOrders(data);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await orderService.remove(deleteTarget._id);
      setOrders((o) => o.filter((x) => x._id !== deleteTarget._id));
      toast.success(`Order ${deleteTarget.quotationNumber} deleted.`);
      if (detailOrder?._id === deleteTarget._id) setDetailOrder(null);
    } catch {
      toast.error("Failed to delete order.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function handleStatusChanged(updated: Order) {
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    setDetailOrder(updated);
  }

  const customerName = (o: Order) =>
    (o.customerDetails ?? []).find((d) =>
      d.label.toLowerCase().includes("name"),
    )?.value ?? "—";

  return (
    <>
      <div className="flex flex-col gap-7 px-1 pb-10">
        {/* Header */}
        <PageHeader
          title="Orders"
          subtitle="View and manage all saved quotations."
          actions={
            <StatPill icon={ClipboardList} label={`${orders.length} Orders`} />
          }
        />

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-2 flex-1 min-w-52 h-10 px-3.5 rounded-md border transition-[border-color,box-shadow] duration-150 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(112,69,247,0.14)]"
            style={{
              background: "var(--color-bg-input)",
              borderColor: "var(--color-border)",
            }}
          >
            <Search
              size={15}
              style={{ color: "var(--color-text-muted)" }}
              className="shrink-0"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by quotation number or customer…"
              className="flex-1 text-[13px] outline-none border-none bg-transparent"
              style={{ color: "var(--color-text-main)" }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "" | "draft" | "saved")
            }
            className="h-10 px-3.5 rounded-md border text-[13px] outline-none cursor-pointer"
            style={{
              background: "var(--color-bg-input)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-main)",
            }}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="saved">Saved</option>
          </select>
          <button
            onClick={load}
            className="h-10 w-10 flex items-center justify-center rounded-md border cursor-pointer transition-colors duration-150 hover:bg-(--color-bg-hover)"
            style={{
              background: "var(--color-bg-card)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Error */}
        {error && <ErrorBanner message={error} onRetry={load} />}

        {/* Table */}
        <section
          className="rounded-lg overflow-hidden"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border-light)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          {/* Column headers */}
          <div
            className="hidden md:grid px-6 h-11 text-[11px] font-semibold uppercase tracking-wider items-center"
            style={{
              gridTemplateColumns: "160px 1fr 100px 120px 120px 60px",
              background: "var(--color-bg-input)",
              borderBottom: "1px solid var(--color-border-light)",
              color: "#9ca3af",
            }}
          >
            <span>Quotation #</span>
            <span>Customer</span>
            <span>Items</span>
            <span>Total</span>
            <span>Date</span>
            <span></span>
          </div>

          {/* Loading skeleton */}
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 md:px-6 h-16 border-b"
                style={{ borderColor: "var(--color-border-light)" }}
              >
                <div className="skeleton h-4 w-28" />
                <div className="skeleton h-4 flex-1 max-w-40" />
                <div className="skeleton h-4 w-16 hidden md:block" />
                <div className="skeleton h-4 w-20 ml-auto" />
              </div>
            ))}

          {/* Empty */}
          {!loading && orders.length === 0 && (
            <EmptyState
              icon={ClipboardList}
              title="No orders yet"
              description="Save a draft from the Sales Panel and it will appear here."
              bordered={false}
            />
          )}

          {/* Rows */}
          {!loading &&
            orders.map((order, idx) => (
              <div
                key={order._id}
                onClick={() => setDetailOrder(order)}
                className="cursor-pointer transition-colors duration-100 hover:bg-(--color-bg-hover)"
                style={{
                  borderBottom:
                    idx < orders.length - 1
                      ? "1px solid var(--color-border-light)"
                      : "none",
                }}
              >
                {/* ── Desktop grid row ── */}
                <div
                  className="hidden md:grid px-6 py-3 items-center"
                  style={{
                    gridTemplateColumns: "160px 1fr 100px 120px 120px 60px",
                  }}
                >
                  <div>
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {order.quotationNumber}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-[14px] font-medium truncate"
                      style={{ color: "var(--color-text-main)" }}
                    >
                      {customerName(order)}
                    </p>
                    <p
                      className="text-[12px] truncate"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      by{" "}
                      {typeof order.createdBy === "object"
                        ? order.createdBy.name
                        : "—"}
                    </p>
                  </div>
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {(order.lineItems ?? []).length} items
                  </span>
                  <span
                    className="text-[14px] font-semibold"
                    style={{ color: "var(--color-text-main)" }}
                  >
                    {formatCurrency(order.total)}
                  </span>
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {formatDate(order.createdAt)}
                  </span>
                  <div
                    className="flex justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {role === "admin" && (
                      <button
                        onClick={() => setDeleteTarget(order)}
                        className="w-8 h-8 flex items-center justify-center rounded-md border cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-150"
                        style={{
                          background: "var(--color-danger-light)",
                          borderColor: "#fca5a5",
                          color: "var(--color-danger)",
                        }}
                        title="Delete order"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Mobile card row ── */}
                <div className="md:hidden flex flex-col gap-2 px-4 py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {order.quotationNumber}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p
                    className="text-[14px] font-medium truncate"
                    style={{ color: "var(--color-text-main)" }}
                  >
                    {customerName(order)}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[12px]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {(order.lineItems ?? []).length} items ·{" "}
                      {formatDate(order.createdAt)}
                    </span>
                    <span
                      className="text-[14px] font-bold"
                      style={{ color: "var(--color-text-main)" }}
                    >
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  {role === "admin" && (
                    <div
                      className="flex justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setDeleteTarget(order)}
                        className="flex items-center gap-1.5 text-[12px] font-semibold px-3 h-8 rounded-md border cursor-pointer"
                        style={{
                          background: "var(--color-danger-light)",
                          borderColor: "#fca5a5",
                          color: "var(--color-danger)",
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </section>
      </div>

      {/* Order detail modal */}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          settings={{ company: settingsCompany, quotation: settingsQuotation }}
          onClose={() => setDetailOrder(null)}
          onStatusChanged={handleStatusChanged}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Order"
        description={`Are you sure you want to permanently delete quotation "${deleteTarget?.quotationNumber}"?`}
        highlight={deleteTarget?.quotationNumber}
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
      />
    </>
  );
}
