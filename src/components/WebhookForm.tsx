import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_QUANTITIES = [49, 100, 200, 250];
const WEBHOOK_URL = "https://editor.vexly.com.br/webhook/4c7618c6-fee9-44c3-8cd4-ddc39fde9e54";

const WebhookForm = () => {
  const [conjuntoId, setConjuntoId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePresetClick = (value: number) => {
    setQuantity(value.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!conjuntoId.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o ID do Conjunto.",
        variant: "destructive",
      });
      return;
    }

    if (!quantity.trim() || parseInt(quantity) <= 0) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe uma quantidade válida.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conjunto_id: conjuntoId,
          quantidade: parseInt(quantity),
          timestamp: new Date().toISOString(),
        }),
      });

      const result = await response.text();
      
      if (result.toLowerCase().includes("success") || response.ok) {
        toast({
          title: "Sucesso!",
          description: result || "Conjuntos duplicados com sucesso.",
        });
        // Reset form
        setConjuntoId("");
        setQuantity("");
      } else {
        toast({
          title: "Falha",
          description: result || "Ocorreu um erro ao duplicar os conjuntos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Webhook error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl border-0 bg-card">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Copy className="w-7 h-7 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Duplicar Conjuntos</CardTitle>
        <CardDescription className="text-muted-foreground">
          Preencha os dados abaixo para duplicar os conjuntos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="conjuntoId" className="text-sm font-medium">
              ID do Conjunto
            </Label>
            <Input
              id="conjuntoId"
              type="text"
              placeholder="Digite o ID do conjunto"
              value={conjuntoId}
              onChange={(e) => setConjuntoId(e.target.value)}
              disabled={isLoading}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Quantidade de cópias
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Digite a quantidade"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isLoading}
              className="h-14 text-2xl font-bold text-center"
            />
            <div className="grid grid-cols-4 gap-2">
              {PRESET_QUANTITIES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  disabled={isLoading}
                  className={cn(
                    "quantity-card",
                    quantity === preset.toString() && "quantity-card-active"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Copy className="mr-2 h-5 w-5" />
                Duplicar Conjuntos
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WebhookForm;
