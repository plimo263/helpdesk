import {
  Box,
  Chip,
  Container,
  Grow,
  IconButton,
  Stack,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectManuStatus, selectModal } from "./helpdesk-seletores";
import {
  helpdeskFecharModal,
  helpdeskGetStatus,
  helpdeskSetModal,
} from "./helpdesk-actions";
import _ from "lodash";
import { DrawerDialog } from "../../components";
import HelpdeskModal, { MODAL } from "./helpdesk-modal";
import HelpdeskGoBack from "./helpdesk-goback";
import { Body1, H6, Icone } from "../../components";
import RowPaginateTemplate from "../../templates/row_paginate_template";

const STR = {
  titleBtnDelete: "Clique para excluir o status",
  titleBtnMove: "Clique para definir para qual status este poderá levar",
  title: "Manutenção de status",
  subtitle:
    "Criar, alterar, excluir e ativar/desativar status usados no helpdesk.",
  headerName: "Status",
  headerAuthorized: "Autorizado Interagir",
  headerColor: "Cor",
  headerActive: "Situação",
  headerDelete: "Excluir",
  headerMove: "De / Para",
};

const mapKeyToTitle = {
  [STR.headerName]: "descricao",
  [STR.headerAuthorized]: "autorizado_interagir",
  [STR.headerColor]: "cor",
  [STR.headerActive]: "situacao",
  [STR.headerDelete]: "id",
  [STR.headerMove]: "id",
};

const getSituationName = (situation) => {
  switch (situation) {
    case "A":
      return "Ativo";
    case "B":
    default:
      return "Inativo";
  }
};

const getIconSituation = (situation) => {
  switch (situation) {
    case "A":
      return "Check";
    case "B":
    default:
      return "Block";
  }
};

const getColorSituation = (situation) => {
  switch (situation) {
    case "A":
      return "success";
    case "B":
    default:
      return "error";
  }
};

export const getAuthorized = (auth) => {
  switch (auth) {
    case "A":
      return "Agente";
    case "S":
    default:
      return "Solicitante";
  }
};

function HelpdeskStatus() {
  const isMobile = useTheme()?.isMobile;
  const dispatch = useDispatch();
  const modal = useSelector(selectModal);
  const status = useSelector(selectManuStatus);
  useEffect(() => {
    if (!status) {
      dispatch(helpdeskGetStatus());
    }
  }, [dispatch, status]);
  const header = [
    STR.headerName,
    STR.headerAuthorized,
    STR.headerColor,
    STR.headerActive,
    STR.headerDelete,
    STR.headerMove,
  ];
  let rows = [];

  if (status) {
    rows = _.map(status, (val) => {
      const row = {
        onClick: () => {
          dispatch(
            helpdeskSetModal({
              tipo: MODAL.ADD_UPD_STATUS,
              dados: val,
            })
          );
        },
      };
      _.forEach(header, (k) => {
        // Quando codigo aplica o chip no campo
        if (k === STR.headerActive) {
          row[k] = (
            <Chip
              size="small"
              icon={<Icone icone={getIconSituation(val[mapKeyToTitle[k]])} />}
              color={getColorSituation(val[mapKeyToTitle[k]])}
              label={getSituationName(val[mapKeyToTitle[k]])}
            />
          );
        } else if (k === STR.headerMove) {
          row[k] = (
            <IconButton
              color="info"
              title={STR.titleBtnMove}
              onClick={(e) => {
                e.stopPropagation();
                dispatch(
                  helpdeskSetModal({
                    tipo: MODAL.MOVE_STATUS,
                    dados: val,
                  })
                );
              }}
            >
              <Icone icone="SwapHoriz" />
            </IconButton>
          );
        } else if (k === STR.headerDelete) {
          row[k] = (
            <IconButton
              title={STR.titleBtnDelete}
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(
                  helpdeskSetModal({
                    tipo: MODAL.DEL_STATUS,
                    dados: val.id,
                  })
                );
              }}
            >
              <Icone icone="Delete" />
            </IconButton>
          );
        } else if (k === STR.headerAuthorized) {
          row[k] = getAuthorized(val[mapKeyToTitle[k]]);
        } else if (k === STR.headerColor) {
          row[k] = (
            <Chip
              label={val[mapKeyToTitle[STR.headerName]]}
              sx={{ color: "white", background: val[mapKeyToTitle[k]] }}
            />
          );
        } else {
          row[k] = val[mapKeyToTitle[k]];
        }
      });

      return row;
    });
  }
  //
  const onAddStatus = useCallback(() => {
    dispatch(
      helpdeskSetModal({
        tipo: MODAL.ADD_UPD_STATUS,
      })
    );
  }, [dispatch]);
  //
  const fecharModal = useCallback(
    () => dispatch(helpdeskFecharModal()),
    [dispatch]
  );

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
        <Stack sx={{ width: "100vw" }} direction="row">
          {!isMobile && (
            <Box sx={{ mt: 2, flex: 0 }}>
              <HelpdeskGoBack />
            </Box>
          )}
          <Box sx={{ flex: 1 }}>
            <Container maxWidth="md">
              <H6>{STR.title}</H6>
              <Body1 align="center">{STR.subtitle}</Body1>
              <RowPaginateTemplate
                pageCurrent={1}
                totalPages={1}
                onSetPage={() => {}}
                titlePage=""
                onClickAdd={onAddStatus}
                headerAboveTable={null}
                titleButtonAdd="Incluir"
                header={header}
                backgroundPage="transparent"
                sxHeader={{
                  background: ({ palette }) =>
                    palette.mode === "dark"
                      ? palette.background.paper
                      : palette.primary.main,
                  color: ({ palette }) =>
                    palette.mode === "dark"
                      ? palette.background.paper.contrastText
                      : palette.primary.contrastText,
                }}
                rows={rows}
              />
            </Container>
          </Box>
        </Stack>
      </Grow>
    </>
  );
}

HelpdeskStatus.rota = "/helpdesk_status_page";

export default HelpdeskStatus;
