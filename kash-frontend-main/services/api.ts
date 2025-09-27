// apiService.ts
import {
  ProjecaoResultadoDTO,
  ProjecaoSimulacaoDTO,
  TransacaoCreateDTO,
  TransacaoResponseDTO,
  TransacaoUpdateDTO,
  UsuarioLoginDTO,
  UsuarioPerfilDTO,
  UsuarioRegistroDTO,
  UsuarioUpdateDTO,
  InvestimentoCreateDTO,
  InvestimentoResponseDTO,
  InvestimentoUpdateDTO,
  NoticiaDTO,
  ApiResponse,
  LoginResponse,
} from "@/types/index";

class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://kashapi-dqa9h6drfxhxe2cx.brazilsouth-01.azurewebsites.net'/*'https://localhost:7156'*/;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    }); 

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(data: UsuarioLoginDTO): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: UsuarioRegistroDTO): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/api/auth/registro', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserProfile(token: string): Promise<ApiResponse<UsuarioPerfilDTO>> {
    return this.request<UsuarioPerfilDTO>('/api/usuarios/perfil', {}, token);
  }

  async updateUserProfile(token: string, data: UsuarioUpdateDTO): Promise<ApiResponse<void>> {
    return this.request<void>('/api/usuarios/perfil', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  // Transaction endpoints
  async getTransactions(token: string): Promise<ApiResponse<TransacaoResponseDTO[]>> {
    return this.request<TransacaoResponseDTO[]>('/api/Transacoes', {}, token);
  }

  async createTransaction(token: string, data: TransacaoCreateDTO): Promise<ApiResponse<string>> {
    console.log("Token", token);
    return this.request<string>('/api/Transacoes', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async getTransaction(token: string, id: string): Promise<ApiResponse<TransacaoResponseDTO>> {
    return this.request<TransacaoResponseDTO>(`/api/Transacoes/${id}`, {}, token);
  }

  async updateTransaction(token: string, id: string, data: TransacaoUpdateDTO): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/Transacoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  async deleteTransaction(token: string, id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/Transacoes/${id}`, {
      method: 'DELETE',
    }, token);
  }

  // Investment endpoints
  async getInvestments(token: string): Promise<ApiResponse<InvestimentoResponseDTO[]>> {
    return this.request<InvestimentoResponseDTO[]>('/api/Investimentos', {}, token);
  }

  async createInvestment(token: string, data: InvestimentoCreateDTO): Promise<ApiResponse<string>> {
    return this.request<string>('/api/Investimentos', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async getInvestment(token: string, id: string): Promise<ApiResponse<InvestimentoResponseDTO>> {
    return this.request<InvestimentoResponseDTO>(`/api/Investimentos/${id}`, {}, token);
  }

  async updateInvestment(token: string, id: string, data: InvestimentoUpdateDTO): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/Investimentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  async deleteInvestment(token: string, id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/Investimentos/${id}`, {
      method: 'DELETE',
    }, token);
  }

  // Projection endpoints
  async getProjections(token: string): Promise<ApiResponse<ProjecaoResultadoDTO>> {
    return this.request<ProjecaoResultadoDTO>('/api/Projecoes', {}, token);
  }

  async simulateProjection(token: string, data: ProjecaoSimulacaoDTO): Promise<ApiResponse<ProjecaoResultadoDTO>> {
    return this.request<ProjecaoResultadoDTO>('/api/Projecoes/simulacao', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  // News endpoints
  async getNews(token: string): Promise<ApiResponse<NoticiaDTO[]>> {
    return this.request<NoticiaDTO[]>('/api/Noticias', {}, token);
  }

  async getAssetNews(token: string, asset: string): Promise<ApiResponse<NoticiaDTO[]>> {
    return this.request<NoticiaDTO[]>(`/api/Noticias/${asset}`, {}, token);
  }
}

export const apiService = new ApiService();