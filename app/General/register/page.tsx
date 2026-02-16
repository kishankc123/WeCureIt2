// /app/general/register/page.tsx
'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';


export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // For confirm password field
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // const role = 'patient';
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');

  console.log("Param:", roleParam); // Should log "admin", "doctor", or null

  const role = roleParam === 'admin'
    ? 'admin'
    : roleParam === 'doctor'
      ? 'doctor'
      : 'patient';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Call the registration API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setSuccess(true);
        setError("");
        setTimeout(() => {
          router.push("/general/login");
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError("An error occurred. Please try again later.");
    }
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
          <h2 className="text-3xl font-bold text-center text-black mb-6">Register</h2>

          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          {success && <div className="text-green-500 text-center mb-4">Registration successful! Redirecting to login...</div>}

          <form onSubmit={handleRegister} className="space-y-4">
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
            <div>
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full p-2 border text-black rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full p-2 bg-black text-black text-white rounded-md"
            >
              Register
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
