import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { TipCard } from "@/components/tip-card";
import { 
  useGetTodaysTips, 
  getGetTodaysTipsQueryKey,
  useGetStats,
  getGetStatsQueryKey,
  useSubscribe
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Target, Activity, AlertCircle, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { data: todayTips, isLoading: isLoadingTips } = useGetTodaysTips({
    query: { queryKey: getGetTodaysTipsQueryKey() }
  });

  const { data: stats, isLoading: isLoadingStats } = useGetStats({
    query: { queryKey: getGetStatsQueryKey() }
  });

  const { toast } = useToast();
  const subscribeMutation = useSubscribe();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    subscribeMutation.mutate({
      data: { email, name: name || undefined }
    }, {
      onSuccess: () => {
        setIsSubscribed(true);
      },
      onError: (err: any) => {
        toast({ 
          variant: "destructive", 
          title: "Subscription Failed", 
          description: err?.error || "This email might already be subscribed." 
        });
      }
    });
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Content: Today's Picks */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 uppercase font-mono">
              <span className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              Live Picks
            </h1>
            <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div className="space-y-4">
            {isLoadingTips ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-full h-32 bg-secondary/30 animate-pulse rounded-md border border-border/20" />
              ))
            ) : todayTips && todayTips.length > 0 ? (
              todayTips.map((tip) => (
                <TipCard key={tip.id} tip={tip} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border/50 bg-secondary/10">
                <AlertCircle className="w-10 h-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-bold font-mono uppercase tracking-tight mb-2">No Picks Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  The desk is currently analyzing the slate. Check back shortly for today's selected tips.
                </p>
              </div>
            )}
          </div>

          {/* Subscribe Section */}
          <div className="mt-12 pt-8 border-t border-border/40">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-mono uppercase tracking-tight flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Get daily picks in your inbox
                </CardTitle>
                <CardDescription className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                  The desk's best analysis, delivered every morning.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubscribed ? (
                  <div className="flex items-center gap-3 text-green-500 font-mono uppercase p-4 bg-green-500/10 rounded-md border border-green-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Successfully Subscribed. Welcome to the desk.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                    <Input 
                      required 
                      type="email" 
                      placeholder="EMAIL ADDRESS" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="font-mono bg-background/50"
                    />
                    <Input 
                      placeholder="NAME (OPTIONAL)" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="font-mono bg-background/50 sm:w-48"
                    />
                    <Button type="submit" disabled={subscribeMutation.isPending} className="font-mono uppercase shrink-0">
                      {subscribeMutation.isPending ? "Joining..." : "Subscribe"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar: Stats */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-secondary/20">
            <CardHeader className="pb-3 border-b border-border/40 bg-background/50">
              <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              {isLoadingStats ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : stats ? (
                <>
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-widest">Win Rate</div>
                    <div className="flex items-end gap-2">
                      <div className="text-4xl font-mono font-bold text-primary leading-none">
                        {stats.winRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
                    <div>
                      <div className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-widest">Won</div>
                      <div className="text-xl font-mono font-bold text-green-500">{stats.won}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-widest">Lost</div>
                      <div className="text-xl font-mono font-bold text-red-500">{stats.lost}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/40">
                    <div className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-widest">Total Tips</div>
                    <div className="text-xl font-mono font-bold">{stats.total}</div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>

      </div>
    </Layout>
  );
}
