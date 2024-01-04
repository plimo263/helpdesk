import React from "react";
import { Body1, H6 } from "../../components";
import { FormSearchAdvanced } from "../../components";

const STR = {
  tituloBuscaAvancada: "Busca avançada",
  descricaoBuscaAvancada: "Escolha entre as opções e monte uma busca avançada.",
};

function GestaoHelpdeskFiltroAvancado({ filters, onFilter }) {
  const titulo = STR.tituloBuscaAvancada;
  const descricao = STR.descricaoBuscaAvancada;

  return (
    <>
      <H6>{titulo}</H6>
      <Body1 align="center">{descricao}</Body1>
      <br />
      <FormSearchAdvanced filters={filters} onFilter={onFilter} />
    </>
  );
}

export default GestaoHelpdeskFiltroAvancado;
