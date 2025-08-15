"use client";

import * as React from "react";
import {
  seedUsers,
  type AppUser,
  type AppUserRole,
} from "@/constants/dummyusers";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import RoleBadge from "@/components/shared/RoleBadge";
import StatusChip from "@/components/shared/StatusChip";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export default function UserManagementPage() {
  const [users, setUsers] = React.useState<AppUser[]>(seedUsers);

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<AppUserRole>("user");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [active, setActive] = React.useState(true);

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("user");
    setActive(true);
  };

  const addUser = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const newId = `EMP${(Math.random() * 1000 + 1)
      .toFixed(0)
      .padStart(3, "0")}`;
    const joined = new Date().toISOString().slice(0, 10);
    const user: AppUser = {
      id: newId,
      name: name.trim(),
      email: email.trim(),
      joined,
      role,
      status: active ? "Active" : "Inactive",
      // password ini untuk dummy saja, jangan simpan plain text di produksi
      password: password.trim(),
    };
    setUsers((prev) => [user, ...prev]);
    setOpen(false);
    resetForm();
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
          : u
      )
    );
  };

  return (
    <section className="w-full">
      <div className="wrapper space-y-6">
        {/* Header kartu mirip desain */}
        <div className="bg-white rounded-2xl shadow-black/5 shadow-md p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b">
            <h3 className="text-lg font-semibold">User Management</h3>
            <Button className="bg-[#2563EB]" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </div>

          {/* table */}
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-[#F3F4F6]">
                <TableRow>
                  <TableHead className="w-[40%]">User</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-8">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/40">
                    {/* User (nama + email) */}
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-8 w-8 rounded-full bg-slate-200" />
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-slate-500">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Joined */}
                    <TableCell className="text-sm">{fmt(u.joined)}</TableCell>

                    {/* Role badge */}
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>

                    {/* Status text */}
                    <TableCell>
                      <StatusChip value={u.status} />
                    </TableCell>

                    {/* Action switch */}
                    <TableCell className="text-right pr-8">
                      <Switch
                        checked={u.status === "Active"}
                        onCheckedChange={() => toggleStatus(u.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-sm text-muted-foreground"
                    >
                      No users yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* ===== Modal Add New User ===== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs mb-1 block">Full Name</label>
                <Input
                  placeholder="e.g. EMP004"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block">Email</label>
                <Input
                  type="email"
                  placeholder="user@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block">Password</label>
                <Input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div>
                <label className="text-xs mb-1 block">Role</label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as AppUserRole)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="estimator">Estimator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-xs text-slate-500">Status</div>
                  <div className="text-sm">
                    {active ? "Active" : "Inactive"}
                  </div>
                </div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addUser}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
