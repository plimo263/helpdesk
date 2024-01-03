// Centralização dos seletores usados no helpdesk
import _ from "lodash";
import { createSelector } from "reselect";

export const selectUsuario = (state) => state?.user;
export const selectColaboradores = (state) => state?.helpdesk?.colaboradores;
export const selectSolicitante = (state) => state?.helpdesk?.solicitantes;
export const selectDados = (state) => state?.helpdesk;
export const selectModal = (state) => state?.helpdesk?.modal;
export const selectStatus = (state) => state?.helpdesk?.status;
export const selectAgentes = (state) => state?.helpdesk?.agentes;

export const selectIsAgente = (state) => state?.user?.agent;
//
export const selectIdPagina = (state) => state?.helpdesk?.idPagina;
//
export const selectAssuntos = createSelector(selectDados, (dados) => {
  const { assunto } = dados;
  return _.map(assunto, (val) => [val.id, val.descricao]);
});
//
export const selectStatusFormatado = createSelector(selectStatus, (status) => {
  return _.map(status, (val) => [val.id, val.descricao]);
});
//
export const selectColaboradoresFormatados = createSelector(
  selectColaboradores,
  (val) => {
    return _.map(val, (item) => [
      item.id_usuario,
      `${item.nome} - ${item.email}`,
    ]);
  }
);
//
export const selectAgentesFormatado = createSelector(
  selectAgentes,
  (agentes) => {
    return _.map(agentes, (val) => [`${val.id_usuario}`, `${val.nome}`]);
  }
);

export const selectSubjects = (state) => state?.helpdesk?.helpdesk_assunto;
export const selectManuStatus = (state) => state?.helpdesk?.helpdesk_status;

export const selectIsSuperAgente = (state) => state?.user?.agent;
