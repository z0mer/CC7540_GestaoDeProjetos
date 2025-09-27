"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { UsuarioLoginDTO, UsuarioRegistroDTO } from "@/types" // Importação dos tipos centrais

export function LoginForm() {
  const { login, register } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loginData, setLoginData] = useState<UsuarioLoginDTO>({
    email: "",
    senha: "",
  })

  const [registerData, setRegisterData] = useState<UsuarioRegistroDTO>({
    nome: "",
    email: "",
    senha: "",
    confirmacaoSenha: "",
  })

  // Estado unificado para erros de ambos os formulários
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePassword = (password: string) => password.length >= 6 // Alinhado com o usual de APIs

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: Record<string, string> = {};

    if (!validateEmail(loginData.email)) {
      newErrors.loginEmail = "Por favor, insira um e-mail válido.";
    }
    if (!loginData.senha) {
      newErrors.loginSenha = "A senha é obrigatória.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setLoading(true);
    try {
      await login(loginData);
      toast({
        title: "Bem-vindo(a) de volta!",
        description: "Login realizado com sucesso.",
      });
    } catch (error: any) {
      // Exibe a mensagem de erro específica vinda da API
      toast({
        title: "Falha no login",
        description: error.message || "E-mail ou senha inválidos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: Record<string, string> = {};

    if (!registerData.nome.trim()) {
      newErrors.registerNome = "O nome é obrigatório.";
    }
    if (!validateEmail(registerData.email)) {
      newErrors.registerEmail = "Por favor, insira um e-mail válido.";
    }
    if (!validatePassword(registerData.senha)) {
      newErrors.registerSenha = "A senha deve ter pelo menos 6 caracteres.";
    }
    if (registerData.senha !== registerData.confirmacaoSenha) {
      newErrors.registerConfirmacaoSenha = "As senhas não coincidem.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await register(registerData);
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo(a) ao KASH.",
      });
    } catch (error: any) {
      // Exibe a mensagem de erro específica vinda da API
      toast({
        title: "Falha no registro",
        description: error.message || "Não foi possível criar a conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">KASH</CardTitle>
          <CardDescription>Sua plataforma de gestão financeira pessoal</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full" onValueChange={() => setErrors({})}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Registrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input id="login-email" type="email" placeholder="seu@email.com" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} className={errors.loginEmail ? "border-red-500" : ""} />
                  {errors.loginEmail && <p className="text-sm text-red-500">{errors.loginEmail}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="Sua senha" value={loginData.senha} onChange={(e) => setLoginData({ ...loginData, senha: e.target.value })} className={errors.loginSenha ? "border-red-500" : ""} />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.loginSenha && <p className="text-sm text-red-500">{errors.loginSenha}</p>}
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="pt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome Completo</Label>
                  <Input id="register-name" type="text" placeholder="Seu nome completo" value={registerData.nome} onChange={(e) => setRegisterData({ ...registerData, nome: e.target.value })} className={errors.registerNome ? "border-red-500" : ""} />
                  {errors.registerNome && <p className="text-sm text-red-500">{errors.registerNome}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-mail</Label>
                  <Input id="register-email" type="email" placeholder="seu@email.com" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} className={errors.registerEmail ? "border-red-500" : ""} />
                  {errors.registerEmail && <p className="text-sm text-red-500">{errors.registerEmail}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <div className="relative">
                    <Input id="register-password" type={showPassword ? "text" : "password"} placeholder="Crie uma senha forte" value={registerData.senha} onChange={(e) => setRegisterData({ ...registerData, senha: e.target.value })} className={errors.registerSenha ? "border-red-500" : ""} />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.registerSenha && <p className="text-sm text-red-500">{errors.registerSenha}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirmar Senha</Label>
                  <div className="relative">
                    <Input id="register-confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="Confirme sua senha" value={registerData.confirmacaoSenha} onChange={(e) => setRegisterData({ ...registerData, confirmacaoSenha: e.target.value })} className={errors.registerConfirmacaoSenha ? "border-red-500" : ""} />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.registerConfirmacaoSenha && <p className="text-sm text-red-500">{errors.registerConfirmacaoSenha}</p>}
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}