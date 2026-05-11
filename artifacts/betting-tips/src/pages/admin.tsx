import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { 
  useListTips, 
  getListTipsQueryKey,
  useCreateTip,
  useUpdateTip,
  useDeleteTip,
  TipUpdateStatus
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

export default function Admin() {
  const { data: tips, isLoading } = useListTips({}, {
    query: { queryKey: getListTipsQueryKey() }
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTipMutation = useCreateTip();
  const updateTipMutation = useUpdateTip();
  const deleteTipMutation = useDeleteTip();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    sport: "Football",
    homeTeam: "",
    awayTeam: "",
    league: "",
    tipText: "",
    odds: "",
    confidence: "3",
    matchDate: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTipMutation.mutate({
      data: {
        sport: formData.sport,
        homeTeam: formData.homeTeam,
        awayTeam: formData.awayTeam,
        league: formData.league,
        tipText: formData.tipText,
        odds: parseFloat(formData.odds),
        confidence: parseInt(formData.confidence, 10),
        matchDate: formData.matchDate,
        notes: formData.notes || undefined
      }
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setFormData({
          sport: "Football",
          homeTeam: "",
          awayTeam: "",
          league: "",
          tipText: "",
          odds: "",
          confidence: "3",
          matchDate: new Date().toISOString().split('T')[0],
          notes: ""
        });
        queryClient.invalidateQueries({ queryKey: getListTipsQueryKey() });
        toast({ title: "Tip created successfully" });
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Failed to create tip", description: err.error });
      }
    });
  };

  const handleStatusChange = (id: number, status: TipUpdateStatus) => {
    updateTipMutation.mutate({
      id,
      data: { status }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTipsQueryKey() });
        toast({ title: "Status updated" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this tip?")) {
      deleteTipMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTipsQueryKey() });
          toast({ title: "Tip deleted" });
        }
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <h1 className="text-3xl font-bold tracking-tight uppercase font-mono">
            Admin Panel
          </h1>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="font-mono uppercase tracking-tight">
                <Plus className="w-4 h-4 mr-2" /> New Tip
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-mono uppercase">Post New Tip</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Sport</label>
                    <Select value={formData.sport} onValueChange={(v) => setFormData({...formData, sport: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Football">Football</SelectItem>
                        <SelectItem value="Basketball">Basketball</SelectItem>
                        <SelectItem value="Tennis">Tennis</SelectItem>
                        <SelectItem value="Cricket">Cricket</SelectItem>
                        <SelectItem value="Baseball">Baseball</SelectItem>
                        <SelectItem value="Hockey">Hockey</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-muted-foreground">League</label>
                    <Input required value={formData.league} onChange={(e) => setFormData({...formData, league: e.target.value})} placeholder="e.g. Premier League" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Home Team</label>
                    <Input required value={formData.homeTeam} onChange={(e) => setFormData({...formData, homeTeam: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Away Team</label>
                    <Input required value={formData.awayTeam} onChange={(e) => setFormData({...formData, awayTeam: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-mono uppercase text-muted-foreground">The Pick</label>
                    <Input required value={formData.tipText} onChange={(e) => setFormData({...formData, tipText: e.target.value})} placeholder="e.g. Home Team to Win" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Odds</label>
                    <Input required type="number" step="0.01" min="1.01" value={formData.odds} onChange={(e) => setFormData({...formData, odds: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Confidence (1-5)</label>
                    <Input required type="number" min="1" max="5" value={formData.confidence} onChange={(e) => setFormData({...formData, confidence: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Match Date</label>
                    <Input required type="date" value={formData.matchDate} onChange={(e) => setFormData({...formData, matchDate: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-mono uppercase text-muted-foreground">Notes (Optional)</label>
                    <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Brief analysis..." />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createTipMutation.isPending} className="font-mono uppercase">
                    {createTipMutation.isPending ? "Posting..." : "Post Tip"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border border-border/40 rounded-md bg-secondary/10 overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/40 font-mono text-xs uppercase tracking-wider">
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead>Pick</TableHead>
                <TableHead>Odds</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground font-mono text-xs uppercase">
                    Loading tips...
                  </TableCell>
                </TableRow>
              ) : tips && tips.length > 0 ? (
                tips.map((tip) => (
                  <TableRow key={tip.id} className="hover:bg-secondary/20">
                    <TableCell>
                      <div className="font-medium text-sm">{tip.homeTeam} v {tip.awayTeam}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5 uppercase tracking-wider">{tip.sport} / {tip.league}</div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">{tip.tipText}</TableCell>
                    <TableCell className="font-mono text-primary font-bold">{tip.odds.toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{format(new Date(tip.matchDate), "MMM dd")}</TableCell>
                    <TableCell>
                      <Select 
                        value={tip.status} 
                        onValueChange={(v) => handleStatusChange(tip.id, v as TipUpdateStatus)}
                        disabled={updateTipMutation.isPending}
                      >
                        <SelectTrigger className={`h-7 w-[110px] text-xs font-mono uppercase tracking-wider ${
                          tip.status === 'won' ? 'border-green-500/50 text-green-500 bg-green-500/10' :
                          tip.status === 'lost' ? 'border-red-500/50 text-red-500 bg-red-500/10' :
                          tip.status === 'void' ? 'border-zinc-500/50 text-zinc-400 bg-zinc-500/10' :
                          'border-primary/50 text-primary bg-primary/10'
                        }`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">PENDING</SelectItem>
                          <SelectItem value="won">WON</SelectItem>
                          <SelectItem value="lost">LOST</SelectItem>
                          <SelectItem value="void">VOID</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(tip.id)}
                        disabled={deleteTipMutation.isPending}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground font-mono text-xs uppercase">
                    No tips found in database.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
