import { AppBar, Box, Button, Container, Grow, Stack } from "@mui/material";
import React, { useCallback, useState } from "react";
import Logo from "./Logo";
import Icone from "./icone";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import Helpdesk from "../routes/helpdesk/helpdesk";
import ManagerUser from "../routes/manager_user/manager-user";
import Sector from "../routes/sector/sector";
import ConfigHelpdesk from "../routes/config_helpdesk/config_helpdesk";

const STR = {
  logout: "Sair",
  home: "Helpdesk",
  managerSectors: "Setores",
  managerUsers: "Usuários",
  configHelpdesk: "Configurações",
};

const ICONS = {
  logout: "Logout",
  home: "Construction",
  managerSectors: "AccountTree",
  managerUsers: "Groups",
  configHelpdesk: "Build",
};

const selectUser = (state) => state?.user;

function Header() {
  //
  return (
    <AppBar position="relative">
      <Container maxWidth="md">
        <Stack direction="row" justifyContent="space-between">
          <a href="/">
            <Logo />
          </a>
          <MenuUser />
        </Stack>
      </Container>
    </AppBar>
  );
}

const MenuUser = () => {
  const [menuSelected, setMenuSelected] = useState(window.location.pathname);
  const user = useSelector(selectUser);
  const history = useHistory();
  const onSetRouter = useCallback(
    (router) => {
      setMenuSelected(router);
      history.push(router);
    },
    [history, setMenuSelected]
  );
  //

  const options = [
    {
      name: STR.home,
      icon: ICONS.home,
      route: Helpdesk.rota,
      onClick: () => onSetRouter(Helpdesk.rota),
    },
  ];

  if (user?.agent) {
    options.push({
      name: STR.managerUsers,
      icon: ICONS.managerUsers,
      route: ManagerUser.rota,
      onClick: () => onSetRouter(ManagerUser.rota),
    });
    options.push({
      name: STR.managerSectors,
      icon: ICONS.managerSectors,
      route: Sector.rota,
      onClick: () => onSetRouter(Sector.rota),
    });
    options.push({
      name: STR.configHelpdesk,
      icon: ICONS.configHelpdesk,
      route: ConfigHelpdesk.rota,
      onClick: () => onSetRouter(ConfigHelpdesk.rota),
    });
  }

  options.push({
    name: STR.logout,
    icon: ICONS.logout,
    onClick: () => (window.location.href = "/logout"),
  });

  return (
    <Stack direction="row" gap={2}>
      {options.map((ele, idx) => (
        <Stack key={idx} justifyContent="center">
          <Button
            sx={{
              color: "white",
            }}
            size="small"
            variant="text"
            onClick={ele.onClick}
            startIcon={<Icone icone={ele.icon} />}
          >
            {ele.name}
          </Button>
          {menuSelected === ele.route ? (
            <Grow key={ele.name} in unmountOnExit>
              <Box sx={{ width: "100%", background: "white", height: 2 }} />
            </Grow>
          ) : null}
        </Stack>
      ))}
    </Stack>
  );
};

export default Header;
