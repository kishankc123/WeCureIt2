'use client';

import { SessionProvider, useSession } from "next-auth/react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function Header() {
  return (
    <SessionProvider>
      <HeaderContent />
    </SessionProvider>
  );
}

function HeaderContent() {
  const { data: session } = useSession();

  const getDashboardLink = () => {
    const role = session?.user?.role;
    if (role === "admin") return "/admin/homepage";
    if (role === "doctor") return "/doctor/homepage";
    if (role === "patient") return "/patient/homepage";
    return null;
  };

  const dashboardLink = getDashboardLink();

  return (
    <nav className="bg-white text-black p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link href="/">WeCureIt</Link>
        </h1>
        <div className="flex items-center gap-4">
          {dashboardLink && (
            <Link href={dashboardLink} className="hover:underline">
             Home
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/general/login" })}
            className="hover:underline bg-black text-white p-2 border rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
