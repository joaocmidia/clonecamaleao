import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, UserPlus } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast({
          title: "Conta criada!",
          description: "Você já pode acessar o sistema.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      const msg = error?.message || "Ocorreu um erro. Tente novamente.";
      toast({
        title: "Erro",
        description: msg === "Invalid login credentials"
          ? "Email ou senha incorretos."
          : msg === "User already registered"
          ? "Este email já está cadastrado."
          : msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md shadow-xl border-2 bg-card">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            {mode === "login" ? (
              <LogIn className="w-7 h-7 text-primary" />
            ) : (
              <UserPlus className="w-7 h-7 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {mode === "login" ? "Entrar" : "Criar Conta"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {mode === "login"
              ? "Acesse sua conta para continuar"
              : "Crie sua conta para começar"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-12"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-12"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {mode === "login" ? "Entrando..." : "Criando conta..."}
                </>
              ) : mode === "login" ? (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Entrar
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Criar Conta
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Não tem uma conta?" : "Já tem uma conta?"}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="ml-1 text-primary font-medium hover:underline focus:outline-none"
              >
                {mode === "login" ? "Criar conta" : "Entrar"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
