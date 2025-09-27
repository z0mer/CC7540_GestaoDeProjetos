"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiService } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { User, Shield, Bell } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { UsuarioUpdateDTO } from "@/types"

export function ProfilePage() {
  // Obtenção de 'reloadUser' do contexto para atualizar os dados globais
  const { user, logout, token, reloadUser } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Estado para os dados do perfil, alinhado com o DTO
  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
  })

  // Estado separado para o formulário de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Estado para as preferências (atualmente, apenas visual)
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
  })

  // Efeito para popular o formulário quando os dados do usuário carregarem
  useEffect(() => {
    if (user) {
      setProfileData({
        nome: user.nome || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const updateData: UsuarioUpdateDTO = {
        nome: profileData.nome,
        email: profileData.email,
      };
      const response = await apiService.updateUserProfile(token, updateData);

      if (response.success) {
        toast({
          title: "Perfil Atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
        });
        // Recarrega os dados do usuário no contexto para refletir em toda a aplicação
        await reloadUser();
      } else {
        throw new Error(response.message || "Não foi possível atualizar o perfil.");
      }
    } catch (error: any) {
      toast({
        title: "Falha na Atualização",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // ATENÇÃO: A api.ts fornecida não possui um endpoint para alterar a senha.
  // Esta função realiza apenas validações no lado do cliente como simulação.
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação devem ser idênticas.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    // Simulação de chamada de API
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Senha Alterada (Simulação)",
        description: "Em um aplicativo real, sua senha seria alterada.",
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }, 1000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações de Perfil</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações e preferências da sua conta
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Perfil
            </CardTitle>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={profileData.nome}
                  onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Endereço de E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Altere sua senha (funcionalidade simulada)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferências de Notificação
          </CardTitle>
          <CardDescription>
            Escolha como você quer receber atualizações e alertas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
            <Label htmlFor="emailNotifications" className="cursor-pointer">Notificações por E-mail</Label>
            <Switch
              id="emailNotifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
            <Label htmlFor="pushNotifications" className="cursor-pointer">Notificações Push (Web)</Label>
            <Switch
              id="pushNotifications"
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Sair da Conta</h4>
            <Button variant="outline" onClick={logout}>Sair</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-red-600">Excluir Conta</h4>
            <Button variant="destructive">Excluir Conta</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}