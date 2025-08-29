import Header from "@/components/layout/header";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Profile() {
  const { data: user } = useQuery<any>({ queryKey: ["/api/users/me"] });
  const [draft, setDraft] = useState<any | null>(null);
  useEffect(() => { if (user) setDraft({ firstName: user.firstName, lastName: user.lastName, timeZone: user.timeZone, currency: user.currency }); }, [user]);

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/users/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    }
  });

  if (!draft) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Profile" />
        <main className="flex-1 overflow-y-auto p-6">Loading…</main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Profile" subtitle="Manage your account" />
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="max-w-xl">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">First name</label>
              <Input value={draft.firstName || ""} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Last name</label>
              <Input value={draft.lastName || ""} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Time zone</label>
              <Input value={draft.timeZone || ""} onChange={(e) => setDraft({ ...draft, timeZone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Currency</label>
              <Input value={draft.currency || ""} onChange={(e) => setDraft({ ...draft, currency: e.target.value })} />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
