import React from "react";
import { format } from "date-fns";
import { Tip } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TipCardProps {
  tip: Tip;
}

export function TipCard({ tip }: TipCardProps) {
  const isResolved = tip.status !== "pending";
  const isWon = tip.status === "won";
  const isLost = tip.status === "lost";
  const isVoid = tip.status === "void";

  return (
    <Card className="overflow-hidden border-border/40 transition-colors hover:border-primary/50 group relative">
      {/* Decorative left accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        isWon ? 'bg-green-500' :
        isLost ? 'bg-red-500' :
        isVoid ? 'bg-zinc-500' :
        'bg-primary'
      }`} />

      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          
          {/* Main Info */}
          <div className="flex-1 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono rounded-none text-xs tracking-tight uppercase px-2 py-0.5 border-border bg-secondary/50">
                  {tip.sport}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-tight">
                  {tip.league}
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {format(new Date(tip.matchDate), "MMM dd")}
              </span>
            </div>

            <div className="mb-4">
              <div className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                {tip.homeTeam} vs {tip.awayTeam}
              </div>
            </div>

            <div className="bg-secondary/40 p-3 border border-border/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground mb-1 tracking-widest uppercase">The Pick</div>
                  <div className="font-medium text-sm text-foreground/90 leading-tight">
                    {tip.tipText}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono text-muted-foreground mb-1 tracking-widest uppercase">Odds</div>
                  <div className="font-mono font-bold text-primary">
                    {tip.odds.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            
            {tip.notes && (
              <div className="mt-3 text-xs text-muted-foreground border-l-2 border-border pl-2 py-0.5">
                {tip.notes}
              </div>
            )}
          </div>

          {/* Status/Outcome Area */}
          <div className={`sm:w-32 flex flex-row sm:flex-col items-center justify-center p-4 border-t sm:border-t-0 sm:border-l border-border/40 ${
            isWon ? 'bg-green-500/10' :
            isLost ? 'bg-red-500/10' :
            isVoid ? 'bg-zinc-500/10' :
            'bg-secondary/20'
          }`}>
            <div className="text-center w-full flex sm:flex-col justify-between sm:justify-center items-center gap-2">
              <div className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Status</div>
              <Badge 
                variant="outline" 
                className={`font-mono text-xs rounded-none border px-2 py-0.5 uppercase tracking-wider ${
                  isWon ? 'border-green-500/50 text-green-500 bg-green-500/10' :
                  isLost ? 'border-red-500/50 text-red-500 bg-red-500/10' :
                  isVoid ? 'border-zinc-500/50 text-zinc-400 bg-zinc-500/10' :
                  'border-primary/50 text-primary bg-primary/10'
                }`}
              >
                {tip.status}
              </Badge>
              
              {tip.confidence && (
                <div className="flex gap-0.5 mt-2 opacity-60">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-3 ${i < tip.confidence! ? 'bg-primary' : 'bg-muted'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
