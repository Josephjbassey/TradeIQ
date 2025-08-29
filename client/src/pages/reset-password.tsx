import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [location] = useLocation();

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get("token");
    if (t) setToken(t);
  }, [location]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!password || password !== confirm) {
      setMessage("Passwords do not match");
      return;
    }
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password })
    });
    if (res.ok) setMessage("Password updated. You can sign in now.");
    else {
      const j = await res.json().catch(() => ({}));
      setMessage(j.error || "Failed to reset password");
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Reset Password" />
      <main className="flex-1 overflow-y-auto p-6 flex justify-center">
        <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 w-full max-w-md">
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="block text-sm text-gray-600 mb-1">New password</label>
              <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your new password" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Confirm password</label>
              <input type="password" className="w-full border rounded px-3 py-2" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm your new password" required />
            </div>
            {message && <p className="text-sm text-gray-700">{message}</p>}
            <Button type="submit" className="w-full">Update Password</Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
