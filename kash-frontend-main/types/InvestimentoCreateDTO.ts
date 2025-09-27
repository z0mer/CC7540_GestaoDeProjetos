import { TipoInvestimento } from "./TipoInvestimento";

export interface InvestimentoCreateDTO {
  nome: string;
  tipo: TipoInvestimento;
  valorTotal: number;
  dataInicio: Date;
  quantidade: number;
}