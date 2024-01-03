import { Container, useMediaQuery, useTheme } from "@mui/material";
import Lottie from "react-lottie";
import dataLottie from "../lotties/sem-pesquisa.json";
import dataLottie5 from "../lotties/sem-dados-encontrados2.json";
import { Body1 } from "./tipografia";

const defaultOptions = {
  loop: true,
  autoplay: true,
  delay: 2000,
  animationData: dataLottie,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const SemDados = ({ titulo, width, height }) => {
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));

  return (
    <Container disableGutters maxWidth="xs" sx={{ p: 1, mt: 2 }}>
      <Lottie
        options={{ ...defaultOptions, animationData: dataLottie5 }}
        height={height ? height : isMobile ? 200 : 400}
        width={width ? width : isMobile ? 200 : 400}
      />
      <Body1 align="center">{titulo}</Body1>
    </Container>
  );
};

export default SemDados;
