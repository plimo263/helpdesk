import {
  MANAGER_USER_CLOSE_MODAL,
  MANAGER_USER_DEL,
  MANAGER_USER_INIT,
  MANAGER_USER_POST,
  MANAGER_USER_PUT,
  MANAGER_USER_SET_MODAL,
} from "./manager-user-actions";

export default function managerUserReducer(state = null, action) {
  switch (action.type) {
    case MANAGER_USER_INIT:
      return {
        users: action.data,
      };
    case MANAGER_USER_SET_MODAL:
      return {
        ...state,
        modal: action.data,
      };
    case MANAGER_USER_CLOSE_MODAL:
      return {
        ...state,
        modal: null,
      };
    case MANAGER_USER_POST:
      return {
        ...state,
        modal: null,
        users: [...state.users, action.data],
      };
    case MANAGER_USER_PUT:
      return {
        ...state,
        modal: null,
        users: state.users.map((ele) => {
          if (ele.id === action.data.id) {
            return action.data;
          }
          return ele;
        }),
      };
    case MANAGER_USER_DEL:
      return {
        ...state,
        modal: null,
        users: state.users.filter((ele) => {
          if (ele.id === action.data) {
            return false;
          }
          return true;
        }),
      };
    default:
      return state;
  }
}
