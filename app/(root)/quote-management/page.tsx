"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Eye, Plus, Search, Pencil } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { quotes as QUOTES, users as USERS } from "@/constants";

type Status = "Approved" | "Pending" | "Rejected";
type StatusFilter = "all" | Status;
type UserFilter = "all" | string;


type Row = (typeof QUOTES)[number] & {
  productName?: string;
  quantity?: number;
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" });

const PAGE_SIZE = 7;

export default function QuoteManagementPage() {
  const [rows, setRows] = React.useState<Row[]>(QUOTES as Row[]);

  // ===== filter & paging =====
  const [search, setSearch] = React.useState("");
  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [user, setUser] = React.useState<UserFilter>("all");
  const [minAmount, setMinAmount] = React.useState<string>("");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => setPage(1), [search, from, to, status, user, minAmount]);

  const filtered = React.useMemo(() => {
    return rows.filter((q) => {
      const s = search.trim().toLowerCase();
      const hitSearch =
        s === "" || q.id.toLowerCase().includes(s) || q.clientName.toLowerCase().includes(s);

      const hitStatus = status === "all" || q.status === status;
      const hitUser = user === "all" || q.userId === user;
      const hitAmount = minAmount === "" || q.amount >= Number(minAmount);

      const hitFrom = from === "" || q.date >= from;
      const hitTo = to === "" || q.date <= to;

      return hitSearch && hitStatus && hitUser && hitAmount && hitFrom && hitTo;
    });
  }, [rows, search, from, to, status, user, minAmount]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const current = filtered.slice(start, start + PAGE_SIZE);


  const [openEdit, setOpenEdit] = React.useState(false);
  const [draft, setDraft] = React.useState<{
    id: string;
    clientName: string;
    contactPerson: string;
    date: string; // YYYY-MM-DD
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
              quantity:
                draft.quantity === "" ? r.quantity : Number(draft.quantity),
            }
          : r
      )
    );
    setOpenEdit(false);
  };

  // ===== modal VIEW (Eye) =====
  const [openView, setOpenView] = React.useState(false);
  const [viewRow, setViewRow] = React.useState<Row | null>(null);

  const onView = (row: Row) => {
    setViewRow(row);
    setOpenView(true);
  };

  const viewTotal = (row: Row | null) => (row ? currency.format(row.amount) : "—");

  return (
    <section className="w-full">
      <div className="mt-10 wrapper rounded-3xl shadow-2xl shadow-black/5 space-y-6 bg-white">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by quoteId or ClientName"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button asChild className="bg-[#2563EB] hover:bg-blue-600">
              <Link href="/create-quote" className="gap-2 flex items-center">
                <Plus className="h-4 w-4" />
                Create a New Quote
              </Link>
            </Button>
          </div>

          {/* filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-5 border-gray-300 border rounded-2xl">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />

            <Select value={status} onValueChange={(v: StatusFilter) => setStatus(v)}>
              <SelectTrigger><SelectValue placeholder="Status (All)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={user} onValueChange={(v: UserFilter) => setUser(v)}>
              <SelectTrigger><SelectValue placeholder="All Users" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {USERS.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="$ 0.00"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>
        </div>

        {/* table */}
        <div className="overflow-hidden">
          <Table>
            <TableHeader className="bg-[#F3F4F6]">
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
              {current.map((q) => (
                <TableRow key={q.id} className="hover:bg-muted/40">
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
              {current.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                    No quotes found with current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-center gap-1 pb-6">
          <Button
            variant="ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹
          </Button>

          {Array.from({ length: pageCount }).slice(0, 5).map((_, i) => {
            const n = i + 1;
            if (pageCount > 5 && n === 4) {
              return (
                <React.Fragment key="dots">
                  <span className="px-2">…</span>
                  <Button
                    variant={page === pageCount ? "default" : "ghost"}
                    onClick={() => setPage(pageCount)}
                  >
                    {pageCount}
                  </Button>
                </React.Fragment>
              );
            }
            if (pageCount > 5 && n > 3) return null;
            return (
              <Button
                key={n}
                variant={page === n ? "default" : "ghost"}
                onClick={() => setPage(n)}
              >
                {n}
              </Button>
            );
          })}

          <Button
            variant="ghost"
            disabled={page >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            ›
          </Button>
        </div>
      </div>

      {/* ===== Modal View (Eye) ===== */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {viewRow ? `Details for ${viewRow.id}` : "Details"}
            </DialogTitle>
          </DialogHeader>

          <div className="rounded-xl border">
            <div className="grid grid-cols-3 gap-0 text-sm">
              <div className="col-span-1 px-4 py-3 text-muted-foreground border-b">Client:</div>
              <div className="col-span-2 px-4 py-3 border-b font-semibold">{viewRow?.clientName ?? "—"}</div>

              <div className="col-span-1 px-4 py-3 text-muted-foreground border-b">Date:</div>
              <div className="col-span-2 px-4 py-3 border-b font-semibold">
                {viewRow ? fmtDate(viewRow.date) : "—"}
              </div>

              <div className="col-span-1 px-4 py-3 text-muted-foreground border-b">Product:</div>
              <div className="col-span-2 px-4 py-3 border-b font-semibold">
                {viewRow?.productName ?? "—"}
              </div>

              <div className="col-span-1 px-4 py-3 text-muted-foreground border-b">Quantity:</div>
              <div className="col-span-2 px-4 py-3 border-b font-semibold">
                {typeof viewRow?.quantity === "number" ? viewRow?.quantity : "—"}
              </div>

              <div className="col-span-1 px-4 py-3 text-muted-foreground">Total:</div>
              <div className="col-span-2 px-4 py-3 font-semibold">
                {viewTotal(viewRow)}
              </div>
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
              <Input className="col-span-3 bg-gray-100" readOnly value={draft.id} />
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Client Name</label>
              <Input
                className="col-span-3"
                value={draft.clientName}
                onChange={(e) => setDraft((d) => ({ ...d, clientName: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Contact Person</label>
              <Input
                className="col-span-3"
                value={draft.contactPerson}
                onChange={(e) => setDraft((d) => ({ ...d, contactPerson: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Date</label>
              <Input
                className="col-span-3"
                type="date"
                value={draft.date}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Amount</label>
              <Input
                className="col-span-3"
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
              <Select
                value={draft.status}
                onValueChange={(v: Status) => setDraft((d) => ({ ...d, status: v }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">User</label>
              <Select
                value={draft.userId}
                onValueChange={(v) => setDraft((d) => ({ ...d, userId: v }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USERS.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Optional fields agar View modal punya data */}
            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Product</label>
              <Input
                className="col-span-3"
                value={draft.productName ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, productName: e.target.value }))}
                placeholder="e.g. Business Card"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <label className="text-right">Quantity</label>
              <Input
                className="col-span-3"
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
