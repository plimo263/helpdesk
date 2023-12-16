import { Stack } from "@mui/material";
import React, { useCallback, useEffect } from "react";
import { EntradaForm, H6 } from "../../components";
import { useToggle } from "react-use";
import { useDispatch } from "react-redux";
import { ToastErro } from "../../utils/toast-erro";
import useFetch from "../../hooks/use-fetch";
import * as yup from "yup";
import _ from "lodash";
import { VALIDADOR_TIPO, obterValidador } from "../../utils/validadores";
import { managerUserAddUpd } from "./manager-user-actions";

const FIELDS_FORM = {
  name: "name",
  email: "email",
  password: "password",
  isAgent: "is_agent",
  active: "active",
  idSector: "id_sector",
};

const OPTIONS = [
  ["S", "SIM"],
  ["N", "NÃO"],
];

const ICON_FORM = {
  name: "Person",
  email: "Email",
  password: "VpnKey",
  agent: "Engineering",
  active: "Edit",
  sector: "AccountTree",
};

const STR = {
  titleAdd: "Novo usuário no sistema",
  titleUpd: "Atualizando usuário no sistema",

  labelName: "Nome do usuário",
  labelEmail: "Email do usuário",
  labelPassword: "Senha do usuario",
  labelActive: "Usuario Ativo ?",
  labelIsAgent: "Usuário é agente ?",
  labelSector: "Setor de trabalho",

  errorName: "* Informe o nome",
  errorEmail: "* Informe o email",
  errorPassword: "* Mínimo de 6 caracteres.",
  errorActive: "* Diga se vai estar ativo ou não",
  errorIsAgent: "* Diga se vai ser um agente ou não",
  errorSector: "* Informe o setor de trabalho",
};

const ROUTES = ["/sector"];
//
const formatSector = (rows) => {
  const sectorsList = [];
  _.forEach(rows, (row) => {
    sectorsList.push([row.id, row.name]);
  });

  return sectorsList;
};

function ManagerUserAddUpd({ managerUser }) {
  const { data, setFetch, error } = useFetch(ROUTES[0], "GET");
  //
  useEffect(() => {
    setFetch({});
  }, [setFetch]);
  //
  useEffect(() => {
    if (error) ToastErro(error);
  }, [error]);
  //
  return (
    <Stack>
      <H6>{managerUser ? STR.titleUpd : STR.titleAdd}</H6>
      {data ? (
        <Form sectors={formatSector(data)} managerUser={managerUser} />
      ) : null}
    </Stack>
  );
}
//
const Form = ({ managerUser, sectors }) => {
  const [wait, setWait] = useToggle();
  const dispatch = useDispatch();
  let objValidatorError = {
    [FIELDS_FORM.name]: obterValidador(VALIDADOR_TIPO.texto, 3),
    [FIELDS_FORM.email]: obterValidador(VALIDADOR_TIPO.email),
    [FIELDS_FORM.idSector]: obterValidador(VALIDADOR_TIPO.selectUnico),
    [FIELDS_FORM.active]: obterValidador(VALIDADOR_TIPO.texto, 1),
    [FIELDS_FORM.isAgent]: obterValidador(VALIDADOR_TIPO.texto, 1),
  };
  let schema = [
    {
      type: "text",
      name: FIELDS_FORM.name,
      label: STR.labelName,
      placeholder: STR.labelName,
      icon: ICON_FORM.name,
      defaultValue: managerUser?.name || "",
    },
    {
      type: "email",
      name: FIELDS_FORM.email,
      label: STR.labelEmail,
      placeholder: STR.labelEmail,
      icon: ICON_FORM.email,
      defaultValue: managerUser?.email || "",
    },
  ];

  if (!managerUser) {
    schema.push({
      type: "password",
      name: FIELDS_FORM.password,
      label: STR.labelPassword,
      placeholder: STR.labelPassword,
      icon: ICON_FORM.password,
    });
    objValidatorError[FIELDS_FORM.password] = obterValidador(
      VALIDADOR_TIPO.texto,
      6
    );
  }
  schema = schema.concat([
    {
      type: "select",
      name: FIELDS_FORM.idSector,
      label: STR.labelSector,
      autoFormat: true,
      itens: sectors,
      placeholder: STR.labelSector,
      icon: ICON_FORM.sector,
      defaultValue: managerUser?.id
        ? [[managerUser?.sector?.id, managerUser?.sector?.name]]
        : "",
    },
    {
      type: "radio",
      name: FIELDS_FORM.isAgent,
      label: STR.labelIsAgent,
      itens: OPTIONS,
      placeholder: STR.labelIsAgent,
      icon: ICON_FORM.agent,
      orientation: "horizontal",
      defaultValue: managerUser?.is_agent || "",
      grid: {
        xs: 12,
        md: 6,
      },
    },

    {
      type: "radio",
      name: FIELDS_FORM.active,
      label: STR.labelActive,
      itens: OPTIONS,
      placeholder: STR.labelActive,
      icon: ICON_FORM.active,
      defaultValue: managerUser?.active || "",
      orientation: "horizontal",
      grid: {
        xs: 12,
        md: 6,
      },
    },
  ]);

  const schemaMessageError = {
    [FIELDS_FORM.name]: STR.errorName,
    [FIELDS_FORM.email]: STR.errorEmail,
    [FIELDS_FORM.password]: STR.errorPassword,
    [FIELDS_FORM.idSector]: STR.errorSector,
    [FIELDS_FORM.active]: STR.errorActive,
    [FIELDS_FORM.isAgent]: STR.errorIsAgent,
  };
  const schemaValidator = yup.object().shape(objValidatorError);
  //
  const onSubmit = useCallback(
    (val) => {
      const obj = {
        [FIELDS_FORM.name]: val[FIELDS_FORM.name],
        [FIELDS_FORM.email]: val[FIELDS_FORM.email],
        [FIELDS_FORM.idSector]: parseInt(val[FIELDS_FORM.idSector].value),
        [FIELDS_FORM.active]: val[FIELDS_FORM.active],
        [FIELDS_FORM.isAgent]: val[FIELDS_FORM.isAgent],
      };

      if (!managerUser) {
        obj[FIELDS_FORM.password] = val[FIELDS_FORM.password];
      }

      // Quando vai atualizar o usuario.
      if (managerUser) {
        obj.id = managerUser.id;
      }

      dispatch(managerUserAddUpd(obj, setWait));
    },
    [dispatch, managerUser, setWait]
  );

  return (
    <EntradaForm
      schema={schema}
      schemaMessageError={schemaMessageError}
      schemaValidator={schemaValidator}
      wait={wait}
      onSubmit={onSubmit}
    />
  );
};

export default ManagerUserAddUpd;
