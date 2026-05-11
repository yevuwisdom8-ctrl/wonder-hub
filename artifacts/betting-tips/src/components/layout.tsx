import React from "react";
import { Link, useLocation } from "wouter";
import { 
  TrendingUp, 
  History, 
  Settings, 
  BarChart3
} from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navigation = [
    { name: "Today's Tips", href: "/", icon: TrendingUp },
    { name: "Archive", href: "/tips", icon: BarChart3 },
    { name: "Results", href: "/results", icon: History },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground dark selection:bg-primary/30 font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-mono font-bold text-xl tracking-tighter">
              <span className="text-primary">TIP</span>MASTER
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-mono tracking-tight transition-colors hover:text-primary ${
                    location === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-mono font-bold transition-colors ${
                location === "/admin" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ADMIN</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
