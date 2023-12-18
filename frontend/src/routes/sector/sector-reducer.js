import {
  SECTOR_ADD,
  SECTOR_CLOSE_MODAL,
  SECTOR_DEL,
  SECTOR_INIT,
  SECTOR_SET_MODAL,
  SECTOR_UPD,
} from "./sector-actions";

export default function sectorReducer(state = null, action) {
  switch (action.type) {
    case SECTOR_INIT:
      return {
        ...state,
        items: action.data,
      };
    case SECTOR_ADD:
      return {
        ...state,
        items: [action.data, ...state.items],
        modal: null,
      };
    case SECTOR_UPD:
      return {
        ...state,
        items: state.items.map((ele) => {
          if (ele.id === action.data.id) {
            return action.data;
          }
          return ele;
        }),
        modal: null,
      };
    case SECTOR_DEL:
      return {
        ...state,
        items: state.items.filter((ele) => {
          return ele.id !== action.data;
        }),
        modal: null,
      };
    case SECTOR_SET_MODAL:
      return {
        ...state,
        modal: action.data,
      };
    case SECTOR_CLOSE_MODAL:
      return {
        ...state,
        modal: null,
      };
    default:
      return state;
  }
}
