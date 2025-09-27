"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiService } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, Edit, Trash2 } from 'lucide-react'
import { TransactionDialog } from "@/components/transactions/transaction-dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TransacaoResponseDTO, TransacaoCreateDTO, TransacaoUpdateDTO, TipoTransacao } from "@/types"
import { da } from "date-fns/locale"

// Em uma aplicação real, estes dados viriam de uma chamada à API (ex: apiService.getCategorias())
const mockCategorias = [
  { id: 1, nome: 'Alimentação' },
  { id: 2, nome: 'Transporte' },
  { id: 3, nome: 'Moradia' },
  { id: 4, nome: 'Compras' },
  { id: 5, nome: 'Lazer' },
  { id: 6, nome: 'Contas e Serviços' },
  { id: 7, nome: 'Saúde' },
  { id: 8, nome: 'Educação' },
  { id: 9, nome: 'Salário' },
  { id: 10, nome: 'Investimentos' },
  { id: 11, nome: 'Outros' },
];

export function TransactionsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<TransacaoResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransacaoResponseDTO | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all") // 'all', '1', '2'
  const [categoryFilter, setCategoryFilter] = useState<string>("all") // 'all' ou nome da categoria

  const loadTransactions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await apiService.getTransactions(token);
      if (response.success) {
        // Ordena as transações pela data mais recente
        const sortedTransactions = response.data.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        setTransactions(sortedTransactions);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao carregar transações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [token]);
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const searchMatch = searchTerm ? t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      const typeMatch = typeFilter !== 'all' ? t.tipo.toString() === typeFilter : true;
      const categoryMatch = categoryFilter !== 'all' ? t.categoriaNome === categoryFilter : true;
      return searchMatch && typeMatch && categoryMatch;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter]);

  const handleSubmit = async (data: TransacaoCreateDTO | TransacaoUpdateDTO) => {
    console.log("Data:", data);
    if (editingTransaction) {
      await handleUpdateTransaction(data as TransacaoUpdateDTO);
    } else {
      await handleCreateTransaction(data as TransacaoCreateDTO);
    }
  };

  const handleCreateTransaction = async (transactionData: TransacaoCreateDTO) => {
    if (!token) return;
    try {
      const response = await apiService.createTransaction(token, transactionData);
      if (response.success) {
        toast({ title: "Sucesso", description: "Transação criada com sucesso!" });
        setDialogOpen(false);
        await loadTransactions(); // Recarrega para garantir consistência
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Falha ao criar transação.", variant: "destructive" });
    }
  };

  const handleUpdateTransaction = async (transactionData: TransacaoUpdateDTO) => {
    if (!token || !editingTransaction) return;
    try {
      const response = await apiService.updateTransaction(token, editingTransaction.id, transactionData);
      if (response.success) {
        toast({ title: "Sucesso", description: "Transação atualizada com sucesso!" });
        setDialogOpen(false);
        setEditingTransaction(null);
        await loadTransactions(); // Recarrega para garantir consistência
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Falha ao atualizar transação.", variant: "destructive" });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!token || !confirm('Tem certeza que deseja remover esta transação?')) return;
    try {
      const response = await apiService.deleteTransaction(token, id);
      if (response.success) {
        toast({ title: "Sucesso", description: "Transação removida com sucesso." });
        setTransactions(prev => prev.filter(t => t.id !== id)); // Atualização otimista
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Falha ao remover transação.", variant: "destructive" });
    }
  };

  const openEditDialog = (transaction: TransacaoResponseDTO) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };
  
  const openNewDialog = () => {
    setEditingTransaction(null);
    setDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transações</h2>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas</p>
        </div>
        <Button onClick={openNewDialog}><Plus className="mr-2 h-4 w-4" />Adicionar Transação</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value={TipoTransacao.Receita.toString()}>Receita</SelectItem>
                <SelectItem value={TipoTransacao.Despesa.toString()}>Despesa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {mockCategorias.map(cat => <SelectItem key={cat.id} value={cat.nome}>{cat.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>{filteredTransactions.length} transaç{filteredTransactions.length !== 1 ? 'ões' : 'ão'} encontrada{filteredTransactions.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loading ? (
                <p className="text-center py-8 text-muted-foreground">Carregando transações...</p>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  {transaction.tipo === TipoTransacao.Receita ? 
                    <ArrowUpCircle className="h-6 w-6 text-green-500" /> : 
                    <ArrowDownCircle className="h-6 w-6 text-red-500" />
                  }
                  <div>
                    <p className="font-medium">{transaction.descricao}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{transaction.categoriaNome}</Badge>
                      <span className="text-sm text-muted-foreground">{new Date(transaction.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`font-semibold text-lg ${transaction.tipo === TipoTransacao.Receita ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.tipo === TipoTransacao.Despesa ? '-' : ''}
                    {transaction.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(transaction)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(transaction.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">Nenhuma transação encontrada para os filtros aplicados.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {dialogOpen && (
        <TransactionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          transaction={editingTransaction}
          onSubmit={handleSubmit}
          onClose={() => {
            setDialogOpen(false);
            setEditingTransaction(null);
          }}
          categories={mockCategorias}
        />
      )}
    </div>
  )
}