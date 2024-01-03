import { Stack } from "@mui/material";
import React, { useCallback } from "react";
import { EntradaForm, H6 } from "../../components";
import { useDispatch } from "react-redux";
import { VALIDADOR_TIPO, obterValidador } from "../../utils/validadores";
import { useToggle } from "react-use";
import * as yup from "yup";
import { helpdeskAddUpdAssunto } from "./helpdesk-actions";

const STR = {
  title: "Adicionar Assunto",
  titleUpd: "Atualizar assunto",
  labelName: "Nome do assunto",
  labelPraz: "Prazo (em dias)",
  labelSituation: "Situação",
  errorName: "* Nome deve ter ao menos 3 caracteres",
  errorPraz: "* Prazo deve ter ao menos 1 dia",
  erroSituation: "* Escolha entre ativar ou desativar o assunto",
  labelBtn: "Salvar",
  placeholderName: "Nome do assunto",
  placeholderPraz: "Prazo (em dias)",
  placeholderSituation: "Situação",
};

const FIELDS = {
  name: "nome",
  praz: "prazo",
  situation: "situacao",
};
//
const situationOptions = [
  ["A", "Ativado"],
  ["B", "Desativado"],
];

function HelpdeskAssuntoAddUpd({ id, descricao, prazo, situacao }) {
  const [wait, setWait] = useToggle();
  const dispatch = useDispatch();
  //
  const schema = [
    {
      type: "text",
      name: FIELDS.name,
      label: STR.labelName,
      defaultValue: descricao || "",
      placeholder: STR.placeholderName,
      grid: {
        xs: 12,
        md: 6,
      },
    },
    {
      type: "number",
      label: STR.labelPraz,
      name: FIELDS.praz,
      min: 1,
      defaultValue: prazo || "",
      placeholder: STR.placeholderPraz,
      grid: {
        xs: 12,
        md: 6,
      },
    },
    {
      type: "radio",
      name: FIELDS.situation,
      itens: situationOptions,
      defaultValue: situacao || "",
      placeholder: STR.placeholderSituation,
    },
  ];
  //
  const onSubmit = useCallback(
    (val) => {
      const obj = {
        [FIELDS.name]: val[FIELDS.name],
        [FIELDS.praz]: val[FIELDS.praz],
        [FIELDS.situation]: val[FIELDS.situation],
      };
      if (id) {
        obj.id_assunto = id;
      }
      //
      dispatch(helpdeskAddUpdAssunto(obj, setWait));
    },
    [dispatch, setWait, id]
  );
  //
  const schemaValidator = yup.object().shape({
    [FIELDS.name]: obterValidador(VALIDADOR_TIPO.texto, 3),
    [FIELDS.praz]: yup.number().min(1).required(),
    [FIELDS.situation]: obterValidador(VALIDADOR_TIPO.texto, 1),
  });

  const schemaMessageError = {
    [FIELDS.name]: STR.errorName,
    [FIELDS.praz]: STR.errorPraz,
    [FIELDS.situation]: STR.erroSituation,
  };
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

export default HelpdeskAssuntoAddUpd;
