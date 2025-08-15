"use client";

import React from "react";
import Link from "next/link";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { quotes as QUOTES, users as USERS } from "@/constants";
import {
  CheckCircle2, Clock3, Eye, Pencil, ScrollText, XCircle,
} from "lucide-react";

type Status = "Approved" | "Pending" | "Rejected";
type Row = (typeof QUOTES)[number] & {
  productName?: string;
  quantity?: number;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

export default function DashboardPage() {
  const totals = React.useMemo(() => {
    const total = QUOTES.length;
    const approved = QUOTES.filter((d) => d.status === "Approved").length;
    const pending = QUOTES.filter((d) => d.status === "Pending").length;
    const rejected = QUOTES.filter((d) => d.status === "Rejected").length;
    return { total, approved, pending, rejected };
  }, []);

  const [rows, setRows] = React.useState<Row[]>(QUOTES.slice(0, 5) as Row[]);

  // ===== modal VIEW =====
  const [openView, setOpenView] = React.useState(false);
  const [viewRow, setViewRow] = React.useState<Row | null>(null);
  const onView = (row: Row) => {
    setViewRow(row);
    setOpenView(true);
  };
  const viewTotal = (row: Row | null) => (row ? currency.format(row.amount) : "—");

  // ===== modal EDIT =====
  const [openEdit, setOpenEdit] = React.useState(false);
  const [draft, setDraft] = React.useState<{
    id: string;
    clientName: string;
    contactPerson: string;
    date: string;
    amount: number | "";
    status: Status;
    userId: string;
    productName?: string;
    quantity?: number | "";
  }>({
    id: "",
    clientName: "",
    contactPerson: "",
    date: "",
    amount: "",
    status: "Approved",
    userId: USERS[0]?.id ?? "",
    productName: "",
    quantity: "",
  });

  const onEdit = (id: string) => {
    const q = rows.find((r) => r.id === id);
    if (!q) return;
    setDraft({
      id: q.id,
      clientName: q.clientName,
      contactPerson: q.contactPerson,
      date: q.date,
      amount: q.amount,
      status: q.status,
      userId: q.userId,
      productName: q.productName ?? "",
      quantity: typeof q.quantity === "number" ? q.quantity : "",
    });
    setOpenEdit(true);
  };

  const onSubmitEdit = () => {
    if (!draft.id || !draft.clientName || !draft.contactPerson || !draft.date || draft.amount === "") {
      alert("Please complete all required fields.");
      return;
    }
    setRows((prev): Row[] =>
      prev.map((r) =>
        r.id === draft.id
          ? {
              ...r,
              clientName: draft.clientName,
              contactPerson: draft.contactPerson,
              date: draft.date,
              amount: Number(draft.amount),
              status: draft.status,
              userId: draft.userId,
              productName: draft.productName?.trim() || r.productName,
              quantity: draft.quantity === "" ? r.quantity : Number(draft.quantity),
            }
          : r
      )
    );
    setOpenEdit(false);
  };

  return (
    <section className="w-full">
      <div className="wrapper space-y-8">
        {/* stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Quotes" value={totals.total}   icon={<ScrollText className="h-8 w-8" />} tint="blue" />
          <StatCard title="Approved"     value={totals.approved} icon={<CheckCircle2 className="h-8 w-8" />} tint="green" />
          <StatCard title="Pending"      value={totals.pending}  icon={<Clock3 className="h-8 w-8" />} tint="amber" />
          <StatCard title="Rejected"     value={totals.rejected} icon={<XCircle className="h-8 w-8" />} tint="rose" />
        </div>

        {/* recent quotations (5 rows) */}
        <div className="w-full bg-white rounded-2xl space-y-2 shadow-black/5 shadow-md">
          <div className="px-3 py-5 w-full flex justify-between items-center">
            <h3 className="text-xl font-semibold">Recent Quotations</h3>

            <Button asChild className="bg-[#2563EB] hover:brightness-110">
              <Link href="/quote-management">View More</Link>
            </Button>
          </div>

          <div className="pb-3 w-full overflow-auto">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-[#F3F4F6] sticky top-0 z-10">
                <TableRow>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((q) => (
                  <TableRow key={q.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-medium">{q.id}</TableCell>
                    <TableCell>{q.clientName}</TableCell>
                    <TableCell>{q.contactPerson}</TableCell>
                    <TableCell>{fmtDate(q.date)}</TableCell>
                    <TableCell className="tabular-nums">{currency.format(q.amount)}</TableCell>
                    <TableCell><StatusBadge value={q.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" title="View" onClick={() => onView(q)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit" onClick={() => onEdit(q.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                      No recent quotes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* ===== Modal View ===== */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{viewRow ? `Details for ${viewRow.id}` : "Details"}</DialogTitle>
          </DialogHeader>

          <div className="rounded-xl border">
            <div className="grid grid-cols-3 gap-0 text-sm">
              <div className="col-span-1 px-4 py-3 text-muted-foreground border-b">Client:</div>
              <div className="col-span-2 px-4 py-3 border-b font-semibold">{viewRow?.clientName ?? "—"}</div>

              <div className="col-span-1 px-4 py-3 text-muted-foreground border-b">Date:</div>
              <div className="col-span-2 px-4 py-3 border-b font-semibold">{viewRow ? fmtDate(viewRow.date) : "—"}</div>

              <div className="col-span-1 px-4 py-3 text-muted-foreground border-b">Product:</div>
              <div className="col-span-2 px-4 py-3 border-b font-semibold">{viewRow?.productName ?? "—"}</div>

              <div className="col-span-1 px-4 py-3 text-muted-foreground border-b">Quantity:</div>
              <div className="col-span-2 px-4 py-3 border-b font-semibold">
                {typeof viewRow?.quantity === "number" ? viewRow?.quantity : "—"}
              </div>

              <div className="col-span-1 px-4 py-3 text-muted-foreground">Total:</div>
              <div className="col-span-2 px-4 py-3 font-semibold">{viewTotal(viewRow)}</div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpenView(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Modal Edit ===== */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Edit Quote</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right text-sm text-muted-foreground">Quote ID</label>
              <input className="col-span-3 bg-gray-100 rounded-md px-3 py-2 text-sm" readOnly value={draft.id} />
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Client Name</label>
              <input
                className="col-span-3 rounded-md border px-3 py-2 text-sm"
                value={draft.clientName}
                onChange={(e) => setDraft((d) => ({ ...d, clientName: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Contact Person</label>
              <input
                className="col-span-3 rounded-md border px-3 py-2 text-sm"
                value={draft.contactPerson}
                onChange={(e) => setDraft((d) => ({ ...d, contactPerson: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Date</label>
              <input
                className="col-span-3 rounded-md border px-3 py-2 text-sm"
                type="date"
                value={draft.date}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Amount</label>
              <input
                className="col-span-3 rounded-md border px-3 py-2 text-sm"
                type="number"
                min={0}
                step="0.01"
                value={draft.amount}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, amount: e.target.value === "" ? "" : Number(e.target.value) }))
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Status</label>
              <select
                className="col-span-3 rounded-md border px-3 py-2 text-sm"
                value={draft.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as Status }))}
              >
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">User</label>
              <select
                className="col-span-3 rounded-md border px-3 py-2 text-sm"
                value={draft.userId}
                onChange={(e) => setDraft((d) => ({ ...d, userId: e.target.value }))}
              >
                {USERS.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Optional untuk modal View */}
            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Product</label>
              <input
                className="col-span-3 rounded-md border px-3 py-2 text-sm"
                value={draft.productName ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, productName: e.target.value }))}
                placeholder="e.g. Business Card"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Quantity</label>
              <input
                className="col-span-3 rounded-md border px-3 py-2 text-sm"
                type="number"
                min={0}
                value={draft.quantity ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, quantity: e.target.value === "" ? "" : Number(e.target.value) }))
                }
                placeholder="e.g. 1000"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenEdit(false)}>Cancel</Button>
            <Button onClick={onSubmitEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
