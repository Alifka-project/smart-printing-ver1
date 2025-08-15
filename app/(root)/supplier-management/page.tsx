"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  materials as INITIALS,
  MaterialRow,
  CostUnit,
  unitLabel,
} from "@/constants";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })
    : "—";

const PAGE_SIZE = 10;
type Mode = "add" | "edit";

export default function SupplierManagementPage() {
  const [rows, setRows] = React.useState<MaterialRow[]>(INITIALS);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  // modal
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("add");
  const [draft, setDraft] = React.useState<MaterialRow>({
    id: "",
    material: "",
    supplier: "",
    cost: 0,
    unit: "per_sheet",
    lastUpdated: new Date().toISOString().slice(0, 10),
  });

  // filter
  const filtered = React.useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.material.toLowerCase().includes(s) ||
        r.supplier.toLowerCase().includes(s)
    );
  }, [rows, search]);

  // pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  React.useEffect(() => setPage(1), [search]);
  const start = (page - 1) * PAGE_SIZE;
  const current = filtered.slice(start, start + PAGE_SIZE);

  // helpers
  const newId = React.useCallback(() => {
    const n = rows.length + 1;
    return `M-${String(n).padStart(3, "0")}`;
  }, [rows.length]);

  const onAdd = () => {
    setMode("add");
    setDraft({
      id: newId(),
      material: "",
      supplier: "",
      cost: 0,
      unit: "per_sheet",
      lastUpdated: new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  };

  const onEdit = (r: MaterialRow) => {
    setMode("edit");
    setDraft({ ...r });
    setOpen(true);
  };

  const onDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const onSubmit = () => {
    if (!draft.material || !draft.supplier) {
      alert("Please fill Material and Supplier.");
      return;
    }
    if (mode === "add") {
      setRows((prev) => [{ ...draft }, ...prev]);
    } else {
      setRows((prev) =>
        prev.map((r) => (r.id === draft.id ? { ...draft } : r))
      );
    }
    setOpen(false);
  };

  return (
    <section className="w-full">
      <div className="wrapper space-y-6">
        <div className="bg-white rounded-2xl shadow-black/5 shadow-md space-y-4">
          <div className="flex w-full justify-between items-center gap-10 p-4">
            <Input
              placeholder="Search by material or supplier"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Button onClick={onAdd} className="gap-2 bg-[#2563EB]">
              <Plus className="h-4 w-4" />
              Create a New Material
            </Button>
          </div>

          <div className="bg-white  overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F3F4F6]">
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {current.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{r.material}</TableCell>
                    <TableCell>{r.supplier}</TableCell>
                    <TableCell className="tabular-nums">
                      {currency.format(r.cost)} {unitLabel(r.unit)}
                    </TableCell>
                    <TableCell>{fmtDate(r.lastUpdated)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          className="text-rose-600"
                          onClick={() => onDelete(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit"
                          onClick={() => onEdit(r)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {current.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-sm text-muted-foreground"
                    >
                      No materials found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* pagination */}
          <div className="flex items-center justify-center gap-1 pt-2 pb-4">
            <Button
              variant="ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </Button>

            {Array.from({ length: Math.min(pageCount, 5) }).map((_, i) => {
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
      </div>

      {/* Modal Add/Edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "Add New Material" : "Edit Material"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">ID</Label>
              <Input
                value={draft.id}
                readOnly
                className="col-span-3 bg-gray-100"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">Material</Label>
              <Input
                className="col-span-3"
                value={draft.material}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, material: e.target.value }))
                }
                placeholder="e.g. Art Paper 300gsm"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">Supplier</Label>
              <Input
                className="col-span-3"
                value={draft.supplier}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, supplier: e.target.value }))
                }
                placeholder="e.g. Paper Source LLC"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">Cost</Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.cost}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      cost: e.target.value === "" ? 0 : Number(e.target.value),
                    }))
                  }
                />
                <Select
                  value={draft.unit}
                  onValueChange={(v: CostUnit) =>
                    setDraft((d) => ({ ...d, unit: v }))
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_sheet">per sheet</SelectItem>
                    <SelectItem value="per_packet">per packet</SelectItem>
                    <SelectItem value="per_kg">per kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">Last Updated</Label>
              <Input
                className="col-span-3"
                type="date"
                value={draft.lastUpdated.slice(0, 10)}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, lastUpdated: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit}>
              {mode === "add" ? "Add Material" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
