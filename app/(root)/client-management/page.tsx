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
import { Pencil, Trash2, Plus } from "lucide-react";
import { clients as CLIENTS, ClientRow } from "@/constants";

const PAGE_SIZE = 8;

type Mode = "add" | "edit";

export default function ClientManagementPage() {
  // data lokal (mulai dari dummy)
  const [rows, setRows] = React.useState<ClientRow[]>(CLIENTS);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  // modal state
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("add");
  const [draft, setDraft] = React.useState<ClientRow>({
    id: "",
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
  });

  // filtering
  const filtered = React.useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.companyName.toLowerCase().includes(s) ||
        r.contactPerson.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s)
    );
  }, [rows, search]);

  // pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const current = filtered.slice(start, start + PAGE_SIZE);
  React.useEffect(() => setPage(1), [search]); // reset page saat search berubah

  // helpers
  const newId = React.useCallback(() => {
    const n = rows.length + 1;
    return `C-${String(n).padStart(3, "0")}`;
  }, [rows.length]);

  // open Add
  const onAdd = () => {
    setMode("add");
    setDraft({
      id: newId(),
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
    });
    setOpen(true);
  };

  // open Edit
  const onEdit = (r: ClientRow) => {
    setMode("edit");
    setDraft({ ...r });
    setOpen(true);
  };

  // delete (simulasi)
  const onDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // submit modal
  const onSubmit = () => {
    if (!draft.companyName || !draft.contactPerson || !draft.email) {
      // validasi minimal (simple)
      return alert("Please fill Company Name, Contact Person, and Email.");
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

        <div className="bg-white rounded-2xl shadow-black/5 shadow-md  space-y-4">
          <div className="w-full p-4 flex justify-between items-center gap-10">
            <Input
              placeholder="Search by company, contact, or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Button onClick={onAdd} className="gap-2 bg-[#2563EB]">
            <Plus className="h-4 w-4" />
            Add New Client
          </Button>
          </div>

          <div className="bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F3F4F6]">
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {current.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">
                      {r.companyName}
                    </TableCell>
                    <TableCell>{r.contactPerson}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.phone}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit"
                          onClick={() => onEdit(r)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          className="text-rose-600"
                          onClick={() => onDelete(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
                      No clients found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* pagination */}
          <div className="flex items-center justify-center gap-1  p-4">
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
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "Add New Client" : "Edit Client"}
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
              <Label className="text-right">Company</Label>
              <Input
                className="col-span-3"
                value={draft.companyName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, companyName: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">Contact</Label>
              <Input
                className="col-span-3"
                value={draft.contactPerson}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, contactPerson: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">Email</Label>
              <Input
                className="col-span-3"
                type="email"
                value={draft.email}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, email: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">Phone</Label>
              <Input
                className="col-span-3"
                value={draft.phone}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, phone: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit}>
              {mode === "add" ? "Add Client" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
