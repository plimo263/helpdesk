import {
  Box,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  Grow,
  Stack,
  Switch,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback } from "react";
import _ from "lodash";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useSet, useToggle } from "react-use";
import { SemDados, EntradaForm, H6, Icone } from "../../components";
import { obterValidador, VALIDADOR_TIPO } from "../../utils/validadores";
import { rotuloFiltroAvancado } from "./helpdesk";
import {
  selectAgentesFormatado,
  selectStatusFormatado,
  selectAssuntos,
  selectColaboradores,
} from "./helpdesk-seletores";
import { helpdeskFiltroAdd } from "./helpdesk-actions";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";

export const selectColaboradoresFormatadosFiltro = createSelector(
  selectColaboradores,
  (val) => {
    return _.map(val, (item) => [
      `${item.id_usuario}`,
      `${item.nome} - ${item.email}`,
    ]);
  }
);

const rotuloFiltroAvancadoTicket = "Ticket";
const rotuloFiltroAvancadoAssunto = "Assunto";
const rotuloFiltroAvancadoAgente = "Agente";
const rotuloFiltroAvancadoStatus = "Status";
const rotuloFiltroAvancadoAtrasado = "Atrasado";
const rotuloFiltroAvancadoSolicitante = "Solicitante";
//
const rotuloFiltroAvancadoExcluir = "Deseja realmente excluir o filtro ?";

//
const HELPDESK_FILTRO_SALVO = "HELPDESK_FILTRO_STORAGE";

const helpdeskObterFiltrosAvancadosSalvos = () => {
  const localStorage = window.localStorage || null;

  if (localStorage && localStorage.getItem(HELPDESK_FILTRO_SALVO)?.length > 0) {
    const filtros = JSON.parse(localStorage.getItem(HELPDESK_FILTRO_SALVO));
    const listaFiltros = _.map(_.keys(filtros), (k) => ({
      titulo: k,
      valor: filtros[k],
    }));
    return listaFiltros;
  }
  return [];
};
//
const helpdeskSalvarFiltrosAvancados = (nome, valores) => {
  const localStorage = window.localStorage || null;
  if (!localStorage) {
    alert("Sem acesso ao recurso de gravação local");
    return false;
  }
  if (localStorage.getItem(HELPDESK_FILTRO_SALVO)?.length > 0) {
    const filtros = JSON.parse(localStorage.getItem(HELPDESK_FILTRO_SALVO));
    filtros[nome] = valores;
    localStorage.setItem(HELPDESK_FILTRO_SALVO, JSON.stringify(filtros));
  } else {
    localStorage.setItem(
      HELPDESK_FILTRO_SALVO,
      JSON.stringify({ [nome]: valores })
    );
  }
};
//
const helpdeskExcluirFiltrosAvancados = (nome) => {
  const localStorage = window.localStorage || null;
  if (!localStorage) {
    return false;
  }

  if (localStorage.getItem(HELPDESK_FILTRO_SALVO)?.length > 0) {
    const filtros = JSON.parse(localStorage.getItem(HELPDESK_FILTRO_SALVO));
    const novo = {};
    _.forEach(_.keys(filtros), (k) => {
      if (k !== nome) {
        novo[k] = filtros[k];
      }
    });

    localStorage.setItem(HELPDESK_FILTRO_SALVO, JSON.stringify(novo));
  }
};

function HelpdeskFiltroAvancado() {
  const tituloFiltroAvancado = "Escolha o filtro a ser aplicado";
  const tituloSemFiltroSelecionado = "Nenhum filtro selecionado";
  const rotuloFiltroAvancadoSalvar = "Salvar Filtro";
  const rotuloPerguntaSalvarFiltro = "Defina um nome para o filtro";

  //
  const dispatch = useDispatch();
  const [set, { has, toggle }] = useSet(new Set([]));
  const [salvarFiltro, setSalvarFiltro] = useToggle();
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));
  const history = useHistory();
  const largura = useTheme().breakpoints.values.md;

  const tiposDeFiltro = [
    //{ rotulo: rotuloFiltroAvancadoTicket, icone: "ConfirmationNumber" },
    { rotulo: rotuloFiltroAvancadoAssunto, icone: "Edit" },
    { rotulo: rotuloFiltroAvancadoAgente, icone: "Engineering" },
    { rotulo: rotuloFiltroAvancadoStatus, icone: "SwapHoriz" },
    { rotulo: rotuloFiltroAvancadoAtrasado, icone: "Schedule" },
    { rotulo: rotuloFiltroAvancadoSolicitante, icone: "Person" },
  ];
  //
  const onSubmit = useCallback(
    (valor) => {
      const itens = [];
      Object.keys(valor).forEach((k) => {
        itens.push([
          k,
          Array.isArray(valor[k])
            ? _.map(valor[k], (arr) => arr.value).join(",")
            : k === "atrasado"
            ? valor[k]
            : valor[k].value,
        ]);
      });
      // Para salvar os filtros avancados
      if (salvarFiltro) {
        const nome = window.prompt(rotuloPerguntaSalvarFiltro);
        if (nome) {
          helpdeskSalvarFiltrosAvancados(nome, itens);
        }
      }
      // Se for mobile devemos retornar a pagina
      let funcaoRetornarSucesso;

      if (isMobile) {
        funcaoRetornarSucesso = history.goBack;
      }
      const parametros = new URLSearchParams(itens);

      dispatch(
        helpdeskFiltroAdd(
          parametros,
          rotuloFiltroAvancado,
          funcaoRetornarSucesso
        )
      );
    },
    [dispatch, salvarFiltro, isMobile, history]
  );
  return (
    <Container
      maxWidth="lg"
      sx={{ width: !isMobile ? largura : "auto", minHeight: "50vh" }}
    >
      <H6>{tituloFiltroAvancado}</H6>
      <Divider sx={{ my: 1 }} />
      <Stack
        direction="row"
        sx={{ width: "100%", overflowX: "auto" }}
        spacing={1}
      >
        {tiposDeFiltro.map((ele, idx) => (
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
      {set.size === 0 ? (
        <SemDados titulo={tituloSemFiltroSelecionado} />
      ) : (
        <Grow in unmountOnExit>
          <Box>
            <HelpdeskFiltroAvancadoForm
              filtros={[...set]}
              onSubmit={onSubmit}
            />
            <FormControlLabel
              control={<Switch />}
              onChange={setSalvarFiltro}
              value={salvarFiltro}
              label={rotuloFiltroAvancadoSalvar}
            />
          </Box>
        </Grow>
      )}
      <HelpdeskFiltroAvancadoSalvo />
    </Container>
  );
}

const HelpdeskFiltroAvancadoForm = ({ filtros, onSubmit }) => {
  const erroFiltroAvancadoTicket = "* Favor informar ao menos 1";
  const erroFiltroAvancadoAssunto = "* Favor escolher ao menos 1";
  const erroFiltroAvancadoAgente = "* Favor escolher ao menos 1 agente";
  const erroFiltroAvancadoStatus = "* Favor escolher ao menos 1 status";
  const erroFiltroAvancadoSolicitante =
    "* Favor escolher ao menos 1 solicitante";
  //
  const ticketLista = [];
  const ticketAssunto = useSelector(selectAssuntos);
  const ticketStatus = useSelector(selectStatusFormatado);
  const ticketAgentes = useSelector(selectAgentesFormatado);
  const ticketSolicitantes = useSelector(selectColaboradoresFormatadosFiltro);

  const schema = [];
  const schemaMessageError = {};
  let schemaValidator = {};
  filtros.forEach((ele) => {
    switch (ele) {
      case rotuloFiltroAvancadoAtrasado:
        schema.push({
          label: rotuloFiltroAvancadoAtrasado,
          type: "switch",
          name: "atrasado",
        });
        break;
      case rotuloFiltroAvancadoTicket:
        schema.push({
          label: rotuloFiltroAvancadoTicket,
          type: "select",
          name: "ticket_id",
          isMulti: true,
          autoFormat: true,
          itens: ticketLista,
        });
        schemaMessageError.ticket_id = erroFiltroAvancadoTicket;
        schemaValidator.ticket_id = obterValidador(
          VALIDADOR_TIPO.selectMultiplo
        );
        break;
      case rotuloFiltroAvancadoAssunto:
        schema.push({
          label: rotuloFiltroAvancadoAssunto,
          type: "select",
          name: "assunto",
          isMulti: true,
          autoFormat: true,
          itens: ticketAssunto,
        });
        schemaMessageError.assunto = erroFiltroAvancadoAssunto;
        schemaValidator.assunto = obterValidador(VALIDADOR_TIPO.selectMultiplo);
        break;
      case rotuloFiltroAvancadoAgente:
        schema.push({
          label: rotuloFiltroAvancadoAgente,
          type: "select",
          name: "agente",
          isMulti: true,
          autoFormat: true,
          itens: ticketAgentes,
        });
        schemaMessageError.agente = erroFiltroAvancadoAgente;
        schemaValidator.agente = obterValidador(VALIDADOR_TIPO.selectMultiplo);
        break;
      case rotuloFiltroAvancadoSolicitante:
        schema.push({
          label: rotuloFiltroAvancadoSolicitante,
          type: "select",
          name: "solicitante",
          isMulti: true,
          autoFormat: true,
          itens: ticketSolicitantes,
        });
        schemaMessageError.solicitante = erroFiltroAvancadoSolicitante;
        schemaValidator.solicitante = obterValidador(
          VALIDADOR_TIPO.selectMultiplo
        );
        break;
      case rotuloFiltroAvancadoStatus:
      default:
        schema.push({
          label: rotuloFiltroAvancadoStatus,
          type: "select",
          name: "status",
          autoFormat: true,
          isMulti: true,
          itens: ticketStatus,
        });
        schemaMessageError.status = erroFiltroAvancadoStatus;
        schemaValidator.status = obterValidador(VALIDADOR_TIPO.selectMultiplo);
        break;
    }
  });
  //
  schemaValidator = yup.object().shape(schemaValidator);

  return (
    <EntradaForm
      schema={schema}
      schemaMessageError={schemaMessageError}
      schemaValidator={schemaValidator}
      onSubmit={onSubmit}
    />
  );
};
//
const HelpdeskFiltroAvancadoSalvo = () => {
  const tituloFiltroAvancadoFiltrosSalvos = "Meus filtros salvos";
  const dispatch = useDispatch();
  const [, setToggle] = useToggle();
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));
  const history = useHistory();
  const listaFiltroSalvos = helpdeskObterFiltrosAvancadosSalvos();

  const funcaoAplicarFiltro = useCallback(
    (filtro) => {
      const parametros = new URLSearchParams(filtro);
      let funcaoRetornarSucesso;
      if (isMobile) {
        funcaoRetornarSucesso = history.goBack;
      }
      dispatch(
        helpdeskFiltroAdd(
          parametros,
          rotuloFiltroAvancado,
          funcaoRetornarSucesso
        )
      );
    },
    [dispatch, isMobile, history]
  );
  //
  const funcaoExcluirFiltro = useCallback(
    (nome) => {
      if (window.confirm(rotuloFiltroAvancadoExcluir)) {
        helpdeskExcluirFiltrosAvancados(nome);
        setToggle();
      }
    },
    [setToggle]
  );

  return (
    <>
      {listaFiltroSalvos?.length > 0 && (
        <H6>{tituloFiltroAvancadoFiltrosSalvos}</H6>
      )}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {listaFiltroSalvos?.map((ele) => (
          <Chip
            onDelete={() => funcaoExcluirFiltro(ele.titulo)}
            label={ele.titulo}
            key={ele.titulo}
            clickable
            onClick={() => funcaoAplicarFiltro(ele.valor)}
            variant="outlined"
            color="primary"
          />
        ))}
      </Stack>
    </>
  );
};

HelpdeskFiltroAvancado.rota = "/helpdesk_filtro_avancado";

export default HelpdeskFiltroAvancado;
