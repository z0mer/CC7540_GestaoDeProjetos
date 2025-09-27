import { TipoInvestimento } from "./TipoInvestimento";

export interface InvestimentoResponseDTO {
  id: string;
  nome: string;
  tipo: TipoInvestimento;
  valorTotal: number;
  dataInicio: Date;
  quantidade: number;
}