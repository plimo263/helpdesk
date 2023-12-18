import { Stack } from "@mui/material";
import React, { useCallback } from "react";
import { useToggle } from "react-use";
import { EntradaForm, H6 } from "../../components";
import * as yup from "yup";
import { VALIDADOR_TIPO, obterValidador } from "../../utils/validadores";
import { useDispatch } from "react-redux";
import { sectorAddUpd } from "./sector-actions";

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
  const dispatch = useDispatch();
  const [wait, setWait] = useToggle();
  const schema = [
    {
      type: "text",
      name: FIELDS_FORM.sector,
      label: STR.labelSector,
      placeholder: STR.labelSector,
      defaultValue: sector ? sector.name : null,
    },
    {
      type: "radio",
      orientation: "horizontal",
      itens: [
        ["A", STR.situationActive],
        ["B", STR.situationDeactivate],
      ],
      defaultValue: sector ? sector.situation : null,
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
      if (sector) {
        obj.id = sector.id;
      }
      // Atualizar/incluir novo sector
      dispatch(sectorAddUpd(obj, setWait));
    },
    [sector, setWait, dispatch]
  );
  return (
    <Stack>
      <H6>{!sector ? STR.titleAdd : STR.titleUpd}</H6>
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

export default SectorAddUpd;
