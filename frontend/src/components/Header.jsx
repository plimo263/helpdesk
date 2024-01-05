import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  Grow,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import Logo from "./Logo";
import Icone from "./icone";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import Helpdesk from "../routes/helpdesk/helpdesk";
import ManagerUser from "../routes/manager_user/manager-user";
import Sector from "../routes/sector/sector";
import ConfigHelpdesk from "../routes/config_helpdesk/config_helpdesk";
import GestaoHelpdesk from "../routes/gestao-helpdesk/gestao-helpdesk";
import { useToggle } from "react-use";
import { H5, H6 } from "./tipografia";

const STR = {
  logout: "Sair",
  manager: "Gestão",
  home: "Helpdesk",
  managerSectors: "Setores",
  managerUsers: "Usuários",
  configHelpdesk: "Configurações",
  titleAppBar: "Meu Helpdesk",
};

const ICONS = {
  manager: "Dashboard",
  logout: "Logout",
  home: "Construction",
  managerSectors: "AccountTree",
  managerUsers: "Groups",
  configHelpdesk: "Build",
};

const selectUser = (state) => state?.user;

function Header() {
  const isMobile = useTheme()?.isMobile;

  //
  return (
    <AppBar
      position="relative"
      sx={{ minHeight: 48, justifyContent: "center" }}
    >
      {isMobile ? (
        <MenuUserMobile />
      ) : (
        <Container maxWidth="md">
          <Stack direction="row" justifyContent="space-between">
            <a href="/">
              <Logo />
            </a>
            <MenuUser />
          </Stack>
        </Container>
      )}
    </AppBar>
  );
}
//
const MenuUserMobile = () => {
  const [isOpen, setOpen] = useToggle();
  const history = useHistory();
  const [viewButtonGoBack, setViewButtonGoBack] = useState(false);
  // Altera entre exibir e ocultar o botao de volta
  useEffect(() => {
    const unlisten = history.listen(() => {
      if (history.action === "PUSH") {
        setViewButtonGoBack(true);
      } else if (history.action === "POP") {
        setViewButtonGoBack(false);
      }
    });
    return unlisten;
  }, [setViewButtonGoBack, history]);

  const onBackRoute = useCallback(() => {
    history.goBack();
  }, [history]);

  return (
    <Stack>
      <Stack sx={{ px: 1 }} direction="row" justifyContent="space-between">
        <Stack direction="row" gap={1}>
          {viewButtonGoBack ? (
            <IconButton sx={{ color: "white" }} onClick={onBackRoute}>
              <Icone icone="ArrowBack" />
            </IconButton>
          ) : (
            <IconButton sx={{ color: "white" }} onClick={setOpen}>
              <Icone icone="Menu" />
            </IconButton>
          )}
        </Stack>
        <Stack direction="row" gap={1} alignItems="center">
          <H6 fontWeight="bold">{STR.titleAppBar}</H6>
          <Logo />
        </Stack>
      </Stack>
      <Drawer anchor="left" open={isOpen} onClose={setOpen}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            pl: 2,
            gap: 1,
            height: 56,
            background: ({ palette }) => palette.primary.main,
          }}
        >
          <H5>{STR.titleAppBar}</H5>
          <Logo />
        </Box>
        <List sx={{ width: "80vw" }}>
          <Options onClose={setOpen} />
        </List>
      </Drawer>
    </Stack>
  );
};

const MenuUser = () => {
  return (
    <Stack direction="row" gap={2}>
      <Options />
    </Stack>
  );
};

const Options = ({ onClose }) => {
  const isMobile = useTheme()?.isMobile;

  const [menuSelected, setMenuSelected] = useState(window.location.pathname);

  const user = useSelector(selectUser);

  const history = useHistory();

  const onColor =
    (route) =>
    ({ palette }) =>
      menuSelected === route && palette.primary.main;

  const onSetRouter = useCallback(
    (router) => {
      if (onClose) onClose();
      setMenuSelected(router);
      history.replace(router);
    },
    [history, setMenuSelected, onClose]
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
      name: STR.manager,
      icon: ICONS.manager,
      route: GestaoHelpdesk.rota,
      onClick: () => onSetRouter(GestaoHelpdesk.rota),
    });
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
    <>
      {options.map((ele, idx) =>
        isMobile ? (
          <ListItem
            key={idx}
            sx={{
              color: onColor(ele.route),
            }}
            disablePadding
            divider={idx < options.length - 1}
          >
            <ListItemButton onClick={ele.onClick}>
              <ListItemIcon>
                <Icone sx={{ color: onColor(ele.route) }} icone={ele.icon} />
              </ListItemIcon>
              <ListItemText primary={ele.name} />
            </ListItemButton>
          </ListItem>
        ) : (
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
        )
      )}
    </>
  );
};

export default Header;
