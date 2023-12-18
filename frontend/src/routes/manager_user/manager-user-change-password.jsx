import React, { useCallback } from "react";
import * as yup from "yup";
import { VALIDADOR_TIPO, obterValidador } from "../../utils/validadores";
import { EntradaForm, H6 } from "../../components";
import { useDispatch } from "react-redux";
import { useToggle } from "react-use";
import { Stack } from "@mui/material";
import { managerUserResetPassword } from "./manager-user-actions";

const PASSWORD_MIN_CHARACTERS = 6;

const STR = {
  title: "Alteração de senha do usuário",
  labelPassword: "Senha",
  errorPassword: `* A senha deve ter ao menos ${PASSWORD_MIN_CHARACTERS} caracteres`,
};

const FIELDS_FORM = {
  password: "password",
};

function ManagerUserChangePassword({ managerUser }) {
  const [wait, setWait] = useToggle();
  const dispatch = useDispatch();

  const schema = [
    {
      type: "password",
      name: FIELDS_FORM.password,
      label: STR.labelPassword,
      placeholder: STR.labelPassword,
      icon: "VpnKey",
    },
  ];
  const schemaValidator = yup.object().shape({
    [FIELDS_FORM.password]: obterValidador(
      VALIDADOR_TIPO.texto,
      PASSWORD_MIN_CHARACTERS
    ),
  });
  const schemaMessageError = {
    [FIELDS_FORM.password]: STR.errorPassword,
  };
  //
  const onSubmit = useCallback(
    (val) => {
      dispatch(
        managerUserResetPassword(
          {
            id: managerUser.id,
            password: val.password,
          },
          setWait
        )
      );
    },
    [managerUser, dispatch, setWait]
  );
  //
  return (
    <Stack>
      <H6>{STR.title}</H6>

      <EntradaForm
        schema={schema}
        schemaMessageError={schemaMessageError}
        schemaValidator={schemaValidator}
        wait={wait}
        onSubmit={onSubmit}
      />
    </Stack>
  );
}

export default ManagerUserChangePassword;
