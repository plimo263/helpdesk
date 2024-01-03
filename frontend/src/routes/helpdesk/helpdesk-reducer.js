import {
  HELPDESK_ALTERAR_AGENTE,
  HELPDESK_ATUALIZAR_TICKET,
  HELPDESK_ABRIR_TICKET,
  HELPDESK_FILTRO,
  HELPDESK_FILTRO_LIMPAR,
  HELPDESK_FECHAR_MODAL,
  HELPDESK_INIT,
  HELPDESK_INIT_ESTATISTICOS,
  HELPDESK_LIMPAR_DADOS,
  HELPDESK_PAGINA,
  HELPDESK_SET_MODAL,
  HELPDESK_ASSUNTO_INIT,
  HELPDESK_ASSUNTO_UPD,
  HELPDESK_ASSUNTO_ADD,
  HELPDESK_ASSUNTO_DEL,
  HELPDESK_STATUS_FROM_TO,
  HELPDESK_STATUS_UPD,
  HELPDESK_STATUS_INIT,
  HELPDESK_STATUS_ADD,
  HELPDESK_STATUS_DEL,
} from "./helpdesk-actions";
import _ from "lodash";
const INIT = null;

export default function helpdeskReducer(state = INIT, action) {
  switch (action.type) {
    case HELPDESK_INIT:
      return {
        ...state,
        ...action.data,
        idPagina: 1,
      };
    case HELPDESK_INIT_ESTATISTICOS:
      return {
        ...state,
        ...action.data,
      };
    case HELPDESK_PAGINA:
      return {
        ...state,
        ...action.data,
      };
    case HELPDESK_LIMPAR_DADOS:
      return INIT;
    case HELPDESK_FECHAR_MODAL:
      return {
        ...state,
        modal: null,
      };
    case HELPDESK_SET_MODAL:
      return {
        ...state,
        modal: action.data,
      };
    case HELPDESK_FILTRO: // Aplicacoa de filtro
      return {
        ...state,
        helpdeskFiltro: action.data.helpdeskFiltro,
        tipoDeFiltro: action.data.tipoDeFiltro,
      };
    case HELPDESK_FILTRO_LIMPAR: // Limpeza do filtro
      return {
        ...state,
        helpdeskFiltro: null,
        tipoDeFiltro: null,
      };
    case HELPDESK_ABRIR_TICKET: // Adicionar ticket
      return (() => {
        return {
          ...state,
          assunto: _.map(state.assunto, (val) => {
            if (val.descricao === action.data.assunto) {
              val.total += 1;
            }
            return val;
          }),
          status: _.map(state.status, (val) => {
            if (val.descricao === action.data.status) {
              val.total += 1;
            }
            return val;
          }),
          //helpdesk: [action.data, ...state.helpdesk],
          helpdesk: state.helpdesk.map((ele) => {
            if (ele.id === action.data.id) {
              return action.data;
            }
            return ele;
          }),
        };
      })();
    case HELPDESK_ATUALIZAR_TICKET: // Atualiza o ticket
      return (() => {
        const { helpdesk, helpdeskFiltro } = state;
        if (helpdeskFiltro) {
          return {
            ...state,
            helpdeskFiltro: state?.helpdeskFiltro?.map((ele) => {
              if (ele.id === action.data.id) {
                return action.data;
              }
              return ele;
            }),
            helpdesk: state?.helpdesk?.map((ele) => {
              if (ele.id === action.data.id) {
                return action.data;
              }
              return ele;
            }),
          };
        }
        if (helpdesk) {
          return {
            ...state,
            helpdesk: state?.helpdesk?.map((ele) => {
              if (ele.id === action.data.id) {
                return action.data;
              }
              return ele;
            }),
          };
        }
      })();
    case HELPDESK_ALTERAR_AGENTE: // Alterar o agente
      return {
        ...state,
        helpdesk: state.helpdesk?.map((ele) => {
          if (ele.id === action.data.id) {
            return action.data;
          }
          return ele;
        }),
      };
    case HELPDESK_ASSUNTO_INIT: // Recupera todos os assuntos
      return {
        ...state,
        helpdesk_assunto: action.data,
      };
    case HELPDESK_ASSUNTO_UPD: // Atualizar assunto
      return {
        ...state,
        helpdesk_assunto: state.helpdesk_assunto.map((ele) => {
          if (ele.id === action.data.id) {
            return action.data;
          }
          return ele;
        }),
      };
    case HELPDESK_ASSUNTO_ADD: // Incluir assunto
      return {
        ...state,
        helpdesk_assunto: [action.data, ...state.helpdesk_assunto],
      };
    case HELPDESK_ASSUNTO_DEL: // Excluir assunto
      return {
        ...state,
        helpdesk_assunto: state.helpdesk_assunto?.filter(
          (ele) => ele.id !== action.data
        ),
      };

    case HELPDESK_STATUS_INIT: // Recupera todos os status
      return {
        ...state,
        helpdesk_status: action.data,
      };
    case HELPDESK_STATUS_UPD: // Atualizar status
    case HELPDESK_STATUS_FROM_TO: // Atualiza lista de status para
      return {
        ...state,
        helpdesk_status: state.helpdesk_status.map((ele) => {
          if (ele.id === action.data.id) {
            return action.data;
          }
          return ele;
        }),
      };
    case HELPDESK_STATUS_ADD: // Incluir status
      return {
        ...state,
        helpdesk_status: [action.data, ...state.helpdesk_status],
      };
    case HELPDESK_STATUS_DEL: // Excluir status
      return {
        ...state,
        helpdesk_status: state.helpdesk_status?.filter(
          (ele) => ele.id !== action.data
        ),
      };

    default:
      return state;
  }
}
