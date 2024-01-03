import React, { memo, useEffect, useState } from "react";
import {
  helpdeskFecharModal,
  helpdeskFiltroAdd,
  helpdeskFiltroLimpar,
  helpdeskInit,
  helpdeskInitEstatisticosUpdate,
  helpdeskPagina,
  helpdeskPaginaUpdate,
  helpdeskSetModal,
  ROTAS,
} from "./helpdesk-actions";
import { useSelector, useDispatch } from "react-redux";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Fab,
  Grid,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Slide,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  SemDados,
  Body1,
  Body2,
  Caption,
  H6,
  Icone,
  InputBusca,
  Pesquisando,
  ScrollInfinito,
} from "../../components";
import { useCallback } from "react";
import _ from "lodash";
import { blue, grey } from "@mui/material/colors";
import { useToggle } from "react-use";
import { motion, AnimatePresence } from "framer-motion";
import { DrawerDialog } from "../../components";
import { format, isDate, parseISO } from "date-fns";
import { useHistory } from "react-router-dom";
import { HelpdeskDetalhes } from ".";

import fetchGet from "../../api/fetch_mensagem";

import useSWR from "swr";
import {
  selectDados,
  selectIdPagina,
  selectIsAgente,
  selectIsSuperAgente,
  selectModal,
  selectSolicitante,
  selectStatus,
  selectUsuario,
} from "./helpdesk-seletores";
import HelpdeskAssunto from "./helpdesk-assunto";
import HelpdeskModal, { MODAL } from "./helpdesk-modal";
import HelpdeskStatus from "./helpdesk-status";
import HelpdeskAdicionar from "./helpdesk-adicionar";
import HelpdeskFiltroAvancado from "./helpdesk-filtro-avancado";
//
export const rotuloFiltroAvancado = "Filtro Avançado";
const rotuloFiltroAtrasado = "Atrasados";

//
const animacaoTickets = {
  initial: {
    opacity: 0.01,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0.01,
    transition: { duration: 0.01 },
  },
};
//
const alturaPagina = "calc(100vh - 72px)";

function HelpDesk() {
  const dispatch = useDispatch();
  const dados = useSelector(selectDados);
  const modal = useSelector(selectModal);
  const idPagina = useSelector(selectIdPagina);
  //
  const { data } = useSWR(`${ROTAS[0]}?pagina=${idPagina}`, fetchGet, {
    refreshInterval: 5e3,
  });
  //
  useEffect(() => {
    if (data) {
      dispatch(helpdeskPaginaUpdate(data));
    }
  }, [dispatch, data]);

  useEffect(() => {
    // Se ainda não tiver sido carregada a primeira pagina carregue-a
    if (!idPagina) {
      dispatch(helpdeskInit());
      dispatch(helpdeskPagina(1, () => {}));
    }

    // return () => {
    //   dispatch(helpdeskLimparDados());
    // };
  }, [dispatch, idPagina]);
  //
  const fecharModal = useCallback(
    () => dispatch(helpdeskFecharModal()),
    [dispatch]
  );
  return (
    <>
      {modal && (
        <DrawerDialog
          fnGetCorpo={() => <HelpdeskModal modal={modal} />}
          fecharModal={fecharModal}
        />
      )}
      {dados && <Corpo />}
    </>
  );
}
//
const Corpo = () => {
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));

  return isMobile ? <CorpoMobile /> : <CorpoDesktop />;
};
const CorpoMobile = () => {
  const history = useHistory();
  const dados = useSelector(selectDados);
  const onClickAddTicket = useCallback(() => {
    history.push(HelpdeskAdicionar.rota);
  }, [history]);

  return (
    <>
      {dados && <PainelPrincipalTicket isMobile />}
      <Fab
        onClick={onClickAddTicket}
        sx={{ position: "fixed", right: 16, bottom: 72 }}
        color="primary"
      >
        <Icone icone="Add" />
      </Fab>
    </>
  );
};
//
const CorpoDesktop = () => {
  const dados = useSelector(selectDados);

  return (
    <Grid container>
      <Grid item md={4} lg={3} xl={2}>
        <BarraLateral />
      </Grid>
      <Grid item md={8} lg={9} xl={10}>
        {dados && <PainelPrincipalTicket />}
      </Grid>
    </Grid>
  );
};
// Escolha pelo solicitante que você irá ver os tickets
const SolicitanteTicket = ({ anchorEl, setAnchorEl }) => {
  const tituloInfoSolicitante = "Todos os tickets abertos por este solicitante";
  const placeholderCampoBuscaSolicitanteTicket = "Digite o nome";
  //
  const solicitantes = useSelector(selectSolicitante);
  const [filtro, setFiltro] = useState("");
  //
  const isOpen = Boolean(anchorEl);
  const onFecharMenu = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);
  let exibicaoSolicitantes;
  if (filtro?.length > 0) {
    exibicaoSolicitantes = _.filter(
      solicitantes,
      (val) => _.toUpper(val.nome).search(_.toUpper(filtro)) !== -1
    );
  } else {
    exibicaoSolicitantes = solicitantes;
  }

  return (
    <Menu
      sx={{ maxHeight: "70vh", overflowY: "auto" }}
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onFecharMenu}
    >
      <Paper sx={{ mx: 1, position: "sticky", top: 0 }}>
        <InputBusca
          filtro={filtro}
          setFiltro={setFiltro}
          fullWidth
          desativarPesquisaLenta
          label=""
          placeholder={placeholderCampoBuscaSolicitanteTicket}
          sx={{ mb: 0 }}
        />
      </Paper>
      {exibicaoSolicitantes?.map((ele, idx) => (
        <MenuItem dense key={idx} title={tituloInfoSolicitante}>
          <SolicitanteTicketItem {...ele} onFecharMenu={onFecharMenu} />
        </MenuItem>
      ))}
    </Menu>
  );
};
const SolicitanteTicketItem = memo(
  ({ id_usuario, avatar, nome, email, grupo_acesso, onFecharMenu }) => {
    const dispatch = useDispatch();
    //
    const funcaoAplicarFiltroSolicitante = useCallback(() => {
      const parametros = new URLSearchParams();
      parametros.append("solicitante", id_usuario);
      dispatch(helpdeskFiltroAdd(parametros, "Solicitantes"));
      onFecharMenu();
    }, [dispatch, id_usuario, onFecharMenu]);
    //
    return (
      <ListItem dense divider onClick={funcaoAplicarFiltroSolicitante}>
        <ListItemAvatar>
          <Avatar src={avatar} />
        </ListItemAvatar>
        <ListItemText primary={`${email}`} secondary={nome} />
      </ListItem>
    );
  }
);
// Filtros do agente
const FiltrosAgente = () => {
  const rotuloFiltroAgente = "Sou Agente";
  const tituloFiltroAgente = "Exibe somente tickets onde eu sou o agente";
  const rotuloFiltroSolicitante = "Solicitantes";
  const tituloFiltroSolicitante =
    "Determina de qual solicitante deseja ver os tickets";
  //
  const dispatch = useDispatch();
  const { tipoDeFiltro } = useSelector(selectDados);
  const usuario = useSelector(selectUsuario);
  const [anchorEl, setAnchorEl] = useState();
  const onClickMenu = useCallback(
    (event) => {
      if (tipoDeFiltro === "Solicitantes") {
        dispatch(helpdeskFiltroLimpar());
        return false;
      }
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl, tipoDeFiltro, dispatch]
  );
  //

  // Funcao para aplicar filtro para o agente (vê somente tickets dele)
  const funcaoFiltroAgente = useCallback(() => {
    if (tipoDeFiltro === rotuloFiltroAgente) {
      dispatch(helpdeskFiltroLimpar());
    } else {
      const parametros = new URLSearchParams();
      const idUsuario = usuario.id;
      parametros.append("agente", idUsuario);
      dispatch(helpdeskFiltroAdd(parametros, "Sou Agente"));
    }
  }, [usuario, dispatch, tipoDeFiltro]);

  const filtrosRapidos = [
    {
      titulo: tituloFiltroAgente,
      rotulo: rotuloFiltroAgente,
      icone: <Icone icone="Engineering" />,
      onClick: funcaoFiltroAgente,
    },
    {
      titulo: tituloFiltroSolicitante,
      rotulo: rotuloFiltroSolicitante,
      icone: <Icone icone="Person" />,
      onClick: onClickMenu,
    },
  ];

  return (
    <>
      <SolicitanteTicket anchorEl={anchorEl} setAnchorEl={setAnchorEl} />
      {filtrosRapidos?.map((ele, idx) => (
        <Chip
          title={ele.titulo}
          onClick={ele.onClick}
          key={idx}
          label={ele.rotulo}
          icon={ele.icone}
          clickable
          variant={ele.rotulo === tipoDeFiltro ? "filled" : "outlined"}
          color="primary"
        />
      ))}
    </>
  );
};
//
const BarraLateral = () => {
  const tituloBotaoNovoTicket = "Clique para abrir um ticket";
  const rotuloBotaoNovoTicket = "NOVO TICKET";
  const tituloAssuntos = "Assuntos";
  const tituloStatus = "Status";
  //
  const isDark = useTheme().palette.mode === "dark";
  const dispatch = useDispatch();
  const history = useHistory();
  const { assunto, status, tipoDeFiltro } = useSelector(selectDados);
  const isSuperAgent = useSelector(selectIsSuperAgente);
  //
  //
  const { data } = useSWR(`${ROTAS[0]}?dados_estatisticos=true`, fetchGet, {
    refreshInterval: 1e3,
  });
  //
  useEffect(() => {
    if (data) {
      dispatch(helpdeskInitEstatisticosUpdate(data));
    }
  }, [dispatch, data]);
  //
  const onClickAddTicket = useCallback(() => {
    dispatch(
      helpdeskSetModal({
        tipo: MODAL.ADD_TICKET,
      })
    );
  }, [dispatch]);
  // Funcao de callback para manutencao de assunto
  const onClickManuSubject = useCallback(() => {
    history.push(HelpdeskAssunto.rota);
  }, [history]);
  // Funcao de callback para manutencao de status
  const onClickManuStatus = useCallback(() => {
    history.push(HelpdeskStatus.rota);
  }, [history]);

  // Funcao de callback que implementa o filtro
  const onClickAddFiltro = useCallback(
    (tipo, filtro, rotulo) => {
      // Limpa o filtro
      if (tipoDeFiltro === rotulo) {
        dispatch(helpdeskFiltroLimpar());
        return false;
      }
      const parametros = new URLSearchParams();
      parametros.append(tipo, filtro);
      dispatch(helpdeskFiltroAdd(parametros, rotulo));
    },
    [dispatch, tipoDeFiltro]
  );
  //
  const botoesAssuntos = _.map(assunto, (val) => ({
    titulo: val.descricao,
    rotulo: val.descricao,
    total: val.total,
    onClick: () => onClickAddFiltro("assunto", val.id, val.descricao),
  }));
  //
  const botoesStatus = _.map(status, (val) => ({
    titulo: val.descricao,
    rotulo: val.descricao,
    total: val.total,
    onClick: () => onClickAddFiltro("status", val.id, val.descricao),
  }));
  //
  let opcoesSuperAgente = [];

  if (isSuperAgent) {
    opcoesSuperAgente = [
      {
        icon: "Add",
        text: "MANUTENÇÃO ASSUNTO",
        onClick: onClickManuSubject,
        color: "success",
      },
      {
        icon: "Edit",
        text: "MANUTENÇÃO STATUS",
        onClick: onClickManuStatus,
        color: "warning",
      },
    ];
  }

  return (
    <Paper
      sx={{
        borderRadius: 0,
        p: 1,
        height: alturaPagina,
        overflowY: "auto",
        background: !isDark && blue[50],
        color: !isDark && "black",
      }}
      elevation={isDark ? 4 : 0}
    >
      <Stack>
        <Button
          variant="contained"
          color="primary"
          onClick={onClickAddTicket}
          title={tituloBotaoNovoTicket}
          startIcon={<Icone icone="ConfirmationNumber" />}
          sx={{ mb: 1 }}
        >
          {rotuloBotaoNovoTicket}
        </Button>
        {isSuperAgent && (
          <>
            {opcoesSuperAgente.map((ele, idx) => (
              <Button
                key={idx}
                size="small"
                variant="contained"
                color={ele.color}
                onClick={ele.onClick}
                title={tituloBotaoNovoTicket}
                startIcon={<Icone icone="ConfirmationNumber" />}
                sx={{ mb: 1 }}
              >
                {ele.text}
              </Button>
            ))}
          </>
        )}

        <Divider sx={{ mb: 1, mt: 2 }} />

        <H6>{tituloAssuntos}</H6>
        {botoesAssuntos.map((ele, idx) => (
          <BotaoFiltroPainelLateral
            {...ele}
            key={idx}
            isSelecionado={ele.rotulo === tipoDeFiltro}
          />
        ))}
        <Divider sx={{ my: 1 }} />
        <H6>{tituloStatus}</H6>
        {botoesStatus.map((ele, idx) => (
          <BotaoFiltroPainelLateral
            {...ele}
            key={idx}
            isSelecionado={ele.rotulo === tipoDeFiltro}
          />
        ))}
        <Divider sx={{ my: 1 }} />
      </Stack>
    </Paper>
  );
};
// Botoes para filtros
const BotaoFiltroPainelLateral = ({
  isSelecionado,
  titulo,
  total,
  rotulo,
  onClick,
}) => {
  const isDark = useTheme().palette.mode === "dark";
  return (
    <Button
      size="small"
      variant={isSelecionado ? "contained" : "text"}
      sx={{ my: 0.5, textTransform: "none" }}
      color="info"
      onClick={onClick}
    >
      <Stack sx={{ minWidth: "100%" }} title={titulo}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Body1
            sx={{ color: !isDark ? (isSelecionado ? "white" : "black") : null }}
          >
            {rotulo}
          </Body1>
          <Chip
            sx={{ fontWeight: 500, background: grey[300], color: "black" }}
            label={total ? total : 0}
          />
        </Stack>
      </Stack>
    </Button>
  );
};
// Painel principal para exibicao dos chamados
const PainelPrincipalTicket = memo(({ isMobile }) => {
  const tituloAnimacaoSemDados = "Não há tickets no filtro informado";

  //
  const isAgente = useSelector(selectIsAgente);
  const history = useHistory();
  const isDark = useTheme().palette.mode === "dark";
  const [aguardar] = useToggle();
  const dispatch = useDispatch();
  const {
    helpdesk,
    helpdeskFiltro,
    total_tickets,
    tipoDeFiltro,
    coluna,
    ordenar,
  } = useSelector(selectDados);
  //
  const funcaoFiltroAvancado = useCallback(() => {
    if (rotuloFiltroAvancado === tipoDeFiltro) {
      dispatch(helpdeskFiltroLimpar());
    } else {
      // Se for mobile abre em uma nova tela
      if (isMobile) {
        history.push(HelpdeskFiltroAvancado.rota);
      } else {
        dispatch(
          helpdeskSetModal({
            tipo: MODAL.ADVANCED_FILTER,
          })
        );
      }
    }
  }, [history, isMobile, dispatch, tipoDeFiltro]);
  //
  let corpo = helpdeskFiltro || helpdesk || [];
  const totalDeTickets = helpdeskFiltro ? helpdeskFiltro.length : total_tickets;
  // Veja se é para ordenar por aqui (caso de helpdeskFiltro)
  if (coluna && ordenar && helpdeskFiltro) {
    corpo = _.orderBy(
      corpo,
      (val) => {
        let inColunaFiltro;
        switch (coluna) {
          case "ultima_alteracao":
            inColunaFiltro = "ultima_interacao";
            break;
          default:
            inColunaFiltro = coluna;
            break;
        }
        return val[inColunaFiltro];
      },
      ordenar
    );
  }
  // Funcao para aplicar filtro para os atrasados
  const funcaoFiltroAtrasado = useCallback(() => {
    if (tipoDeFiltro === rotuloFiltroAtrasado) {
      dispatch(helpdeskFiltroLimpar());
    } else {
      const parametros = new URLSearchParams();
      parametros.append("atrasado", true);
      dispatch(helpdeskFiltroAdd(parametros, rotuloFiltroAtrasado));
    }
  }, [dispatch, tipoDeFiltro]);

  return (
    <Stack
      sx={{
        width: isMobile && "100%",
        minHeight: alturaPagina,
        background: !isDark && grey[200],
        mt: 1,
      }}
    >
      <Stack
        direction="row"
        sx={{
          width: "calc(100% - 16px)",
          overflowX: "auto",
          px: 1,
        }}
        spacing={1}
      >
        {isAgente && <FiltrosAgente />}

        <Chip
          label={rotuloFiltroAtrasado}
          icon={<Icone icone="Schedule" />}
          clickable
          color="primary"
          variant={
            rotuloFiltroAtrasado === tipoDeFiltro ? "filled" : "outlined"
          }
          onClick={funcaoFiltroAtrasado}
        />
        <Chip
          label={rotuloFiltroAvancado}
          icon={<Icone icone="FilterAlt" />}
          clickable
          color="primary"
          variant={
            rotuloFiltroAvancado === tipoDeFiltro ? "filled" : "outlined"
          }
          onClick={funcaoFiltroAvancado}
        />
      </Stack>

      <PainelPaginacao total={totalDeTickets} />
      {aguardar ? (
        <Pesquisando />
      ) : (
        <>
          {!isMobile && <CabecalhoTickets />}
          <AnimatePresence>
            {corpo && corpo.length > 0 ? (
              <motion.div {...animacaoTickets} key="ScrollFiltro">
                <ScrollInfinito
                  itens={corpo}
                  itensPorPagina={10}
                  tamanho="80vh"
                  render={(ele) => (
                    <Slide
                      direction="left"
                      key={ele.id}
                      in
                      mountOnEnter
                      unmountOnExit
                    >
                      <Box>
                        <TicketItem {...ele} isMobile={isMobile} />
                      </Box>
                    </Slide>
                  )}
                />
                {isMobile && (
                  <>
                    <br />
                    <br />
                    <br />
                    <br />
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div {...animacaoTickets} key="animacao">
                <SemDados titulo={tituloAnimacaoSemDados} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </Stack>
  );
});
//
const PainelPaginacao = memo(({ total }) => {
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));
  const rotuloComponentePaginacao = "Clique para alternar entre as paginas";
  //
  const dispatch = useDispatch();
  const { total_paginas, idPagina, tipoDeFiltro, coluna, ordenar } =
    useSelector(selectDados);
  const onChangePagina = useCallback(
    (evt, pageID) => {
      let objOrdenar;
      if (coluna && ordenar) {
        objOrdenar = {
          coluna,
          ordenar,
        };
      }
      dispatch(helpdeskPagina(pageID, () => {}, objOrdenar));
    },
    [dispatch, coluna, ordenar]
  );

  return (
    <>
      <Divider sx={{ mb: 1, mt: 2 }} />
      <Stack direction="row" justifyContent="space-between">
        <TotalizadorTicket total={total} />
        {!tipoDeFiltro && (
          <Pagination
            size={isMobile ? "small" : "medium"}
            title={rotuloComponentePaginacao}
            color="primary"
            count={total_paginas}
            page={idPagina}
            onChange={onChangePagina}
          />
        )}
      </Stack>
      <Divider sx={{ my: 1 }} />
    </>
  );
});
//
const CabecalhoTickets = memo(() => {
  const alinhamentoTexto = "center";
  const tituloCampoID = "ID";
  const tituloCampoSolcitante = "Solicitante";
  //const tituloCampoAssunto = "Assunto";
  const tituloCampoAgente = "Agente";
  const tituloCampoStatus = "Status";
  const tituloCampoTitulo = "Titulo";
  const tituloCampoUltimaInteracao = "Intera. / Prazo";
  //
  const dispatch = useDispatch();
  const { ordenar, idPagina, coluna } = useSelector(selectDados);

  const funcaoOrdenarTickets = useCallback(
    (inColuna) => {
      let inOrdenar = "desc";
      // E a mesma coluna
      if (coluna === inColuna) {
        switch (ordenar) {
          case "desc":
            inOrdenar = "asc";
            break;
          case "asc":
            inOrdenar = null;
            break;
          default:
            inOrdenar = "desc";
        }
      }

      // Desativar a ordenacao de coluna
      if (!inOrdenar) {
        dispatch(helpdeskPagina(idPagina, () => {}));
      } else {
        // Aplicar a ordenacao
        dispatch(
          helpdeskPagina(idPagina, () => {}, {
            coluna: inColuna,
            ordenar: inOrdenar,
          })
        );
      }
    },
    [dispatch, ordenar, coluna, idPagina]
  );
  //
  const cabecalhos = [
    {
      titulo: tituloCampoID,
      onClick: () => funcaoOrdenarTickets("id"),
      isOrdem: coluna === "id" && ordenar,
      sx: {},
    },
    {
      titulo: tituloCampoSolcitante,
      onClick: () => funcaoOrdenarTickets("solicitante"),
      isOrdem: coluna === "solicitante" && ordenar,
      sx: {
        textAlign: "left",
        flex: 1,
      },
    },
    {
      titulo: tituloCampoTitulo,
      onClick: () => funcaoOrdenarTickets("titulo"),
      isOrdem: coluna === "titulo" && ordenar,
      sx: {
        textAlign: alinhamentoTexto,
        flex: 1,
      },
    },
    {
      titulo: tituloCampoAgente,
      onClick: () => funcaoOrdenarTickets("agente"),
      isOrdem: coluna === "agente" && ordenar,
      sx: {
        textAlign: alinhamentoTexto,
        flex: 1,
      },
    },
    {
      titulo: tituloCampoStatus,
      onClick: () => funcaoOrdenarTickets("status"),
      isOrdem: coluna === "status" && ordenar,
      sx: {
        textAlign: alinhamentoTexto,
        flex: 1,
      },
    },
    {
      titulo: tituloCampoUltimaInteracao,
      onClick: () => funcaoOrdenarTickets("ultima_alteracao"),
      isOrdem: coluna === "ultima_alteracao" && ordenar,
      sx: {
        textAlign: alinhamentoTexto,
        flex: 1,
      },
    },
  ];

  return (
    <Paper elevation={0} sx={{ mb: 1 }}>
      <Stack
        sx={{ width: "100%" }}
        direction="row"
        alignItems="center"
        flexWrap="nowrap"
      >
        {cabecalhos.map((ele, idx) => (
          <CabecalhoTicketBotao
            key={idx}
            onClick={ele.onClick}
            isOrder={ele.isOrdem}
            titulo={ele.titulo}
            sx={ele.sx}
          />
        ))}
      </Stack>
    </Paper>
  );
});
//
const CabecalhoTicketBotao = memo(({ titulo, sx, onClick, isOrder }) => {
  const tituloBotaoTicketOrdenacao = "Clique para ordenar ";
  return (
    <Button
      onClick={onClick}
      title={tituloBotaoTicketOrdenacao}
      sx={{ ...sx, textTransform: "none" }}
      startIcon={
        <Icone
          icone={
            isOrder
              ? isOrder === "asc"
                ? "KeyboardArrowUp"
                : "KeyboardArrowDown"
              : "UnfoldMore"
          }
        />
      }
    >
      {titulo}
    </Button>
  );
});
//
const TotalizadorTicket = memo(({ total }) => {
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));
  const tituloTotalDeTickets = "Total de tickets criados";
  const tituloTickets = `${total === 0 ? "Nenhum" : total} ${
    total > 1 ? "Tickets" : "Ticket"
  }`;

  return (
    <Stack direction="row" spacing={1} title={tituloTotalDeTickets}>
      {!isMobile && <Icone icone="ConfirmationNumber" />}
      {isMobile ? (
        <Body2 sx={{ ml: 1 }}>{tituloTickets}</Body2>
      ) : (
        <Body1>{tituloTickets}</Body1>
      )}
    </Stack>
  );
});
//
const TicketItem = memo(
  ({
    id,
    solicitante,
    avatar,
    email,
    status,
    prazo,
    atrasado,
    assunto,
    agente,
    ultima_interacao,
    isMobile,
    titulo,
  }) => {
    const history = useHistory();
    const alinhamentoTexto = "center";
    const tituloTicket = "Clique para ver detalhes do Ticket";
    const rotuloTicketNumero = "Ticket N°";
    const rotuloTicketNaoAtribuido = "Não atribuido";
    const rotuloAssunto = "Assunto";
    const rotuloUltimaInteracao = "Interação";
    const rotuloAgente = "Agente";
    const tituloIndicadorAtrasado =
      "Este ticket encontra-se atrasado (o prazo se expirou)";
    const rotuloIndicadorAtrasado = "Atrasado";
    //
    const verDetalhesTicket = useCallback(() => {
      history.push(`${HelpdeskDetalhes.rota}?ticket=${id}`);
    }, [id, history]);

    const ultimaInteracao = format(
      isDate(ultima_interacao) ? ultima_interacao : parseISO(ultima_interacao),
      "dd/MM/yy HH:mm"
    );
    const dataPrazo = `Prazo final: ${format(
      isDate(prazo) ? prazo : parseISO(prazo),
      "dd/MM/yy"
    )}`;

    return (
      <Paper sx={{ my: 1 }} title={tituloTicket} elevation={1}>
        <ListItemButton dense onClick={verDetalhesTicket}>
          {isMobile ? (
            <ListItem dense disableGutters disablePadding>
              <ListItemAvatar>
                <Avatar alt={solicitante} src={avatar} />
              </ListItemAvatar>
              <ListItemText
                primaryTypographyProps={{
                  sx: {
                    mb: 1,
                  },
                }}
                primary={solicitante}
                secondary={
                  <Stack>
                    <Stack
                      sx={{ mb: 1 }}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Body1 fontWeight="bold">
                        {rotuloTicketNumero} {id}
                      </Body1>
                      <ChipStatus status={status} />
                    </Stack>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Caption>
                        {rotuloAssunto}: {assunto}
                      </Caption>
                      <Caption>
                        {rotuloAgente}:{" "}
                        {agente
                          ? _.capitalize(agente.split(" ")[0])
                          : rotuloTicketNaoAtribuido}
                      </Caption>
                    </Stack>
                    <Stack
                      sx={{ mt: 0.5 }}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Caption>
                        {rotuloUltimaInteracao}: {ultimaInteracao}
                      </Caption>
                    </Stack>
                  </Stack>
                }
              />
            </ListItem>
          ) : (
            <Stack
              sx={{ width: "100%" }}
              direction="row"
              alignItems="center"
              flexWrap="nowrap"
              spacing={1}
            >
              <H6
                sx={{ pr: 3 - id.toString().length }}
                align={alinhamentoTexto}
              >
                {id}
              </H6>

              <ListItem dense disableGutters sx={{ flex: 2 }}>
                <ListItemAvatar>
                  <Avatar alt={solicitante} src={avatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Body2>{solicitante}</Body2>
                      {atrasado && (
                        <Chip
                          title={tituloIndicadorAtrasado}
                          size="small"
                          label={rotuloIndicadorAtrasado}
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  }
                  secondary={email}
                />
              </ListItem>
              <Body1 sx={{ flex: 2 }}>{titulo}</Body1>
              {/* <Body1 sx={{ flex: 1 }} align={alinhamentoTexto}>
                {assunto}
              </Body1> */}
              <Body1 sx={{ flex: 2 }} align={alinhamentoTexto}>
                {agente || rotuloTicketNaoAtribuido}
              </Body1>
              <Box sx={{ flex: 1 }} align={alinhamentoTexto}>
                {status && <ChipStatus status={status} />}
              </Box>
              <ListItem dense disableGutters sx={{ flex: 1 }}>
                <ListItemText primary={ultimaInteracao} secondary={dataPrazo} />
              </ListItem>
              {/* <Body1 sx={{ flex: 1 }} align={alinhamentoTexto}>
                {ultimaInteracao}
              </Body1> */}
            </Stack>
          )}
        </ListItemButton>
      </Paper>
    );
  }
);
export const ChipStatus = ({ status, minimal }) => {
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));
  const listaStatus = useSelector(selectStatus);
  const corStatus = _.filter(listaStatus, (val) => val.descricao === status);

  return (
    <Chip
      size={isMobile || minimal ? "small" : "medium"}
      label={status}
      sx={{
        background: corStatus[0]?.cor,
        color: "white",
      }}
    />
  );
};

HelpDesk.rota = "/helpdesk_view";

export default HelpDesk;
