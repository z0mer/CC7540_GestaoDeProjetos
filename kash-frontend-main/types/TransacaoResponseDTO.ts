import { TipoTransacao } from "./TipoTransacao";

export interface TransacaoResponseDTO {
  id: string;
  descricao: string;
  valor: number;
  data: Date;
  tipo: TipoTransacao;
  categoriaNome: string;
}