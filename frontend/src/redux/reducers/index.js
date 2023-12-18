import { combineReducers } from "redux";
import userReducer from "./user-reducer";
import managerUserReducer from "../../routes/manager_user/manager-user-reducer";
import sectorReducer from "../../routes/sector/sector-reducer";

export default combineReducers({
  user: userReducer,
  managerUser: managerUserReducer,
  sector: sectorReducer,
});
