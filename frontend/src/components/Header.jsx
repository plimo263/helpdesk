import { AppBar, Button, Container, Stack } from "@mui/material";
import React from "react";
import Logo from "./Logo";
import Icone from "./icone";

const STR = {
  logout: "Sair",
  home: "Helpdesk",
};

const ICONS = {
  logout: "Logout",
  home: "Helpdesk",
};

function Header() {
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
  const options = [
    {
      name: STR.logout,
      icon: ICONS.logout,
      onClick: () => (window.location.href = "/logout"),
    },
  ];

  return (
    <Stack direction="row" gap={1}>
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
