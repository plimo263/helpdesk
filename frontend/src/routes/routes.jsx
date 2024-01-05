import { Route, useLocation, Switch } from "react-router-dom";
import { Header } from "../components";
import Login from "./login/Login";
import Helpdesk from "./helpdesk/helpdesk";
import ManagerUser from "./manager_user/manager-user";
import Sector from "./sector/sector";
import { Box, Grow } from "@mui/material";
import ConfigHelpdesk from "./config_helpdesk/config_helpdesk";
import { HelpDeskAdicionar, HelpdeskDetalhes } from "./helpdesk";
import HelpdeskAssunto from "./helpdesk/helpdesk-assunto";
import HelpdeskStatus from "./helpdesk/helpdesk-status";
import GestaoHelpdesk from "./gestao-helpdesk/gestao-helpdesk";
import HelpdeskAdicionar from "./helpdesk/helpdesk-adicionar";
import HelpdeskFiltroAvancado from "./helpdesk/helpdesk-filtro-avancado";
import ManagerUserAddUpd from "./manager_user/manager-user-add-upd";
import SectorAddUpd from "./sector/sector-add-upd";
import ConfigHelpdeskAddUpd from "./config_helpdesk/config-helpdesk-add-upd";

// Todas as rotas do aplicativo
export const ROTAS = [
  [Login.rota, Login],
  [Helpdesk.rota, Helpdesk],
  [ManagerUser.rota, ManagerUser],
  [Sector.rota, Sector],
  [ConfigHelpdesk.rota, ConfigHelpdesk],
  [HelpdeskFiltroAvancado.rota, HelpdeskFiltroAvancado],
  [HelpdeskAdicionar.rota, HelpDeskAdicionar],
  [HelpdeskDetalhes.rota, HelpdeskDetalhes],
  [HelpdeskAssunto.rota, HelpdeskAssunto],
  [HelpdeskStatus.rota, HelpdeskStatus],
  [GestaoHelpdesk.rota, GestaoHelpdesk],
  [ManagerUserAddUpd.rota, ManagerUserAddUpd],
  [SectorAddUpd.rota, SectorAddUpd],
  [ConfigHelpdeskAddUpd.rota, ConfigHelpdeskAddUpd],
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
