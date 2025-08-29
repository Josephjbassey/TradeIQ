import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";

export default function Page() {
  const [match, params] = useRoute("/page/:slug");
  const slug = params?.slug || "";
  const { data, isLoading, error } = useQuery<any>({ queryKey: ["/api/cms/pages", slug].filter(Boolean) as any, queryFn: async ({ queryKey }) => {
    const res = await fetch(`/api/cms/pages/${slug}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }});

  if (!match) return null;
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load page</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h1>
        {data.body && <p className="text-gray-700 leading-7 whitespace-pre-line">{data.body}</p>}
        {Array.isArray(data.sections) && data.sections.length > 0 && (
          <div className="mt-8 space-y-6">
            {data.sections.map((s: any, i: number) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                {s.title && <h2 className="text-xl font-semibold mb-2">{s.title}</h2>}
                {s.body && <p className="text-gray-700 whitespace-pre-line">{s.body}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
