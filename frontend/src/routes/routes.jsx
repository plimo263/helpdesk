import { Route, useLocation, Switch } from "react-router-dom";
import { Header } from "../components";
import Login from "./login/Login";
import Helpdesk from "./helpdesk/helpdesk";
import ManagerUser from "./manager_user/manager-user";
import Sector from "./sector/sector";
import { Box, Grow } from "@mui/material";
import ConfigHelpdesk from "./config_helpdesk/config_helpdesk";
import { HelpdeskDetalhes } from "./helpdesk";

// Todas as rotas do aplicativo
export const ROTAS = [
  [Login.rota, Login],
  [Helpdesk.rota, Helpdesk],
  [ManagerUser.rota, ManagerUser],
  [Sector.rota, Sector],
  [ConfigHelpdesk.rota, ConfigHelpdesk],
  [HelpdeskDetalhes.rota, HelpdeskDetalhes],
];

export default function Routes() {
  const location = useLocation();
  return (
    <>
      {location && location.pathname !== "/" && <Header />}
      <Grow in key={location.pathname} unmountOnExit>
        <Box>
          <Switch location={location} key={location.pathname}>
            {ROTAS.map((ele, idx) => (
              <Route component={ele[1]} exact path={ele[0]} key={idx} />
            ))}
          </Switch>
        </Box>
      </Grow>
    </>
  );
}
