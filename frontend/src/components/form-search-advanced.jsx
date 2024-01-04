import React, { useCallback } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { EntradaForm, H6, Icone, SemDados } from "./index";

import { useSet, useToggle } from "react-use";
import { Chip, FormControlLabel, Stack, Switch } from "@mui/material";
import * as yup from "yup";
import { useMemo } from "react";
import { toast } from "react-toastify";
// Obtem os filtros salvos
const getFilters = (inNameFilter) => {
  const nameFilter =
    inNameFilter ||
    window.location.pathname.substring(1, window.location.pathname.length);
  const localStorage = window.localStorage || null;

  if (localStorage && localStorage.getItem(nameFilter)?.length > 0) {
    const filtros = JSON.parse(localStorage.getItem(nameFilter));
    const listaFiltros = _.map(_.keys(filtros), (k) => ({
      titulo: k,
      valor: filtros[k],
    }));
    return listaFiltros;
  }
  return [];
};
// Salva um novo filtro
const saveFilters = (nome, valores, inNameFilter) => {
  const nameFilter =
    inNameFilter ||
    window.location.pathname.substring(1, window.location.pathname.length);
  const localStorage = window.localStorage || null;
  if (!localStorage) {
    alert("Sem acesso ao recurso de gravação local");
    return false;
  }
  if (localStorage.getItem(nameFilter)?.length > 0) {
    const filtros = JSON.parse(localStorage.getItem(nameFilter));
    filtros[nome] = valores;
    localStorage.setItem(nameFilter, JSON.stringify(filtros));
  } else {
    localStorage.setItem(nameFilter, JSON.stringify({ [nome]: valores }));
  }
};
// Deleta um filtro existente
const deleteFilter = (nome, inNameFilter) => {
  const nameFilter =
    inNameFilter ||
    window.location.pathname.substring(1, window.location.pathname.length);
  const localStorage = window.localStorage || null;
  if (!localStorage) {
    return false;
  }

  if (localStorage.getItem(nameFilter)?.length > 0) {
    const filtros = JSON.parse(localStorage.getItem(nameFilter));
    const novo = {};
    _.forEach(_.keys(filtros), (k) => {
      if (k !== nome) {
        novo[k] = filtros[k];
      }
    });

    localStorage.setItem(nameFilter, JSON.stringify(novo));
  }
};
// Componente dos filtros avancados salvos
const FilterAdvancedSaveds = ({ onFilter, nameFilter }) => {
  const [, setToggle] = useToggle();
  const listFiltersSaved = getFilters(nameFilter);
  const fnApplyFilter = useCallback(
    (filter) => {
      onFilter(filter);
    },
    [onFilter]
  );
  //
  const fnDropFilter = useCallback(
    (nome) => {
      if (window.confirm("Deseja realmente excluir o filtro ?")) {
        deleteFilter(nome, nameFilter);
        setToggle();
      }
    },
    [setToggle, nameFilter]
  );

  return (
    <>
      {listFiltersSaved?.length > 0 && <H6>Meus filtros salvos</H6>}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {listFiltersSaved?.map((ele) => (
          <Chip
            onDelete={() => fnDropFilter(ele.titulo)}
            label={ele.titulo}
            key={ele.titulo}
            clickable
            onClick={() => fnApplyFilter(ele.valor)}
            variant="outlined"
            color="primary"
          />
        ))}
      </Stack>
    </>
  );
};

function FormSearchAdvanced({ filters, onFilter, nameFilter }) {
  const [saveNameFilter, setSaveNameFilter] = useToggle();
  const [set, { has, toggle }] = useSet(new Set([]));
  //
  let filterSelected = useMemo(() => [], []);
  if (set.size > 0) {
    filterSelected = _.filter(filters, (item) => has(item.rotulo));
  }
  //
  const onSubmit = useCallback(
    (val) => {
      const obj = {};
      _.forEach(filterSelected, (arr) => {
        obj[arr.name] = val[arr.name];
      });
      // Veja se foi escolhido salvar o nome do filtro
      if (saveNameFilter) {
        const nameOfFilter = prompt(
          "Informe o nome do filtro que deseja salvar"
        );
        if (nameOfFilter.length === 0) {
          alert("Nome não informado, filtro não pode ser salvo.");
        } else {
          saveFilters(nameOfFilter, obj, nameFilter);
          toast.dark(`Filtro "${nameOfFilter}" salvo com sucesso !!!`, {
            type: "success",
          });
        }
      }
      onFilter(obj);
    },
    [onFilter, nameFilter, saveNameFilter, filterSelected]
  );
  return (
    <>
      <Stack
        direction="row"
        sx={{ width: "100%", overflowX: "auto", mb: 1 }}
        spacing={1}
      >
        {_.map(filters, (ele, idx) => (
          <Chip
            key={idx}
            clickable
            color="primary"
            onClick={() => toggle(ele.rotulo)}
            label={ele.rotulo}
            variant={has(ele.rotulo) ? "filled" : "outlined"}
            icon={<Icone icone={ele.icone} />}
          />
        ))}
      </Stack>
      {filterSelected.length === 0 ? (
        <SemDados titulo="Escolha um filtro para começar" />
      ) : (
        <>
          <FormFilter filters={filterSelected} onSubmit={onSubmit} />
          <FormControlLabel
            title="Marque caso deseje salvar o filtro criado"
            label="Salvar Filtro"
            control={<Switch />}
            checked={saveNameFilter}
            onChange={(e) => setSaveNameFilter(e.target.checked)}
          />
        </>
      )}
      <FilterAdvancedSaveds onFilter={onFilter} nameFilter={nameFilter} />
    </>
  );
}
//
const FormFilter = ({ filters, onSubmit }) => {
  const schema = [];
  let schemaValidator = {};
  const schemaMessageError = {};

  _.forEach(filters, (item) => {
    schema.push({
      label: item.rotulo,
      type: item.type,
      itens: item?.itens,
      name: item.name,
      defaultValue: item.defaultValue,
      ...item,
    });
    //
    schemaMessageError[item.name] = item.erro;
    schemaValidator[item.name] = item.validador;
  });
  //
  schemaValidator = yup.object().shape(schemaValidator);

  return (
    <EntradaForm
      onSubmit={onSubmit}
      schema={schema}
      schemaMessageError={schemaMessageError}
      schemaValidator={schemaValidator}
    />
  );
};

FormSearchAdvanced.propTypes = {
  /** Uma lista com os campos que serão utilizados para montar o formulário e os icones de filtro dos campos.  */
  filter: PropTypes.arrayOf(
    PropTypes.shape({
      /** O nome do icone (vide Material Icons) que será usado no seletor de campos para busca */
      icone: PropTypes.string.isRequired,
      /** O nome do filtro que vai ser usado para acompanhar este icone */
      rotulo: PropTypes.string.isRequired,
      /** Um objeto do yup usado para validar o campo em questão. Por exemplo validar strings seria yup.string().required() */
      validador: PropTypes.object.isRequired,
      /** Uma string que será exibida ao campo quando a validação do campo não estiver correta */
      erro: PropTypes.string,
      /** Props que permite definir um titulo sobre a questão enviada */
      titulo: PropTypes.string,
      /** Props que permite definir uma descricao sobre a questão enviada */
      descricao: PropTypes.string,
      /** Props para você estilizar o titulo da pergunta com cor, tamanho da fonte, alinhamento etc.. */
      tituloTipografia: PropTypes.object,
      /** Props para você estilizar a descricao da pergunta com cor, tamanho da fonte, alinhamento etc.. */
      descricaoTipografia: PropTypes.object,
      /** Uma props para formatacao de numero de tamanho conhecido e esperado, como telefone, cpf etc... Deve ser um array com cada numero sendo um item do array em expressão regular */
      mask: PropTypes.array,
      /** Uma props que permite definir este campo como um numérico de valor outras opcoes podem ser repassadas usando o mdelo de react-text-mask */
      toMoney: PropTypes.shape({
        prefix: PropTypes.string,
        thousandsSeparatorSymbol: PropTypes.oneOf([".", ","]),
        allowDecimal: PropTypes.bool,
        decimalSymbol: PropTypes.oneOf([".", ","]),
        decimalLimit: PropTypes.number,
        integerLimit: PropTypes.number,
      }),
      /** Estilização para o Wrapper que envolve cada campo ele é um paper  */
      wrapperPaperProps: PropTypes.object,
      /** Quando usado esta props recebe uma funcao de callback com o valor do campo informado na props exibirSe.ouvir global. Ele deve retornar o novo valor do item (caso Select e Radio) */
      exibirSe: PropTypes.func,
      /** Uma string que represente o icone */
      icon: PropTypes.string,
      /** Os tipos dos itens */
      type: PropTypes.oneOf([
        "time",
        "select",
        "text",
        "textarea",
        "number",
        "date",
        "checkbox",
        "switch",
        "file",
        "radio",
        "textrich",
        "date_range",
      ]).isRequired,
      /** O valor default do item */
      defaultValue: PropTypes.string,
      /** Boleano para valor default */
      defaultChecked: PropTypes.bool,
      /** Nome que vai identificar o campo no formulario */
      name: PropTypes.string.isRequired,
      /** Rótulo para o campo  */
      label: PropTypes.string,
      /** Sistema de grid para distribuir campos de formulario ({xs: 12, md: 6 }) */
      grid: PropTypes.object,
      /** Propriedades extras que serão expandidas no campo (podem ser props do Mui ou do ReactSelect) */
      extraProps: PropTypes.object,
      /** Um array para o select determinar os itens que farão parte do select */
      itens: PropTypes.array,
      /** Propriedade do select para autoFormataçao do campo itens e defaultValue */
      autoFormat: PropTypes.bool,
      /** Um numero que determina o limite maximo de caracteres digitados */
      maxLength: PropTypes.number,
      /** Um contador para o campo. Campos que tem maxLength já levam contador automatico */
      counter: PropTypes.bool,
      /** Um parametro para controlaro tamanho do item em radioForm */
      size: PropTypes.oneOf(["small", "medium", "large"]),
    })
  ).isRequired,
  /** Uma função de callback que tem a responsabilidade de receber o objeto dos dados selecionados. */
  onFilter: PropTypes.func.isRequired,
  /** Nome chave do filtro que será salvo no localStorage. Por padrão ele usa o nome da rota (sem a barra) para salvar os filtros */
  nameFilter: PropTypes.string,
};

export default FormSearchAdvanced;
