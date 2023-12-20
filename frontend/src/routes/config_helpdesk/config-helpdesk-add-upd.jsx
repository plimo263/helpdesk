import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { configHelpdeskAddUpd } from "./config-helpdesk-actions";
import * as yup from "yup";
import { Container } from "@mui/material";
import { EntradaForm, H6 } from "../../components";
import { useToggle } from "react-use";

const STR = {
  titleAdd: "Nova variável do sistema",
  titleUpd: "Alteração de variável",
  labelName: "Nome da variavel",
  labelValue: "Valor da variável",
  labelDescription: "Descrição da variavel",
  errorName: "* O nome deve ter ao menos 2 caracteres",
  errorValue: "* Campo obrigatorio",
  errorDescription: "* A descrição deve ter ao menos 2 caracteres",
};

const FIELDS_FORM = {
  name: "name",
  value: "value",
  description: "description",
};

function ConfigHelpdeskAddUpd({ item }) {
  const [wait, setWait] = useToggle();
  const dispatch = useDispatch();
  const schema = [
    {
      type: "text",
      name: FIELDS_FORM.name,
      label: STR.labelName,
      placeholder: STR.labelName,
      defaultValue: item?.name ? item.name : "",
    },
    {
      type: "text",
      name: FIELDS_FORM.value,
      label: STR.labelValue,
      placeholder: STR.labelValue,
      defaultValue: item?.value ? item.value : "",
    },
    {
      type: "textarea",
      name: FIELDS_FORM.description,
      label: STR.labelDescription,
      placeholder: STR.labelDescription,
      defaultValue: item?.description ? item.description : "",
      minRows: 3,
      multiline: true,
    },
  ];
  const schemaMessageError = {
    [FIELDS_FORM.name]: STR.errorName,
    [FIELDS_FORM.value]: STR.errorValue,
    [FIELDS_FORM.description]: STR.errorDescription,
  };
  const schemaValidator = yup.object().shape({
    [FIELDS_FORM.name]: yup.string().min(2).required(),
    [FIELDS_FORM.description]: yup.string().min(2).required(),
  });
  const onSubmit = useCallback(
    (val) => {
      const obj = {
        [FIELDS_FORM.name]: val[FIELDS_FORM.name],
        [FIELDS_FORM.value]: val[FIELDS_FORM.value],
        [FIELDS_FORM.description]: val[FIELDS_FORM.description],
      };
      if (item?.id) {
        obj.id = item.id;
      }

      dispatch(configHelpdeskAddUpd(obj, setWait));
    },
    [dispatch, item, setWait]
  );

  return (
    <Container maxWidth="md">
      <H6>{item?.id ? STR.titleUpd : STR.titleAdd}</H6>
      <EntradaForm
        schema={schema}
        schemaMessageError={schemaMessageError}
        schemaValidator={schemaValidator}
        wait={wait}
        onSubmit={onSubmit}
      />
    </Container>
  );
}

export default ConfigHelpdeskAddUpd;
