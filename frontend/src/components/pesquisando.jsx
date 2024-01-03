import { Container, useMediaQuery, useTheme } from "@mui/material";
import Lottie from "react-lottie";
import dataLottie from "../lotties/sem-pesquisa.json";
import dataLottie2 from "../lotties/pesquisando.json";

const defaultOptions = {
  loop: true,
  autoplay: true,
  delay: 2000,
  animationData: dataLottie,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export const Pesquisando = () => {
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));

  return (
    <Container disableGutters maxWidth="xs" sx={{ p: 1, mt: 2 }}>
      <Lottie
        options={{ ...defaultOptions, animationData: dataLottie2 }}
        height={isMobile ? 200 : 400}
        width={isMobile ? 200 : 400}
      />
    </Container>
  );
};

export default Pesquisando;
