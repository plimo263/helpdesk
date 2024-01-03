import { Stack } from "@mui/material";
import React, { useCallback } from "react";
import * as yup from "yup";
import { VALIDADOR_TIPO, obterValidador } from "../../utils/validadores";
import { EntradaForm, H6 } from "../../components";
import { useToggle } from "react-use";
import { useDispatch, useSelector } from "react-redux";
import { selectColaboradoresFormatados } from "./helpdesk-seletores";
import { helpdeskUpdInvolved } from "./helpdesk-actions";

const STR = {
  title: "Alterar lista de colaboradores em cópia",
  labelInvolved: "Colaboradores em Cópia",
  errorInvolved: "* Escolha ao menos 1 colaborador",
};

const FIELD_FORM = {
  involved: "copia_chamado",
};

function HelpdeskAlterarEnvolvidos({ idTicket, envolvidos }) {
  const [wait, setWait] = useToggle();
  const dispatch = useDispatch();
  const listOfColabs = useSelector(selectColaboradoresFormatados);

  const schema = [
    {
      type: "select",
      name: FIELD_FORM.involved,
      label: STR.labelInvolved,
      itens: listOfColabs,
      isMulti: true,
      autoFormat: true,
      defaultValue: envolvidos?.map((ele) => [
        ele.id_usuario,
        `${ele.nome} - ${ele.email}`,
      ]),
      placeholder: STR.labelInvolved,
    },
  ];

  const schemaMessageError = {
    [FIELD_FORM.involved]: STR.errorInvolved,
  };

  const schemaValidator = yup.object().shape({
    [FIELD_FORM.involved]: obterValidador(VALIDADOR_TIPO.selectMultiplo),
  });
  //
  const onSubmit = useCallback(
    (val) => {
      const obj = {
        id_ticket: idTicket,
        [FIELD_FORM.involved]: val[FIELD_FORM.involved].map((ele) =>
          parseInt(ele.value)
        ),
      };

      dispatch(helpdeskUpdInvolved(obj, setWait));
    },
    [setWait, dispatch, idTicket]
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

export default HelpdeskAlterarEnvolvidos;
