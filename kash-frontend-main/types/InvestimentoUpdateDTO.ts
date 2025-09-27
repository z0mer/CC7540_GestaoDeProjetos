import { TipoInvestimento } from "./TipoInvestimento";

export interface InvestimentoUpdateDTO {
  nome: string;
  tipo: TipoInvestimento;
  valorTotal: number;
  dataInicio: Date;
  quantidade: number;
}