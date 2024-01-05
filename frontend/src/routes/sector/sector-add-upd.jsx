import { Container, useTheme } from "@mui/material";
import React, { useCallback } from "react";
import { useToggle } from "react-use";
import { EntradaForm, H6 } from "../../components";
import * as yup from "yup";
import { VALIDADOR_TIPO, obterValidador } from "../../utils/validadores";
import { useDispatch } from "react-redux";
import { sectorAddUpd } from "./sector-actions";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";

const STR = {
  labelSector: "Setor",
  labelSituation: "O setor esta ativo ?",
  errorSector: "* O Setor deve ter ao menos 2 letras",
  errorSituation: "* A situação deve ser escolhida",
  titleAdd: "Adicionando novo setor",
  titleUpd: "Editando o setor",
  situationActive: "SIM",
  situationDeactivate: "NÃO",
};

const FIELDS_FORM = {
  sector: "name",
  situation: "situation",
};

function SectorAddUpd({ sector }) {
  const isMobile = useTheme()?.isMobile;

  const history = useHistory();

  const dispatch = useDispatch();

  const [wait, setWait] = useToggle();

  const sectorFromMobile = useLocation()?.state;

  const sectorForm = sectorFromMobile || sector;

  const schema = [
    {
      type: "text",
      name: FIELDS_FORM.sector,
      label: STR.labelSector,
      placeholder: STR.labelSector,
      defaultValue: sectorForm ? sectorForm.name : null,
    },
    {
      type: "radio",
      orientation: "horizontal",
      itens: [
        ["A", STR.situationActive],
        ["B", STR.situationDeactivate],
      ],
      defaultValue: sectorForm ? sectorForm.situation : null,
      name: FIELDS_FORM.situation,
      label: STR.labelSituation,
      placeholder: STR.labelSituation,
    },
  ];
  //
  const schemaMessageError = {
    [FIELDS_FORM.sector]: STR.errorSector,
    [FIELDS_FORM.situation]: STR.errorSituation,
  };
  //
  const schemaValidator = yup.object().shape({
    [FIELDS_FORM.sector]: obterValidador(VALIDADOR_TIPO.texto, 2),
    [FIELDS_FORM.situation]: obterValidador(VALIDADOR_TIPO.texto, 1),
  });
  //
  const onSubmit = useCallback(
    (val) => {
      const obj = {
        [FIELDS_FORM.sector]: val[FIELDS_FORM.sector],
        [FIELDS_FORM.situation]: val[FIELDS_FORM.situation],
      };
      if (sectorForm) {
        obj.id = sectorForm.id;
      }
      let fn;
      if (isMobile) {
        fn = history.goBack;
      }
      // Atualizar/incluir novo sector
      dispatch(sectorAddUpd(obj, setWait, fn));
    },
    [history, isMobile, sectorForm, setWait, dispatch]
  );
  return (
    <Container maxWidth={false}>
      <H6>{!sector ? STR.titleAdd : STR.titleUpd}</H6>
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

SectorAddUpd.rota = "/sector_view_add_upd";

export default SectorAddUpd;
