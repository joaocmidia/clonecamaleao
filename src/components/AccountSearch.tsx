import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const WEBHOOK_URL = "https://editor.vexly.com.br/webhook/listar-estrutura";

interface AdSet {
  name: string;
  id: string;
  status: string;
  daily_budget?: string;
}

interface Campaign {
  campaign_name: string;
  campaign_id: string;
  campaign_status: string;
  campaign_objective: string;
  ad_sets: AdSet[];
}

interface AccountSearchProps {
  onSelectAdSet: (adSetId: string) => void;
  token?: string;
}

export function AccountSearch({ onSelectAdSet, token = "" }: AccountSearchProps) {
  const [accountId, setAccountId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!accountId.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira o ID da conta de anúncio.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_id: accountId.trim(),
          token: token,
        }),
      });

      const result = await response.json();

      if (result.data && Array.isArray(result.data)) {
        setCampaigns(result.data);
        // Expand all campaigns by default
        const allCampaignIds = new Set<string>(result.data.map((c: Campaign) => c.campaign_id));
        setExpandedCampaigns(allCampaignIds);
        
        if (result.data.length === 0) {
          toast({
            title: "Nenhuma campanha encontrada",
            description: "Esta conta não possui campanhas ativas ou pausadas.",
            variant: "warning",
          });
        } else {
          toast({
            title: "Campanhas carregadas",
            description: `${result.total_campaigns} campanha(s) encontrada(s).`,
          });
        }
      } else {
        toast({
          title: "Erro ao buscar campanhas",
          description: result.message || "Resposta inesperada do servidor.",
          variant: "destructive",
        });
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
      });
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "ID copiado!",
        description: `ID ${id} copiado para a área de transferência.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o ID.",
        variant: "destructive",
      });
    }
  };

  const toggleCampaign = (campaignId: string) => {
    const newExpanded = new Set(expandedCampaigns);
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
    } else {
      newExpanded.add(campaignId);
    }
    setExpandedCampaigns(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "PAUSED":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
              Buscar Campanhas
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Insira o ID da conta de anúncio para visualizar campanhas e conjuntos
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accountId" className="text-base font-medium">
                ID da Conta de Anúncio
              </Label>
              <div className="flex gap-3">
                <Input
                  id="accountId"
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Ex: 123456789"
                  className="text-lg h-12"
                  disabled={isLoading}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="h-12 px-6 min-w-[140px]"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {hasSearched && !isLoading && campaigns.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Campanhas ({campaigns.length})
            </h2>
            
            {campaigns.map((campaign) => (
              <Card key={campaign.campaign_id} className="border shadow-sm overflow-hidden">
                <Collapsible
                  open={expandedCampaigns.has(campaign.campaign_id)}
                  onOpenChange={() => toggleCampaign(campaign.campaign_id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {expandedCampaigns.has(campaign.campaign_id) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div className="text-left">
                          <p className="font-medium text-foreground">{campaign.campaign_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {campaign.ad_sets.length} conjunto(s) • {campaign.campaign_objective}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.campaign_status)}`}>
                        {campaign.campaign_status}
                      </span>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="border-t bg-muted/20">
                      {campaign.ad_sets.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground text-center">
                          Nenhum conjunto de anúncios nesta campanha
                        </p>
                      ) : (
                        <div className="divide-y">
                          {campaign.ad_sets.map((adSet) => (
                            <div
                              key={adSet.id}
                              className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{adSet.name}</p>
                                <p className="text-sm text-muted-foreground">ID: {adSet.id}</p>
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(adSet.status)}`}>
                                  {adSet.status}
                                </span>
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyId(adSet.id);
                                  }}
                                  title="Copiar ID"
                                >
                                  {copiedId === adSet.id ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                                
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectAdSet(adSet.id);
                                  }}
                                >
                                  Selecionar
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}

        {hasSearched && !isLoading && campaigns.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma campanha encontrada para esta conta.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
