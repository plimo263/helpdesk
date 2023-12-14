import { Container, Paper, Stack } from "@mui/material";
import React, { useCallback } from "react";
import { useToggle } from "react-use";
import { EntradaForm, Logo } from "../../components";
import * as yup from "yup";
import { VALIDADOR_TIPO, obterValidador } from "../../utils/validadores";
import { green } from "@mui/material/colors";
import { Body1 } from "../../components/tipografia";
import axios from "axios";
import { ToastErro } from "../../utils/toast-erro";
import Helpdesk from "../helpdesk/helpdesk";

const STR = {
  labelEmail: "Email",
  placeholderEmail: "Digite o email",
  errorEmail: "* Informe o endereço de email",
  labelPassword: "Senha",
  placeholderPassword: "Digite a senha",
  errorPassword: "* Informe a senha para autenticar",
  labelBtnSend: "Logar",
  title: "Helpdesk, sua plataforma de chamados.",
};

const LABEL_FIELDS = {
  email: "email",
  password: "password",
};

function Login() {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{ background: green[300], height: "100vh" }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: 1 }}>
          <Stack alignItems="center">
            <Logo />
            <br />
            <Body1>{STR.title}</Body1>
            <Form />
          </Stack>
        </Paper>
      </Container>
    </Stack>
  );
}

const Form = () => {
  const [wait, setWait] = useToggle();

  const schema = [
    {
      type: "email",
      name: LABEL_FIELDS.email,
      label: STR.labelEmail,
      placeholder: STR.placeholderEmail,
      icon: "Email",
    },
    {
      type: "password",
      name: LABEL_FIELDS.password,
      label: STR.labelPassword,
      placeholder: STR.placeholderPassword,
      icon: "VpnKey",
    },
  ];
  //
  const schemaValidator = yup.object().shape({
    [LABEL_FIELDS.email]: obterValidador(VALIDADOR_TIPO.email),
    [LABEL_FIELDS.password]: obterValidador(VALIDADOR_TIPO.texto, 1),
  });
  //
  const schemaMessageError = {
    [LABEL_FIELDS.email]: STR.errorEmail,
    [LABEL_FIELDS.password]: STR.errorPassword,
  };
  //
  const onSubmit = useCallback(
    async (val) => {
      const { email, password } = val;

      setWait();

      try {
        await axios.post("/", { username: email, password });
        window.location.href = Helpdesk.rota;
      } catch (error) {
        console.log(error);
        ToastErro(error?.response?.data?.message || error.toString());
      } finally {
        setWait();
      }
    },
    [setWait]
  );

  return (
    <EntradaForm
      schemaValidator={schemaValidator}
      schemaMessageError={schemaMessageError}
      schema={schema}
      wait={wait}
      onSubmit={onSubmit}
    />
  );
};

Login.rota = "/";

export default Login;
