import React from "react";
import { ContainerAdaptavel } from "../../components";
import HelpdeskFiltroAvancado from "./helpdesk-filtro-avancado";
import HelpdeskAdicionar from "./helpdesk-adicionar";
import HelpdeskAssuntoAddUpd from "./helpdesk-assunto-add-upd";
import HelpdeskAssuntoDel from "./helpdesk-assunto-del";
import HelpdeskStatusAddUpd from "./helpdesk-status-add-upd";
import HelpdeskStatusDel from "./helpdesk-status-del";
import HelpdeskStatusFromTo from "./helpdesk-status-from-to";
import HelpdeskAlterarEnvolvidos from "./helpdesk-alterar-envolvidos";

//
export const MODAL = {
  ADD_TICKET: "ADD_TICKET",
  DEL_SUBJECT: "DEL_SUBJECT",
  ADVANCED_FILTER: "ADVANCED_FILTER",
  MANU_STATUS: "MANUTENCAO_STATUS",
  ADD_SUBJECT: "ADD_SUBJECT",
  ADD_UPD_STATUS: "ADD_UPD_STATUS",
  DEL_STATUS: "DEL_STATUS",
  MOVE_STATUS: "MOVE_STATUS",
  UPD_INVOLVED: "UPD_INVOLVED",
};
function HelpdeskModal({ modal }) {
  let corpo;
  switch (modal.tipo) {
    case MODAL.ADD_TICKET: // para insercao de ticket
      corpo = <HelpdeskAdicionar />;
      break;
    case MODAL.ADVANCED_FILTER: // Para filtros avancados
      corpo = <HelpdeskFiltroAvancado />;
      break;
    case MODAL.ADD_SUBJECT: // Para adicionar um assunto
      corpo = <HelpdeskAssuntoAddUpd {...modal.dados} />;
      break;
    case MODAL.DEL_SUBJECT: // Para excluir o assunto
      corpo = <HelpdeskAssuntoDel id={modal.dados} />;
      break;
    case MODAL.ADD_UPD_STATUS: // Adicionar/atualizar um status criado
      corpo = <HelpdeskStatusAddUpd {...modal.dados} />;
      break;
    case MODAL.DEL_STATUS: // Excluir o status ativo
      corpo = <HelpdeskStatusDel id={modal.dados} />;
      break;
    case MODAL.MOVE_STATUS: // Definir para onde o status que esta vai levar
      corpo = <HelpdeskStatusFromTo item={modal.dados} />;
      break;
    case MODAL.UPD_INVOLVED: //
      corpo = <HelpdeskAlterarEnvolvidos {...modal.dados} />;
      break;
    default:
      break;
  }
  return (
    <ContainerAdaptavel sx={{ minHeight: "60vh" }}>{corpo}</ContainerAdaptavel>
  );
}

export default HelpdeskModal;
