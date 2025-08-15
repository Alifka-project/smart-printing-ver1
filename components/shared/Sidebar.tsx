"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { TerminalSquareIcon } from "lucide-react";
import { getSidebarItems } from "@/constants";
import { getUser } from "@/lib/auth";

const Sidebar = () => {
  const pathname = usePathname();
  const [role, setRole] = React.useState<"admin" | "estimator">("estimator");

  React.useEffect(() => {
    const u = getUser();
    if (u?.role === "admin" || u?.role === "estimator") {
      setRole(u.role);
    }
  }, []);

  const sideBarItems = getSidebarItems(role);

  return (
    <aside className="sticky z-10 top-0 left-0 w-[20rem] bg-white shadow-lg p-3 min-h-screen">
      <div className="mt-4 mb-7 flex flex-row gap-3 items-center">
        <TerminalSquareIcon />
        <h2 className="font-bold text-3xl">Printing</h2>
      </div>
      <div className="p-1 border-gray-300 border-dashed border-t-2 mt-3" />
      <div className="mt-5 flex flex-col gap-2">
        {sideBarItems.map((link) => {
          const isActive = pathname === link.route;
          const IconComponent = link.icons;
          return (
            <Link className="" href={link.route} key={link.label}>
              <div
                className={cn(
                  "flex gap-4 items-center p-4 rounded-lg justify-start",
                  isActive && "bg-[#2563EB] border shadow-sm"
                )}
              >
                {!!IconComponent && (
                  <IconComponent
                    size={20}
                    className={cn(isActive ? "text-white" : "text-gray-600")}
                  />
                )}
                <p className={cn(isActive ? "text-white" : "text-dark")}>
                  {link.label}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;