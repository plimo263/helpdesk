import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Grow,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { memo, useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  BotaoIcone,
  Icone,
  SemDados,
  Body1,
  EditorTextRich,
  ScrollInfinito,
  EntradaForm,
  Tab,
  Body2,
  H6,
  Caption,
} from "../../components";

import useFetch from "../../hooks/use-fetch";
import {
  helpdeskAddInteracao,
  helpdeskAlterarAgente,
  helpdeskFecharModal,
  helpdeskInit,
  helpdeskSetModal,
  ROTAS,
} from "./helpdesk-actions";
import _ from "lodash";
import { useEffect } from "react";
import { ToastErro } from "../../utils/toast-erro";
import { blue, grey, red } from "@mui/material/colors";
import { format, parseISO } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { ChipStatus } from "./helpdesk";
import { useSearchParam, useToggle } from "react-use";
import * as yup from "yup";
import { obterValidador, VALIDADOR_TIPO } from "../../utils/validadores";
import HelpdeskGoBack from "./helpdesk-goback";
import HelpdeskModal, { MODAL } from "./helpdesk-modal";
import { selectIsAgente, selectModal } from "./helpdesk-seletores";
import DrawerDialog from "../../components/drawer-dialog";
import axios from "axios";

// Status encerrado e resolvido
const STATUS_RESOLVIDO = 3;
const STATUS_ENCERRADO = 2;

//
function download(fileUrl, fileName) {
  var a = document.createElement("a");
  a.href = fileUrl;
  const name = _.last(fileName.split("/"));
  a.setAttribute("download", name);
  a.click();
}

//

const selectStatusPermitidos = (state) => state?.helpdesk?.status_de_para;
const selectAgentes = (state) => state?.helpdesk?.agentes;

function HelpdeskDetalhes() {
  const dispatch = useDispatch();
  const dados = useSelector(selectStatusPermitidos);
  const idTicket = useSearchParam("ticket");
  const { error, setFetch, data, wait } = useFetch(
    `${ROTAS[0]}?ticket=${idTicket}`,
    "GET"
  );
  const modal = useSelector(selectModal);
  const fecharModal = useCallback(() => {
    dispatch(helpdeskFecharModal());
  }, [dispatch]);

  //
  useEffect(() => {
    setFetch({});
  }, [setFetch]);
  //
  useEffect(() => {
    if (!dados) {
      dispatch(helpdeskInit());
    }
  }, [dados, dispatch]);

  //
  useEffect(() => {
    if (error) ToastErro(error);
  }, [error]);
  //
  return (
    <>
      {modal && (
        <DrawerDialog
          fnGetCorpo={() => <HelpdeskModal modal={modal} />}
          fecharModal={fecharModal}
        />
      )}
      <Grow in unmountOnExit>
        <Box sx={{ width: "100vw" }}>
          {wait ? (
            <CircularProgress />
          ) : !data ? (
            <SemDados />
          ) : (
            <Corpo idTicket={idTicket} data={data} />
          )}
        </Box>
      </Grow>
    </>
  );
}
const Corpo = ({ idTicket, data }) => {
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));

  return isMobile ? (
    <CorpoMobile idTicket={idTicket} data={data} />
  ) : (
    <CorpoDesktop idTicket={idTicket} data={data} />
  );
};
//
const CorpoMobile = ({ idTicket, data }) => {
  const cabe = [
    { icone: "LocalActivity", titulo: "Detalhes" },
    { icone: "SwapHoriz", titulo: "Interações" },
  ].map((ele, idx) => (
    <Stack spacing={1} direction="row" alignItems="center" key={idx}>
      <Icone icone={ele.icone} />
      <Body2>{ele.titulo}</Body2>
    </Stack>
  ));
  const corpo = [
    <Detalhes {...data} />,
    <DetalhesInteracoes data={data} idTicket={idTicket} />,
  ];
  return <Tab cabe={cabe} corpo={corpo} />;
};
//
const CorpoDesktop = ({ idTicket, data }) => {
  const isDark = useTheme().palette.mode === "dark";

  return (
    <Grid
      sx={{
        mt: 1,
        minHeight: "calc(100vh - 64px)",
        background: !isDark && grey[200],
      }}
      container
      spacing={1}
    >
      <Grid item xs={12} md={8} xl={9}>
        <DetalhesInteracoes data={data} idTicket={idTicket} />
      </Grid>
      <Grid item xs={12} md={4} xl={3}>
        <Detalhes {...data} />
      </Grid>
    </Grid>
  );
};
//
const DetalhesInteracoes = ({ data, idTicket }) => {
  const isAgente = useSelector(selectIsAgente);
  // Verifica se o status atual permite a interação do usuario logado
  let permitidoInteragir = false;
  // Quer dizer que precisamos verificar se o usuario logado é agente
  if (isAgente) {
    permitidoInteragir = true;
  } else if (data.autorizado_interagir === "A") {
    if (isAgente) permitidoInteragir = true;
  } else if (data.autorizado_interagir === "S") {
    // Aqui quer dizer que o autorizado é o solicitante.
    // Entao ele não pode ser agente
    if (!isAgente) permitidoInteragir = true;
  }
  return (
    <>
      <CabecalhoDetalhes titulo={data.titulo} idTicket={idTicket} />
      <Divider sx={{ my: 1 }} />
      <Interacoes
        permitidoInteragir={permitidoInteragir}
        idStatusAtual={data.id_status}
        idTicket={idTicket}
        historico={data.historico}
        bloqueado={data.bloqueado}
      />
    </>
  );
};
//
const CabecalhoDetalhes = ({ titulo, idTicket }) => {
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));

  return (
    <Stack sx={{ mt: 1 }} direction="row" alignItems="center">
      {!isMobile && <HelpdeskGoBack />}
      <H6 sx={{ flex: 1 }} align="center">
        Título: {titulo}
      </H6>
    </Stack>
  );
};
//
const Detalhes = ({
  id,
  data_abertura,
  status,
  assunto,
  nome_agente,
  avatar_agente,
  nome,
  id_status,
  avatar,
  data_prazo,
  data_ult_interacao,
  envolvidos,
}) => {
  //
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));
  const isAgente = useSelector(selectIsAgente);
  const dispatch = useDispatch();
  const onAlterInvolved = useCallback(() => {
    dispatch(
      helpdeskSetModal({
        tipo: MODAL.UPD_INVOLVED,
        dados: {
          idTicket: id,
          envolvidos,
        },
      })
    );
  }, [envolvidos, id, dispatch]);

  const opcoes = [
    { titulo: "Status", valor: <ChipStatus status={status} /> },
    { titulo: "Ticket Número ", valor: id, icone: "ConfirmationNumber" },
    {
      titulo: "Criado em",
      valor: format(parseISO(data_abertura), "dd/MM/yy HH:mm"),
      icone: "MoreTime",
    },
    {
      titulo: "Ultima interação",
      valor: format(parseISO(data_ult_interacao), "dd/MM/yy HH:mm"),
      icone: "Today",
    },
    {
      titulo: "Prazo final",
      valor: format(parseISO(data_prazo), "dd/MM/yy"),
      icone: "Report",
    },
    { titulo: "Assunto", valor: assunto, icone: "Build" },
  ];

  return (
    <Stack sx={{ mt: 1 }}>
      {!isMobile && <H6>Detalhes</H6>}
      <Divider sx={{ my: 1 }} />
      <Paper sx={{ p: 2 }}>
        <ListItem dense divider disableGutters disablePadding>
          <ListItemAvatar>
            <Avatar alt={nome} src={avatar} />
          </ListItemAvatar>
          <ListItemText primary={nome} secondary="Solicitante" />
        </ListItem>
        {opcoes.map((ele, idx) => (
          <DetalhesItemDestaque
            key={idx}
            titulo={ele.titulo}
            valor={ele.valor}
            icone={ele.icone}
            noDivider={ele.noDivider}
          />
        ))}

        {nome_agente ? (
          <AgenteAtribuido
            nomeAgente={nome_agente}
            avatarAgente={avatar_agente}
            id={id}
            idStatus={id_status}
            isAgente={isAgente}
          />
        ) : (
          <AgenteAtribuido
            nomeAgente="Não atribuído"
            id={id}
            idStatus={id_status}
            isAgente={isAgente}
          />
        )}
        {/* Lista dos envolvidos */}
        <Divider />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 1 }}
        >
          <Box />
          <Body1 fontWeight="bold" align="center">
            Colaboradores em cópia
          </Body1>
          <Button
            size="small"
            startIcon={<Icone icone="Edit" />}
            variant="outlined"
            onClick={onAlterInvolved}
          >
            Editar
          </Button>
        </Stack>
        <Envolvidos envolvidos={envolvidos} />
      </Paper>
    </Stack>
  );
};
//
const AgenteAtribuido = ({
  nomeAgente,
  isAgente,
  avatarAgente,
  id,
  idStatus,
}) => {
  // Encerrado e Resolvido não permite fazer a troca de agentes
  const STATUS_NAO_TROCAR_AGENTE = [2, 3];
  return (
    <ListItem
      dense
      disableGutters
      disablePadding
      secondaryAction={
        isAgente &&
        !STATUS_NAO_TROCAR_AGENTE.includes(idStatus) && (
          <AgenteTroca idTicket={id} />
        )
      }
    >
      <ListItemAvatar>
        <Avatar alt={nomeAgente} src={avatarAgente} />
      </ListItemAvatar>
      <ListItemText secondary={nomeAgente} primary="Agente Responsável" />
    </ListItem>
  );
};
//
const DetalhesItemDestaque = ({ noDivider, icone, titulo, valor }) => (
  <ListItem divider={noDivider ? false : true} dense>
    {icone && (
      <ListItemIcon>
        <Icone icone={icone} />
      </ListItemIcon>
    )}
    <ListItemText
      primary={
        <Stack direction="row" alignItems="center">
          <Body1 style={{ fontWeight: "bold" }}>{titulo}</Body1>&nbsp;&nbsp;{" "}
          {valor}
        </Stack>
      }
    />
  </ListItem>
);
//
const Interacoes = ({
  permitidoInteragir,
  idStatusAtual,
  historico,
  idTicket,
  bloqueado,
}) => {
  const [exibirInteracao, setExibirInteracao] = useState(false);
  const [exibirIncremento, setExibirIncremento] = useState(false);
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));
  //
  const onExibirInteracao = useCallback(() => {
    setExibirIncremento(false);
    setExibirInteracao((state) => !state);
  }, [setExibirIncremento, setExibirInteracao]);
  //
  const onExibirIncremento = useCallback(() => {
    setExibirIncremento((state) => !state);
    setExibirInteracao(false);
  }, [setExibirIncremento, setExibirInteracao]);

  return (
    <Container maxWidth="lg" disableGutters={isMobile}>
      <Stack
        sx={{ mb: 1 }}
        alignItems="center"
        spacing={1}
        justifyContent="center"
        direction="row-reverse"
      >
        {permitidoInteragir && !bloqueado && !exibirIncremento && (
          <Button
            fullWidth={isMobile}
            variant="contained"
            title="Clique aqui para iniciar um interação"
            onClick={onExibirInteracao}
            startIcon={<Icone icone={exibirInteracao ? "Close" : "Edit"} />}
          >
            {exibirInteracao ? "FECHAR" : "INTERAGIR"}
          </Button>
        )}
        {!exibirInteracao &&
          ![STATUS_ENCERRADO, STATUS_RESOLVIDO].includes(idStatusAtual) && (
            <Button
              fullWidth={isMobile}
              variant="outlined"
              title="Clique para incrementar mais detalhes sem atualizar o status"
              onClick={onExibirIncremento}
              startIcon={
                <Icone icone={exibirIncremento ? "Close" : "RecordVoiceOver"} />
              }
            >
              {exibirIncremento ? "FECHAR" : "INCREMENTAR"}
            </Button>
          )}
      </Stack>
      <Grow in={exibirInteracao || exibirIncremento} unmountOnExit>
        <Box>
          <FormularioInteracao
            idStatus={idStatusAtual}
            idTicket={idTicket}
            isIncremento={exibirIncremento}
          />
        </Box>
      </Grow>
      <br />
      <ScrollInfinito
        itens={historico}
        render={(ele, idx) => (
          <InteracaoItem {...ele} isExpandido={idx === 0} />
        )}
        itensPorPagina={3}
        tamanho="calc(100vh - 64px)"
      />
      <br /> <br />
    </Container>
  );
};
//
const InteracaoItem = memo(
  ({
    data_interacao,
    descricao,
    avatar,
    nome,
    planta,
    para,
    anexos,
    isExpandido,
    is_agente,
  }) => {
    const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));
    const sxPaper = {};
    const sxIcone = {
      position: "absolute",
      top: 0,
      width: 48,
      height: 48,
    };
    if (is_agente) {
      sxIcone.right = -28;
      sxIcone.color = red[500];
    } else {
      sxIcone.left = -28;
      sxIcone.color = blue[500];
    }
    //
    sxPaper.border = `1px solid ${sxIcone.color}`;

    return (
      <Stack>
        <Stack
          spacing={2}
          direction={is_agente ? "row-reverse" : "row"}
          sx={{ m: 1 }}
        >
          {!isMobile && <Avatar alt={nome} src={avatar} />}

          <Paper
            sx={{
              flex: 1,
              position: "relative",
              ...sxPaper,
            }}
            elevation={0}
          >
            <Icone
              icone={is_agente ? "ArrowRight" : "ArrowLeft"}
              sx={sxIcone}
            />
            <ListItem divider dense disableGutters disablePadding>
              <ListItemText
                primary={
                  <InteracaoItemPrimario
                    nome={nome}
                    dataInteracao={data_interacao}
                    status={para}
                  />
                }
                // secondary={
                //   <Caption>{`${formatDistance(
                //     parseISO(data_interacao),
                //     new Date(),
                //     {
                //       locale: ptBR,
                //       addSuffix: true,
                //     }
                //   )}`}</Caption>
                // }
              />
            </ListItem>
            <InteracaoItemSecundario descricao={descricao} />
          </Paper>
          {!isMobile && <Box sx={{ width: 40, height: 40 }} />}
        </Stack>
        {anexos?.length > 0 && (
          <Stack direction="row" sx={{ p: 1 }} flexWrap="wrap">
            {anexos &&
              anexos.map((ele, idx) => (
                <Button
                  onClick={() => download(ele, ele)}
                  // href={ele}
                  key={idx}
                  variant="outlined"
                  size="small"
                  target="_blank"
                >
                  {idx + 1}° ANEXO
                </Button>
              ))}
          </Stack>
        )}
      </Stack>
    );
  }
);
//
const InteracaoItemPrimario = ({ nome, dataInteracao, status }) => {
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));
  const dataFormatada = format(parseISO(dataInteracao), "dd/MM/yy HH:mm");

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1}
      sx={{ p: 1 }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
    >
      <Stack
        direction="row"
        justifyContent={{ xs: "space-between", md: "flex-start" }}
        sx={{ width: "100%" }}
        alignItems="center"
        spacing={0.5}
      >
        {isMobile ? <Caption>{nome}</Caption> : <Body2>{nome}</Body2>}

        {isMobile ? (
          <Caption fontWeight="bold">{dataFormatada}</Caption>
        ) : (
          <Body2 fontWeight="bold">{dataFormatada}</Body2>
        )}
      </Stack>
      <ChipStatus status={status} minimal />
    </Stack>
  );
};
//
const InteracaoItemSecundario = ({ descricao }) => {
  return (
    <EditorTextRich
      sx={{ minHeight: "auto" }}
      isReadOnly
      elevation={0}
      defaultValue={descricao}
    />
  );
};
//
const FormularioInteracao = ({ idStatus, idTicket, isIncremento }) => {
  const [wait, setWait] = useToggle();
  const dispatch = useDispatch();
  const mapaStatusPermitidos = useSelector(selectStatusPermitidos);
  const history = useHistory();
  const fnRetornoSucesso = useCallback(() => {
    // Caso tenha vindo de um encaminhamento de link direto, para retornar a pagina de helpdesk deve ser feito um replace
    if (history.action === "POP") {
      history.replace("/helpdesk");
    } else {
      // Se não pode usar o goBack
      history.goBack();
    }
  }, [history]);
  //
  const onSubmit = useCallback(
    async (val) => {
      const obj = {
        arquivo: [],
        id_ticket: parseInt(idTicket),
        idstatus_de: idStatus,
        idstatus_para: !isIncremento
          ? parseInt(val.idstatus_para.value)
          : idStatus,
        descricao: val.descricao,
        enviar_email:
          typeof val.enviar_email === "undefined" ? true : val.enviar_email,
      };
      if (val.arquivo) {
        const formData = new FormData();

        [...val.arquivo].forEach((arq) => {
          formData.append("arquivo", arq);
        });

        setWait();
        // Enviar arquivos ao bucket
        try {
          const response = await axios.post("/bucket", formData, {
            headers: {
              ContentType: "multipart/form-data",
            },
          });
          obj.arquivo = _.map(response.data.arquivo, (val) => val.url);
        } catch (error) {
          if (error?.message) {
            ToastErro(error.message);
          } else {
            ToastErro("Erro ao enviar arquivos");
          }
          return false;
        } finally {
          setWait();
        }
      }

      //
      dispatch(helpdeskAddInteracao(obj, setWait, fnRetornoSucesso));
    },
    [dispatch, idStatus, idTicket, isIncremento, setWait, fnRetornoSucesso]
  );
  // Se o status atual não pode se encontrado na lista então
  // devemos retornar null para não exibir o formulario de
  // interação
  if (!mapaStatusPermitidos?.hasOwnProperty(idStatus)) {
    return null;
  }

  //
  const schema = [
    {
      type: "textrich",
      name: "descricao",
      placeholder: "Digite a descrição.",
      extraProps: {
        elevation: 1,
        sx: {
          mb: 1,
        },
      },
    },
  ];

  let schemaValidator = yup.object().shape({
    descricao: yup.array().min(1).required(),
  });
  //
  let schemaMessageError = {
    descricao: "* Necessário preencher a descrição do ocorrido",
  };

  // Quer dizer que não é um incremento então vai haver alteracao de status
  if (!isIncremento) {
    schema.push({
      type: "select",
      name: "idstatus_para",
      itens: mapaStatusPermitidos[idStatus],
      placeholder: "Mudar o status do ticket...",
      autoFormat: true,
      grid: {
        xs: 12,
        md: 6,
      },
    });

    schemaValidator = yup.object().shape({
      idstatus_para: obterValidador(VALIDADOR_TIPO.selectUnico),
      descricao: yup.array().min(1).required(),
    });
    //
    schemaMessageError = {
      idstatus_para: "* Escolha o status que irá receber a solicitação",
      descricao: "* Necessário preencher a descrição do ocorrido",
    };
  }

  schema.push({
    type: "file",
    name: "arquivo",
    icon: "AttachFile",
    multiple: true,
    label: "Anexo(s)",

    grid: {
      xs: 12,
      md: 6,
    },
  });
  schema.push({
    type: "switch",
    name: "enviar_email",
    defaultChecked: true,
    label: "Enviar e-mail de notificação ",
  });

  return (
    <Paper sx={{ p: 1 }}>
      <EntradaForm
        schema={schema}
        schemaMessageError={schemaMessageError}
        schemaValidator={schemaValidator}
        wait={wait}
        onSubmit={onSubmit}
      />
    </Paper>
  );
};
//
const AgenteTroca = ({ idTicket }) => {
  const agentes = useSelector(selectAgentes);
  const [anchorEl, setAnchorEl] = useState();
  const isOpen = Boolean(anchorEl);
  const onClickMenu = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl]
  );
  const onFecharMenu = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  return (
    <>
      <ListItemSecondaryAction title="Alterar o agente responsável">
        <BotaoIcone icone="MoreVert" onClick={onClickMenu} />
      </ListItemSecondaryAction>
      <Menu anchorEl={anchorEl} open={isOpen} onClose={onFecharMenu}>
        {agentes?.map((ele, idx) => (
          <MenuItem dense key={idx}>
            <AgenteItem
              {...ele}
              idTicket={idTicket}
              onFecharMenu={onFecharMenu}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
//
const AgenteItem = ({
  idTicket,
  onFecharMenu,
  nome,
  id_usuario,
  email,
  avatar,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const fnRetornoSucesso = useCallback(() => {
    onFecharMenu();
    // Caso tenha vindo de um encaminhamento de link direto, para retornar a pagina de helpdesk deve ser feito um replace
    if (history.action === "POP") {
      history.replace("/helpdesk");
    } else {
      // Se não pode usar o goBack
      history.goBack();
    }
  }, [history, onFecharMenu]);
  const onClickSelecionarAgente = useCallback(() => {
    const formData = new FormData();
    formData.append(
      "dados",
      JSON.stringify({
        id_ticket: idTicket,
        id_agente: id_usuario,
      })
    );

    dispatch(helpdeskAlterarAgente(formData, () => {}, fnRetornoSucesso));
  }, [id_usuario, idTicket, dispatch, fnRetornoSucesso]);

  return (
    <ListItemButton dense onClick={onClickSelecionarAgente}>
      <ListItem>
        <ListItemAvatar>
          <Avatar alt={nome} src={avatar} />
        </ListItemAvatar>
        <ListItemText primary={nome} secondary={email} />
      </ListItem>
    </ListItemButton>
  );
};

const Envolvidos = ({ envolvidos }) => {
  return (
    <List disablePadding>
      {envolvidos?.map((ele, idx) => (
        <ListItem dense key={idx} disableGutters disablePadding>
          <ListItemAvatar>
            <Avatar alt={ele.nome} src={ele.avatar} />
          </ListItemAvatar>
          <ListItemText primary={ele.nome} secondary={ele.email} />
        </ListItem>
      ))}
    </List>
  );
};

HelpdeskDetalhes.rota = "/helpdesk_detalhes";

export default HelpdeskDetalhes;
