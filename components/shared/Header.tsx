// components/shared/Header.tsx
"use client";

import React from "react";
import Image from "next/image";
import { getUser, clearUser, updatePassword } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Header() {
  const router = useRouter();
  const [user, setUserState] = React.useState(getUser());
  const [openChangePass, setOpenChangePass] = React.useState(false);
  const [newPass, setNewPass] = React.useState("");
  const [confirmPass, setConfirmPass] = React.useState("");
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    setUserState(getUser());
  }, []);

  const handleLogout = () => {
    clearUser();
    router.replace("/login");
  };

  const handleChangePassword = () => {
    setErr("");
    if (!newPass || newPass.length < 6) {
      setErr("Password min 6 karakter.");
      return;
    }
    if (newPass !== confirmPass) {
      setErr("Konfirmasi password tidak sama.");
      return;
    }
    updatePassword(newPass);
    setOpenChangePass(false);
    setNewPass("");
    setConfirmPass("");
  };

  return (
    <>
      <div className="w-full flex justify-between items-center px-12 py-5 bg-white relative z-50">
        <div className="w-full">
          <h1 className="text-2xl font-bold">Welcome, {user?.id ?? "Guest"}</h1>
          <p className="text-sm text-[#3A354E] font-medium">
            Monitor all of your projects and tasks here
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full overflow-hidden ring-2 ring-gray-200 hover:ring-gray-300">
              <Image src="/Avatars.png" alt="avatar" width={40} height={40} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">{user?.name ?? "User"}</span>
                <span className="text-xs text-muted-foreground">{user?.email ?? "-"}</span>
                <span className="text-xs mt-1">Role: <b>{user?.role}</b></span>
                <span className="text-xs">ID: <b>{user?.id}</b></span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setOpenChangePass(true)}>
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={openChangePass} onOpenChange={setOpenChangePass}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {err && <div className="text-sm text-rose-600 bg-rose-50 p-2 rounded">{err}</div>}
            <Input
              type="password"
              placeholder="New password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenChangePass(false)}>Cancel</Button>
            <Button onClick={handleChangePassword}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
