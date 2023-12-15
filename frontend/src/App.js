import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import { BrowserRouter as Router } from "react-router-dom";
import Routes from "./routes/routes";
import {
  Paper,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { green } from "@mui/material/colors";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { userInit } from "./redux/actions/user-actions";

function App() {
  const dispatch = useDispatch();
  // Inicializa a recuperacao dos dados do usuario
  useEffect(() => {
    dispatch(userInit());
  }, [dispatch]);
  // Verifica se e mobile
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));
  const theme = createTheme({
    isMobile,
    palette: {
      primaryColor: "#4BA147",
      mode: "light",
      primary: green,
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Paper
        elevation={0}
        style={{ background: grey[200], minHeight: "100vh" }}
      >
        <Router>
          <Routes />
        </Router>
        <ToastContainer position="bottom-center" />
      </Paper>
    </ThemeProvider>
  );
}

export default App;
