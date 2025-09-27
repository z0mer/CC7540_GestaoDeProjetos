"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiService } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, TrendingUp, Brain } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProjecaoResultadoDTO, ProjecaoSimulacaoDTO } from "@/types"

export function ProjectionsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  
  // Estado para o resultado da projeção principal
  const [projectionResult, setProjectionResult] = useState<ProjecaoResultadoDTO | null>(null)
  const [loading, setLoading] = useState(true)

  // Estados para a ferramenta de simulação
  const [simulationLoading, setSimulationLoading] = useState(false)
  const [simulationParams, setSimulationParams] = useState({
    valorMensal: '500',
    prazoAnos: '10',
    rentabilidadeAnual: '8',
  })
  const [simulationResult, setSimulationResult] = useState<ProjecaoResultadoDTO | null>(null)

  const loadProjections = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await apiService.getProjections(token);
      if (response.success) {
        setProjectionResult(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao carregar projeções.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjections();
  }, [token]);

  const handleSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSimulationLoading(true);
    setSimulationResult(null);

    try {
      const simData: ProjecaoSimulacaoDTO = {
        valorMensal: parseFloat(simulationParams.valorMensal),
        meses: parseInt(simulationParams.prazoAnos) * 12,
        rentabilidadeAnual: parseFloat(simulationParams.rentabilidadeAnual),
      };

      const response = await apiService.simulateProjection(token, simData);

      if (response.success) {
        setSimulationResult(response.data);
        toast({
          title: "Simulação Concluída",
          description: "Sua projeção financeira foi calculada.",
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Erro na Simulação",
        description: error.message || "Falha ao executar simulação.",
        variant: "destructive",
      });
    } finally {
      setSimulationLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projeções Financeiras</h2>
          <p className="text-muted-foreground">
            Obtenha insights sobre seu futuro financeiro
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Brain className="h-4 w-4" />
          Análise Preditiva
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projeção de Portfólio</CardTitle>
            <CardDescription>
              Análise baseada em seus dados atuais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando projeção...</p>
            ) : projectionResult ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-primary">{projectionResult.descricao}</h4>
                  <p className="text-2xl font-bold mt-2">{projectionResult.resultadoSimulacao}</p>
                </div>
              </div>
            ) : (
              <p>Não foi possível carregar os dados da projeção.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Previsão de Gastos (Exemplo)</CardTitle>
            <CardDescription>
              Análise de seus padrões de gastos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Despesas do Próximo Mês</span>
                <span className="text-lg font-bold">R$ 2.450</span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Insight:</strong> Seus gastos com restaurantes aumentaram.
                  Considere um limite mensal para melhorar a poupança.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulador de Investimentos
          </CardTitle>
          <CardDescription>
            Simule cenários para planejar seu futuro financeiro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSimulation} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="valorMensal">Aporte Mensal (R$)</Label>
                <Input
                  id="valorMensal" type="number" step="100" placeholder="500"
                  value={simulationParams.valorMensal}
                  onChange={(e) => setSimulationParams({ ...simulationParams, valorMensal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prazoAnos">Prazo (Anos)</Label>
                <Select
                  value={simulationParams.prazoAnos}
                  onValueChange={(value) => setSimulationParams({ ...simulationParams, prazoAnos: value })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione o prazo" /></SelectTrigger>
                  <SelectContent>
                    {[1, 3, 5, 10, 15, 20, 30].map(y => <SelectItem key={y} value={y.toString()}>{y} anos</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentabilidadeAnual">Rentabilidade Anual (%)</Label>
                <Input
                  id="rentabilidadeAnual" type="number" step="0.5" placeholder="8.0"
                  value={simulationParams.rentabilidadeAnual}
                  onChange={(e) => setSimulationParams({ ...simulationParams, rentabilidadeAnual: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" disabled={simulationLoading} className="w-full">
              {simulationLoading ? "Calculando..." : "Calcular Projeção"}
            </Button>
          </form>

          {simulationResult && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">{simulationResult.descricao}</h4>
              <p className="text-2xl font-bold text-green-600">{simulationResult.resultadoSimulacao}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}