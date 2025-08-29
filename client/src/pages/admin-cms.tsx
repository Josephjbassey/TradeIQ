import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PricingData = {
  headline: string;
  subheadline: string;
  plans: { id: string; name: string; price: number; period: string; features: string[]; cta: string; popular?: boolean }[];
  faqs: { q: string; a: string }[];
};

export default function AdminCMS() {
  const qc = useQueryClient();
  const [token, setToken] = useState<string>("");
  const { data } = useQuery<PricingData>({ queryKey: ["/api/cms/pricing"] });
  const [draft, setDraft] = useState<PricingData | null>(null);

  useEffect(() => {
    if (data) setDraft(JSON.parse(JSON.stringify(data)));
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!draft) return;
      const res = await fetch(`/api/cms/pricing`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/cms/pricing"] }),
  });

  if (!draft) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Admin Token</label>
              <Input value={token} placeholder="Enter ADMIN_TOKEN" onChange={(e) => setToken(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Headline</label>
              <Input value={draft.headline} onChange={(e) => setDraft({ ...draft, headline: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Subheadline</label>
              <Textarea value={draft.subheadline} onChange={(e) => setDraft({ ...draft, subheadline: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold">Plans</h2>
            {draft.plans.map((p, idx) => (
              <div key={p.id} className="grid md:grid-cols-3 gap-3 border p-3 rounded">
                <Input value={p.name} onChange={(e) => {
                  const plans = [...draft.plans];
                  plans[idx] = { ...p, name: e.target.value };
                  setDraft({ ...draft, plans });
                }} />
                <Input type="number" value={p.price} onChange={(e) => {
                  const plans = [...draft.plans];
                  plans[idx] = { ...p, price: Number(e.target.value) };
                  setDraft({ ...draft, plans });
                }} />
                <Input value={p.period} onChange={(e) => {
                  const plans = [...draft.plans];
                  plans[idx] = { ...p, period: e.target.value };
                  setDraft({ ...draft, plans });
                }} />
                <Textarea className="md:col-span-3" value={p.features.join("\n")} onChange={(e) => {
                  const plans = [...draft.plans];
                  plans[idx] = { ...p, features: e.target.value.split("\n").filter(Boolean) };
                  setDraft({ ...draft, plans });
                }} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <h2 className="text-lg font-semibold">FAQs</h2>
            {draft.faqs.map((f, idx) => (
              <div key={idx} className="grid md:grid-cols-2 gap-3">
                <Input value={f.q} onChange={(e) => {
                  const faqs = [...draft.faqs];
                  faqs[idx] = { ...f, q: e.target.value };
                  setDraft({ ...draft, faqs });
                }} />
                <Input value={f.a} onChange={(e) => {
                  const faqs = [...draft.faqs];
                  faqs[idx] = { ...f, a: e.target.value };
                  setDraft({ ...draft, faqs });
                }} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
        </div>
      </div>
    </div>
  );
}
