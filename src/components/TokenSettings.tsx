import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Key } from "lucide-react";

interface TokenSettingsProps {
  onTokenChange?: (token: string) => void;
}

export function TokenSettings({ onTokenChange }: TokenSettingsProps) {
  const { user } = useAuth();
  const [token, setToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

      onTokenChange?.(token.trim());
      toast({
        title: "Token salvo!",
        description: "Seu token foi salvo com sucesso.",
      });
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

  if (isLoading) return null;

  return (
    <div className="flex items-end gap-2">
      <div className="space-y-1 flex-1 max-w-xs">
        <Label htmlFor="token" className="text-xs flex items-center gap-1">
          <Key className="h-3 w-3" />
          Token da API
        </Label>
        <Input
          id="token"
          type="password"
          placeholder="Cole seu token aqui"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={isSaving}
          className="h-9 text-sm"
        />
      </div>
      <Button
        size="sm"
        onClick={handleSave}
        disabled={isSaving}
        className="h-9"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
