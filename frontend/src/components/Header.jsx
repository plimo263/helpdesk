import { AppBar, Button, Container, Stack } from "@mui/material";
import React, { useCallback } from "react";
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
    <AppBar>
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
  const user = useSelector(selectUser);
  const history = useHistory();
  //
  const goToManagerUsers = useCallback(() => {
    history.push("/manager_user_view");
  }, [history]);
  //
  const goToSectors = useCallback(() => {
    history.push("/sector_view");
  }, [history]);

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
        <Button
          sx={{ color: "white" }}
          key={idx}
          variant="text"
          onClick={ele.onClick}
          startIcon={<Icone icone={ele.icon} />}
        >
          {ele.name}
        </Button>
      ))}
    </Stack>
  );
};

export default Header;
