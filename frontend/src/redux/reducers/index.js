import { combineReducers } from "redux";
import userReducer from "./user-reducer";
import managerUserReducer from "../../routes/manager_user/manager-user-reducer";
import sectorReducer from "../../routes/sector/sector-reducer";
import configHelpdeskReducer from "../../routes/config_helpdesk/config-helpdesk-reducer";
import helpdeskReducer from "../../routes/helpdesk/helpdesk-reducer";

export default combineReducers({
  helpdesk: helpdeskReducer,
  user: userReducer,
  managerUser: managerUserReducer,
  sector: sectorReducer,
  configHelpdesk: configHelpdeskReducer,
});
