import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Plan = {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

type PricingData = {
  headline: string;
  subheadline: string;
  plans: Plan[];
  faqs: { q: string; a: string }[];
};

export default function Pricing() {
  const { data, isLoading } = useQuery<PricingData>({
    queryKey: ["/api/cms/pricing"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading pricing…</div>
      </div>
    );
  }

  const pricing = data!;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">{pricing.headline}</h1>
          <p className="text-lg text-gray-600 mt-2">{pricing.subheadline}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricing.plans.map((p) => (
            <Card key={p.id} className={`relative ${p.popular ? "border-blue-500" : ""}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <CardContent className="pt-8">
                <h3 className="text-xl font-semibold text-gray-900">{p.name}</h3>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold">{p.price === 0 ? "Free" : `$${p.price}`}</span>
                  {p.price !== 0 && <span className="text-gray-500 mb-1">/{p.period}</span>}
                </div>

                <ul className="mt-6 space-y-2 text-sm text-gray-700">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button className="mt-6 w-full">{p.cta}</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center">FAQs</h2>
          <div className="mt-6 space-y-4">
            {pricing.faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="font-medium text-gray-900">{f.q}</p>
                <p className="text-gray-600 mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
