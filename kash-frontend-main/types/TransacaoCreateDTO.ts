import { TipoTransacao } from "./TipoTransacao";

export interface TransacaoCreateDTO {
  descricao: string;
  valor: number;
  data: Date;
  tipo: TipoTransacao;
  categoriaId: number;
}