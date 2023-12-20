import {
  CONFIG_HELPDESK_ADD,
  CONFIG_HELPDESK_CLOSE_MODAL,
  CONFIG_HELPDESK_DEL,
  CONFIG_HELPDESK_INIT,
  CONFIG_HELPDESK_SET_MODAL,
  CONFIG_HELPDESK_UPD,
} from "./config-helpdesk-actions";

export default function configHelpdeskReducer(state = null, action) {
  switch (action.type) {
    case CONFIG_HELPDESK_INIT:
      return {
        ...state,
        items: action.data,
      };
    case CONFIG_HELPDESK_CLOSE_MODAL:
      return {
        ...state,
        modal: null,
      };
    case CONFIG_HELPDESK_SET_MODAL:
      return {
        ...state,
        modal: action.data,
      };
    case CONFIG_HELPDESK_ADD:
      return {
        ...state,
        modal: null,
        items: [action.data, ...state.items],
      };
    case CONFIG_HELPDESK_UPD:
      return {
        ...state,
        modal: null,
        items: state.items.map((ele) => {
          if (ele.id === action.data.id) {
            return action.data;
          }
          return ele;
        }),
      };
    case CONFIG_HELPDESK_DEL:
      return {
        ...state,
        modal: null,
        items: state.items.filter((ele) => ele.id !== action.data),
      };
    default:
      return state;
  }
}
