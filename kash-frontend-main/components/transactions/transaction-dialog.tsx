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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { TransacaoResponseDTO, TransacaoCreateDTO, TipoTransacao } from "@/types"

// Assume-se que você terá um DTO ou tipo para Categoria
// Se não tiver, este é um bom modelo a ser usado.
interface Categoria {
  id: number;
  nome: string;
}

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: TransacaoResponseDTO | null
  onSubmit: (data: TransacaoCreateDTO) => void
  onClose: () => void
  categories: Categoria[]
}

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSubmit,
  onClose,
  categories,
}: TransactionDialogProps) {
  const getInitialFormData = () => ({
    descricao: '',
    valor: '',
    categoriaId: 0,
    tipo: TipoTransacao.Despesa.toString(), // Padrão para despesa
    data: new Date().toISOString().split('T')[0],
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (transaction) {
        // Encontra o ID da categoria com base no nome recebido
        const categoria = categories.find(c => c.nome === transaction.categoriaNome);
        setFormData({
          descricao: transaction.descricao,
          valor: transaction.valor.toString(),
          categoriaId: categoria ? categoria.id : 0,
          tipo: transaction.tipo.toString(),
          data: new Date(transaction.data).toISOString().split('T')[0],
        });
      } else {
        setFormData(getInitialFormData());
      }
      setErrors({});
    }
  }, [transaction, open, categories]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'A descrição é obrigatória';
    }
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      newErrors.valor = 'O valor deve ser maior que 0';
    }
    if (!formData.categoriaId) {
      newErrors.categoriaId = 'A categoria é obrigatória';
    }
    if (!formData.data) {
      newErrors.data = 'A data é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData: TransacaoCreateDTO = {
      descricao: formData.descricao.trim(),
      valor: parseFloat(formData.valor),
      categoriaId: Number(formData.categoriaId),
      tipo: Number(formData.tipo) as TipoTransacao,
      data: new Date(formData.data),
    };
    
    onSubmit(submitData);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar Transação' : 'Adicionar Nova Transação'}
          </DialogTitle>
          <DialogDescription>
            {transaction 
              ? 'Atualize os detalhes da transação abaixo.'
              : 'Insira os detalhes da sua nova transação.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Tipo de Transação</Label>
            <RadioGroup
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={TipoTransacao.Receita.toString()} id="receita" />
                <Label htmlFor="receita" className="text-green-600 font-medium">Receita</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={TipoTransacao.Despesa.toString()} id="despesa" />
                <Label htmlFor="despesa" className="text-red-600 font-medium">Despesa</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              placeholder="Ex: Supermercado, Salário"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className={errors.descricao ? "border-red-500" : ""}
            />
            {errors.descricao && <p className="text-sm text-red-500">{errors.descricao}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor" type="number" step="0.01" placeholder="0,00"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              className={errors.valor ? "border-red-500" : ""}
            />
            {errors.valor && <p className="text-sm text-red-500">{errors.valor}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoriaId">Categoria</Label>
            <Select
              value={formData.categoriaId ? String(formData.categoriaId) : ""}
              onValueChange={(value) => setFormData({ ...formData, categoriaId: Number(value) })}
            >
              <SelectTrigger id="categoriaId" className={errors.categoriaId ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoriaId && <p className="text-sm text-red-500">{errors.categoriaId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data" type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className={errors.data ? "border-red-500" : ""}
            />
            {errors.data && <p className="text-sm text-red-500">{errors.data}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {transaction ? 'Atualizar' : 'Criar'} Transação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}