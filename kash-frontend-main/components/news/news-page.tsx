"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiService } from "@/services/api" // Verifique o caminho
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink, Calendar, TrendingUp } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { NoticiaDTO } from "@/types"

export function NewsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [news, setNews] = useState<NoticiaDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const loadInitialNews = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await apiService.getNews(token);
      if (response.success) {
        setNews(response.data);
      } else {
        toast({
          title: "Erro",
          description: response.message || "Falha ao carregar notícias.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro de Rede",
        description: "Não foi possível conectar à API de notícias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialNews();
  }, [token]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token) return;

    // Se o termo de busca for vazio, recarrega as notícias gerais
    if (!searchTerm.trim()) {
      await loadInitialNews();
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.getAssetNews(token, searchTerm);
      if (response.success) {
        setNews(response.data);
        toast({
          title: "Busca Concluída",
          description: `Encontradas ${response.data.length} notícias para "${searchTerm}".`,
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Erro na Busca",
        description: error.message || "Não foi possível buscar as notícias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuickSearch = (term: string) => {
    setSearchTerm(term);
    handleSearch();
  };

  const formatTimeAgo = (dateValue: Date | string) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;

    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notícias Financeiras</h2>
          <p className="text-muted-foreground">
            Mantenha-se atualizado com notícias relevantes para seus investimentos
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          Curadoria de Notícias
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Busque notícias por ativo, empresa ou tópico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Sugestões:</span>
            {['ETFs', 'Bitcoin', 'Tesouro', 'Ações', 'FIIs'].map((term) => (
              <Button
                key={term}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSearch(term)}
              >
                {term}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando notícias...</div>
        ) : news.length > 0 ? (
          news.map((article, index) => (
            <Card key={`${article.url}-${index}`} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {article.titulo}
                      </a>
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      {article.fonte && (
                        <Badge variant="outline">{article.fonte}</Badge>
                      )}
                      <span className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1.5 h-4 w-4" />
                        {formatTimeAgo(article.dataPublicacao)}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" aria-label="Ler notícia completa">
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma notícia encontrada. Tente buscar por outro termo ou limpe a busca para ver as notícias gerais.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}