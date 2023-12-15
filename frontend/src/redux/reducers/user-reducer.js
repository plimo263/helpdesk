import { USER_INIT } from "../actions";

export default function userReducer(state = null, action) {
  switch (action.type) {
    case USER_INIT:
      return action.data;
    default:
      return state;
  }
}
