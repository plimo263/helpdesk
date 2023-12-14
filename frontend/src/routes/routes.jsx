import { Route, useLocation, Switch } from "react-router-dom";
import { Header } from "../components";
import Login from "./login/Login";
import Helpdesk from "./helpdesk/helpdesk";

// Todas as rotas do aplicativo
export const ROTAS = [
  [Login.rota, Login],
  [Helpdesk.rota, Helpdesk],
];

export default function Routes() {
  const location = useLocation();
  return (
    <>
      {location && location.pathname !== "/" && <Header />}
      <Switch location={location} key={location.pathname}>
        {ROTAS.map((ele, idx) => (
          <Route component={ele[1]} exact path={ele[0]} key={idx} />
        ))}
      </Switch>
    </>
  );
}
