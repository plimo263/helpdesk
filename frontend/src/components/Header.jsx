import { AppBar, Box, Button, Container, Grow, Stack } from "@mui/material";
import React, { useCallback, useState } from "react";
import Logo from "./Logo";
import Icone from "./icone";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const STR = {
  logout: "Sair",
  home: "Helpdesk",
  managerSectors: "Departamentos",
  managerUsers: "Usuários",
};

const ICONS = {
  logout: "Logout",
  home: "Helpdesk",
  managerSectors: "AccountTree",
  managerUsers: "Groups",
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
  const [menuSelected, setMenuSelected] = useState(null);
  const user = useSelector(selectUser);
  const history = useHistory();
  //
  const goToManagerUsers = useCallback(() => {
    setMenuSelected(STR.managerUsers);
    history.push("/manager_user_view");
  }, [history, setMenuSelected]);
  //
  const goToSectors = useCallback(() => {
    setMenuSelected(STR.managerSectors);
    history.push("/sector_view");
  }, [history, setMenuSelected]);

  const options = [];

  if (user?.agent) {
    options.push({
      name: STR.managerUsers,
      icon: ICONS.managerUsers,
      onClick: goToManagerUsers,
    });
    options.push({
      name: STR.managerSectors,
      icon: ICONS.managerSectors,
      onClick: goToSectors,
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
            variant="text"
            onClick={ele.onClick}
            startIcon={<Icone icone={ele.icon} />}
          >
            {ele.name}
          </Button>
          {menuSelected === ele.name ? (
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
