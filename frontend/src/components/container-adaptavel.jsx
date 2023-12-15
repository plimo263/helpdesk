import { Container, useMediaQuery, useTheme } from "@mui/material";
import React from "react";

function ContainerAdaptavel({ children, sx }) {
  const isMobile = useMediaQuery(useTheme().breakpoints.down("md"));

  return (
    <Container
      sx={{
        width: ({ breakpoints }) => (isMobile ? "auto" : breakpoints.values.md),
        ...sx,
      }}
    >
      {children}
    </Container>
  );
}

ContainerAdaptavel.defaultProps = {
  sx: {
    minHeight: "50vh",
  },
};

export default ContainerAdaptavel;
