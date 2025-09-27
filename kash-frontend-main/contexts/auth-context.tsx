"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiService } from '@/services/api'
import { UsuarioPerfilDTO, UsuarioLoginDTO, UsuarioRegistroDTO } from "@/types/index"

interface AuthContextType {
  user: UsuarioPerfilDTO | null
  token: string | null
  login: (data: UsuarioLoginDTO) => Promise<void>
  register: (data: UsuarioRegistroDTO) => Promise<void>
  logout: () => void
  reloadUser: () => Promise<void> // Função para recarregar dados do usuário
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioPerfilDTO | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = async (authToken: string) => {
    try {
      const response = await apiService.getUserProfile(authToken)
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        // Se o token for inválido ou o perfil não for encontrado, força o logout
        throw new Error(response.message || 'Falha ao validar a sessão.');
      }
    } catch (error) {
      console.error('Falha ao carregar perfil do usuário:', error)
      logout() // Limpa o estado e o token inválido
    }
  }

  // Efeito para carregar o token do localStorage ao iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('kash_token')
    if (storedToken) {
      setToken(storedToken)
      loadUserProfile(storedToken).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])
  
  const login = async (data: UsuarioLoginDTO) => {
    const response = await apiService.login(data)
    console.log("Retorno: ", response);
    debugger;
    if (response.success && response.data?.token) {
      const new_token = response.data.token;
      setToken(new_token);
      localStorage.setItem('kash_token', new_token);
      await loadUserProfile(new_token);
    } else {
      throw new Error(response.message || 'E-mail ou senha inválidos.');
    }
  }

  const register = async (data: UsuarioRegistroDTO) => {
    const response = await apiService.register(data)
    if (response.success && response.data?.token) {
      const new_token = response.data.token;
      setToken(new_token);
      localStorage.setItem('kash_token', new_token);
      await loadUserProfile(new_token);
    } else {
      throw new Error(response.message || 'Não foi possível concluir o registro.');
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('kash_token')
  }
  
  // Função para ser chamada após a atualização do perfil
  const reloadUser = async () => {
      if(token){
          await loadUserProfile(token);
      }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, reloadUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}