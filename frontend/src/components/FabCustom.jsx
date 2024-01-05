import { Fab, Grow } from "@mui/material";
import React, { useEffect } from "react";
import Icone from "./icone";
import { useToggle } from "react-use";

function FabCustom({ onClick, icon }) {
  const [isOpen, setIsOpen] = useToggle(false);
  useEffect(() => {
    setTimeout(() => {
      setIsOpen();
    }, 500);
  }, [setIsOpen]);

  return (
    <Grow in={isOpen} unmountOnExit={false}>
      <Fab
        onClick={onClick}
        sx={{ position: "fixed", right: 16, bottom: 72 }}
        color="primary"
      >
        <Icone icone={icon} />
      </Fab>
    </Grow>
  );
}

export default FabCustom;
