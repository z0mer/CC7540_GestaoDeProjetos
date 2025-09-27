"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiService } from "@/services/api" // Verifique se o caminho do serviço está correto
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, Edit, Trash2 } from 'lucide-react'
import { InvestmentDialog } from "@/components/investments/investment-dialog" // Verifique se o caminho do componente está correto
import { useToast } from "@/components/ui/use-toast"
import { InvestimentoResponseDTO, InvestimentoCreateDTO, InvestimentoUpdateDTO, TipoInvestimento } from "@/types"

// Mapeamento para exibir o nome do tipo de investimento
const tipoInvestimentoLabels: Record<number, string> = {
  [TipoInvestimento.Acao]: 'Ação',
  [TipoInvestimento.ETF]: 'ETF',
  [TipoInvestimento.FundoImobiliario]: 'Fundo Imobiliário',
  [TipoInvestimento.CDB]: 'CDB',
  [TipoInvestimento.TesouroDireto]: 'Tesouro Direto',
  [TipoInvestimento.CriptoMoeda]: 'Criptomoeda',
  [TipoInvestimento.Outro]: 'Outro'
};

export function InvestmentsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [investments, setInvestments] = useState<InvestimentoResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<InvestimentoResponseDTO | null>(null)

  const loadInvestments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await apiService.getInvestments(token);
      if (response.success) {
        setInvestments(response.data);
      } else {
        toast({
          title: "Erro",
          description: response.message || "Falha ao carregar investimentos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro de rede. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, [token]);

  const handleSubmit = async (data: InvestimentoCreateDTO | InvestimentoUpdateDTO) => {
    if (editingInvestment) {
      await handleUpdateInvestment(data as InvestimentoUpdateDTO);
    } else {
      await handleCreateInvestment(data as InvestimentoCreateDTO);
    }
  };

  const handleCreateInvestment = async (investmentData: InvestimentoCreateDTO) => {
    if (!token) return;
    try {
      const response = await apiService.createInvestment(token, investmentData);
      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Investimento adicionado com sucesso!",
        });
        setDialogOpen(false);
        setEditingInvestment(null);
        await loadInvestments(); // Recarrega a lista para incluir o novo item
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao adicionar investimento.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateInvestment = async (investmentData: InvestimentoUpdateDTO) => {
    if (!token || !editingInvestment) return;
    try {
      const response = await apiService.updateInvestment(token, editingInvestment.id, investmentData);
      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Investimento atualizado com sucesso!",
        });
        setDialogOpen(false);
        setEditingInvestment(null);
        await loadInvestments(); 
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar investimento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    if (!token || !confirm("Tem certeza que deseja remover este investimento?")) return;
    try {
      const response = await apiService.deleteInvestment(token, id);
      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Investimento removido com sucesso.",
        });
        // Atualização otimista da UI
        setInvestments(investments.filter(inv => inv.id !== id));
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao remover investimento.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (investment: InvestimentoResponseDTO) => {
    setEditingInvestment(investment);
    setDialogOpen(true);
  };
  
  const openNewDialog = () => {
    setEditingInvestment(null);
    setDialogOpen(true);
  };

  const totalPortfolioValue = investments.reduce((sum, inv) => sum + inv.valorTotal, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investimentos</h2>
          <p className="text-muted-foreground">
            Acompanhe o desempenho do seu portfólio de investimentos
          </p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Investimento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total do Portfólio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPortfolioValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor atual do seu portfólio
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus Investimentos</CardTitle>
          <CardDescription>
            {investments.length} investimento{investments.length !== 1 ? 's' : ''} em seu portfólio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Carregando...</p>
            ) : investments.length > 0 ? (
              investments.map((investment) => (
                <div
                  key={investment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{investment.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{tipoInvestimentoLabels[investment.tipo] || 'Desconhecido'}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {investment.quantidade} cotas
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium text-lg">
                        {investment.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(investment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteInvestment(investment.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum investimento encontrado. Adicione seu primeiro para começar.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {dialogOpen && (
        <InvestmentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          investment={editingInvestment}
          onSubmit={handleSubmit}
          onClose={() => {
            setDialogOpen(false);
            setEditingInvestment(null);
          }}
        />
      )}
    </div>
  )
}