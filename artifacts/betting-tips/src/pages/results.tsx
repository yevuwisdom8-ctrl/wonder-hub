import React from "react";
import { Layout } from "@/components/layout";
import { TipCard } from "@/components/tip-card";
import { useGetRecentResults, getGetRecentResultsQueryKey } from "@workspace/api-client-react";
import { History } from "lucide-react";

export default function Results() {
  const { data: results, isLoading } = useGetRecentResults({ limit: 50 }, {
    query: { queryKey: getGetRecentResultsQueryKey({ limit: 50 }) }
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 uppercase font-mono">
            <History className="w-6 h-6 text-primary" />
            Recent Results
          </h1>
        </div>

        <div className="space-y-4">
          {isLoading ? (
             Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-full h-32 bg-secondary/30 animate-pulse rounded-md border border-border/20" />
            ))
          ) : results && results.length > 0 ? (
            results.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))
          ) : (
            <div className="py-24 text-center border border-dashed border-border/50 bg-secondary/10">
              <h3 className="text-lg font-bold font-mono uppercase tracking-tight mb-2">No Recent Results</h3>
              <p className="text-sm text-muted-foreground">Results will appear here once pending tips are settled.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
