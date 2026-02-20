import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Settings, Key, Eye, EyeOff, CheckCircle2 } from "lucide-react";

interface TokenSettingsProps {
  onTokenChange?: (token: string) => void;
}

export function TokenSettings({ onTokenChange }: TokenSettingsProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) loadToken();
  }, [user]);

  const loadToken = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("token")
        .eq("user_id", user!.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data?.token) {
        setToken(data.token);
        setHasToken(true);
        onTokenChange?.(data.token);
      }
    } catch (error) {
      console.error("Error loading token:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token.trim()) {
      toast({
        title: "Token vazio",
        description: "Por favor, insira um token válido.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ token: token.trim() })
        .eq("user_id", user!.id);

      if (error) throw error;

      setHasToken(true);
      onTokenChange?.(token.trim());
      toast({
        title: "Token salvo!",
        description: "Seu token foi salvo com sucesso.",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error saving token:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o token. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 gap-2"
        disabled={isLoading}
      >
        <Settings className="h-4 w-4" />
        <span className="hidden sm:block">Configurações</span>
        {hasToken && (
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Configurações
            </DialogTitle>
            <DialogDescription>
              Insira o token da API do Facebook. Ele será enviado automaticamente em todas as requisições.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="token">Token de Acesso</Label>
              <div className="relative">
                <Input
                  id="token"
                  type={showToken ? "text" : "password"}
                  placeholder="Cole seu token aqui..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isSaving}
                  className="h-11 pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                O token é salvo de forma segura e vinculado à sua conta.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
