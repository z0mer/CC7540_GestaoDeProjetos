import { TipoTransacao } from "./TipoTransacao";

export interface TransacaoUpdateDTO {
  descricao: string;
  valor: number;
  data: Date;
  tipo: TipoTransacao;
  categoriaId: string;
}