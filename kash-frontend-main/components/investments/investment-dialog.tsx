"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InvestimentoResponseDTO, InvestimentoCreateDTO, TipoInvestimento } from "@/types"

// Helper para mapear o enum para opções do Select
const tiposDeInvestimento = [
  { value: TipoInvestimento.Acao, label: 'Ação' },
  { value: TipoInvestimento.ETF, label: 'ETF' },
  { value: TipoInvestimento.FundoImobiliario, label: 'Fundo Imobiliário' },
  { value: TipoInvestimento.CDB, label: 'CDB' },
  { value: TipoInvestimento.TesouroDireto, label: 'Tesouro Direto' },
  { value: TipoInvestimento.CriptoMoeda, label: 'Criptomoeda' },
  { value: TipoInvestimento.Outro, label: 'Outro' }
];

interface InvestmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investment?: InvestimentoResponseDTO | null
  onSubmit: (data: InvestimentoCreateDTO) => void
  onClose: () => void
}

export function InvestmentDialog({
  open,
  onOpenChange,
  investment,
  onSubmit,
  onClose,
}: InvestmentDialogProps) {
  const initialState = {
    nome: '',
    tipo: '',
    valorTotal: '',
    quantidade: '',
    dataInicio: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (investment) {
        setFormData({
          nome: investment.nome,
          tipo: investment.tipo.toString(),
          valorTotal: investment.valorTotal.toString(),
          quantidade: investment.quantidade.toString(),
          dataInicio: new Date(investment.dataInicio).toISOString().split('T')[0],
        });
      } else {
        setFormData(initialState);
      }
      setErrors({});
    }
  }, [investment, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'O nome do investimento é obrigatório';
    }

    if (formData.tipo === '') {
      newErrors.tipo = 'O tipo de investimento é obrigatório';
    }

    if (!formData.valorTotal || parseFloat(formData.valorTotal) <= 0) {
      newErrors.valorTotal = 'O valor total deve ser maior que 0';
    }

    if (!formData.quantidade || parseFloat(formData.quantidade) <= 0) {
      newErrors.quantidade = 'A quantidade deve ser maior que 0';
    }

    if (!formData.dataInicio) {
      newErrors.dataInicio = 'A data da compra é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      nome: formData.nome.trim(),
      tipo: Number(formData.tipo), // Converte a string do select para o número do enum
      valorTotal: parseFloat(formData.valorTotal),
      quantidade: parseFloat(formData.quantidade),
      dataInicio: new Date(formData.dataInicio),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {investment ? 'Editar Investimento' : 'Adicionar Novo Investimento'}
          </DialogTitle>
          <DialogDescription>
            {investment 
              ? 'Atualize os detalhes do investimento abaixo.'
              : 'Insira os detalhes para o seu novo investimento.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Investimento</Label>
            <Input
              id="nome"
              placeholder="Ex: Apple Inc. (AAPL)"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className={errors.nome ? "border-red-500" : ""}
            />
            {errors.nome && (
              <p className="text-sm text-red-500">{errors.nome}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Investimento</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger id="tipo" className={errors.tipo ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposDeInvestimento.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value.toString()}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipo && (
              <p className="text-sm text-red-500">{errors.tipo}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorTotal">Valor Investido</Label>
            <Input
              id="valorTotal"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.valorTotal}
              onChange={(e) => setFormData({ ...formData, valorTotal: e.target.value })}
              className={errors.valorTotal ? "border-red-500" : ""}
            />
            {errors.valorTotal && (
              <p className="text-sm text-red-500">{errors.valorTotal}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade / Cotas</Label>
            <Input
              id="quantidade"
              type="number"
              step="0.01"
              placeholder="0"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
              className={errors.quantidade ? "border-red-500" : ""}
            />
            {errors.quantidade && (
              <p className="text-sm text-red-500">{errors.quantidade}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data da Compra</Label>
            <Input
              id="dataInicio"
              type="date"
              value={formData.dataInicio}
              onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
              className={errors.dataInicio ? "border-red-500" : ""}
            />
            {errors.dataInicio && (
              <p className="text-sm text-red-500">{errors.dataInicio}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {investment ? 'Atualizar' : 'Adicionar'} Investimento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}