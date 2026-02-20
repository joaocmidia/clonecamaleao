import { useAuth } from "@/hooks/useAuth";
import { TokenSettings } from "@/components/TokenSettings";
import { Button } from "@/components/ui/button";
import { LogOut, Layers } from "lucide-react";

interface NavbarProps {
  onTokenChange: (token: string) => void;
}

export function Navbar({ onTokenChange }: NavbarProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">Clone Camaleão

          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <TokenSettings onTokenChange={onTokenChange} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="sm"
            onClick={signOut}
            className="h-9 gap-1">

              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>);

}