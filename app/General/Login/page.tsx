'use client';

import React, { useState } from "react";
import { signIn,useSession } from "next-auth/react";
import { useRouter } from "next/navigation"
import { getSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
  
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
  
    if (res?.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
  
    // VERY IMPORTANT: wait for session to be available
    const session = await getSession();
    
    if (!session) {
      setError("Failed to fetch session after login");
      setLoading(false);
      return;
    }
  
    const userRole = session.user?.role;
  
    if (userRole === "admin") {
      router.push("/admin/homepage");
      router.refresh();
    } else if (userRole === "doctor") {
      router.push("/doctor/homepage");
    } else if (userRole == "patient") {
      router.push("/Patient/Homepage");
      router.refresh();
    } else {
      setError("Invalid role");
    }
  
    setLoading(false);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <nav className="bg-white text-black p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            <a href="/">WeCureIt</a>
          </h1>
          <div className="space-x-4">
            <Link href="/general/login" className="hover:underline bg-gray-200 p-2 border rounded-md">
              Login 
            </Link>
            <Link href="/general/register" className="hover:underline bg-black text-white p-2 border rounded-md">
              Register
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white shadow-md rounded-md">
          <h2 className="text-3xl font-bold text-center text-black mb-6">Login</h2>

          {error && <div className="text-red-500 text-center mb-4">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-2 border text-black rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-2 border text-black rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full p-2 bg-black text-white rounded-md"
            >
              Login 
            </button>
          </form>
        </div>
      </main>

      <footer className="p-4 bg-white border-t flex justify-between items-center">
        <div className="text-2xl font-bold">Logo</div>
        <div className="flex space-x-4">
          <span className="text-gray-600">ⓧ</span>
        </div>
      </footer>
    </div>
  );
}