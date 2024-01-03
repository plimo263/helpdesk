import { Stack } from "@mui/material";
import React, { useCallback } from "react";
import { EntradaForm, H6 } from "../../components";
import { useDispatch } from "react-redux";
import { VALIDADOR_TIPO, obterValidador } from "../../utils/validadores";
import { useToggle } from "react-use";
import * as yup from "yup";
import { helpdeskAddUpdStatus } from "./helpdesk-actions";

const STR = {
  title: "Adicionar Status",
  titleUpd: "Atualizar Status",
  labelName: "Nome do status",
  labelAuthorized: "Autorizado Interagir",
  labelSituation: "Situação",
  labelColor: "Cor",
  errorName: "* Nome deve ter ao menos 3 caracteres",
  errorAuthorized: "* Defina quem poderá interagir neste status",
  erroSituation: "* Escolha entre ativar ou desativar o assunto",
  errorColor: "* Escolha uma cor para o status",
  labelBtn: "Salvar",
  placeholderName: "Nome do status",
  placeholderAuthorized: "Autorizado Interagir",
  placeholderSituation: "Situação",
  placeholderColor: "Cor",
};

const FIELDS = {
  name: "nome",
  authorized: "autorizado_interagir",
  situation: "situacao",
  color: "cor",
};
//
const situationOptions = [
  ["A", "Ativado"],
  ["B", "Desativado"],
];
//
const authOptions = [
  ["A", "Agente"],
  ["S", "Solicitante"],
];

function HelpdeskStatusAddUpd({
  id,
  descricao,
  autorizado_interagir,
  situacao,
  cor,
}) {
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
      },
    },
    {
      type: "radio",
      label: STR.labelAuthorized,
      name: FIELDS.authorized,
      orientation: "horizontal",
      defaultValue: autorizado_interagir || "",
      itens: authOptions,
      placeholder: STR.placeholderAuthorized,
      grid: {
        xs: 12,
        md: 6,
      },
    },
    {
      type: "radio",
      label: STR.labelSituation,
      name: FIELDS.situation,
      orientation: "horizontal",
      itens: situationOptions,
      defaultValue: situacao || "",
      placeholder: STR.placeholderSituation,
      grid: {
        xs: 12,
        md: 6,
      },
    },
    {
      type: "color_picker",
      label: STR.labelColor,
      name: FIELDS.color,
      defaultValue: cor || "",
      placeholder: STR.placeholderColor,
    },
  ];
  //
  const onSubmit = useCallback(
    (val) => {
      const obj = {
        [FIELDS.name]: val[FIELDS.name],
        [FIELDS.authorized]: val[FIELDS.authorized],
        [FIELDS.situation]: val[FIELDS.situation],
        [FIELDS.color]: val[FIELDS.color],
      };
      if (id) {
        obj.id_status = id;
      }
      console.log(obj);
      //
      dispatch(helpdeskAddUpdStatus(obj, setWait));
    },
    [dispatch, setWait, id]
  );
  //
  const schemaValidator = yup.object().shape({
    [FIELDS.name]: obterValidador(VALIDADOR_TIPO.texto, 3),
    [FIELDS.authorized]: obterValidador(VALIDADOR_TIPO.texto, 1),
    [FIELDS.situation]: obterValidador(VALIDADOR_TIPO.texto, 1),
    [FIELDS.color]: obterValidador(VALIDADOR_TIPO.texto, 7),
  });

  const schemaMessageError = {
    [FIELDS.name]: STR.errorName,
    [FIELDS.authorized]: STR.errorAuthorized,
    [FIELDS.situation]: STR.erroSituation,
    [FIELDS.color]: STR.errorColor,
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

export default HelpdeskStatusAddUpd;
