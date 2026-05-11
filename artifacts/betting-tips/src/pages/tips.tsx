import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { TipCard } from "@/components/tip-card";
import { useListTips, getListTipsQueryKey, ListTipsStatus } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TipsArchive() {
  const [sport, setSport] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [date, setDate] = useState<string>("");

  const queryParams = {
    ...(sport !== "all" && { sport }),
    ...(status !== "all" && { status: status as ListTipsStatus }),
    ...(date && { date })
  };

  const { data: tips, isLoading } = useListTips(queryParams, {
    query: { queryKey: getListTipsQueryKey(queryParams) }
  });

  const clearFilters = () => {
    setSport("all");
    setStatus("all");
    setDate("");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <h1 className="text-3xl font-bold tracking-tight uppercase font-mono">
            Archive
          </h1>
          
          <div className="flex flex-wrap items-center gap-2">
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger className="w-[140px] font-mono text-xs uppercase tracking-tight h-8">
                <SelectValue placeholder="Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ALL SPORTS</SelectItem>
                <SelectItem value="Football">FOOTBALL</SelectItem>
                <SelectItem value="Basketball">BASKETBALL</SelectItem>
                <SelectItem value="Tennis">TENNIS</SelectItem>
                <SelectItem value="Cricket">CRICKET</SelectItem>
                <SelectItem value="Baseball">BASEBALL</SelectItem>
                <SelectItem value="Hockey">HOCKEY</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px] font-mono text-xs uppercase tracking-tight h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ALL STATUS</SelectItem>
                <SelectItem value="pending">PENDING</SelectItem>
                <SelectItem value="won">WON</SelectItem>
                <SelectItem value="lost">LOST</SelectItem>
                <SelectItem value="void">VOID</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-[150px] font-mono text-xs h-8"
            />

            {(sport !== "all" || status !== "all" || date !== "") && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearFilters}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                title="Clear filters"
              >
                <FilterX className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
             Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-full h-32 bg-secondary/30 animate-pulse rounded-md border border-border/20" />
            ))
          ) : tips && tips.length > 0 ? (
            tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center border border-dashed border-border/50 bg-secondary/10 flex flex-col items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground mb-4" />
              <h3 className="text-lg font-bold font-mono uppercase tracking-tight mb-2">No Results</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
