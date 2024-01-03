import {
  Box,
  Chip,
  Container,
  Grow,
  IconButton,
  Stack,
  useTheme,
} from "@mui/material";
import _ from "lodash";
import React, { useCallback, useEffect } from "react";
import { Body1, H6, Icone } from "../../components";
import { useDispatch, useSelector } from "react-redux";
import { selectModal, selectSubjects } from "./helpdesk-seletores";
import {
  helpdeskFecharModal,
  helpdeskGetAssunto,
  helpdeskSetModal,
} from "./helpdesk-actions";
import RowPaginateTemplate from "../../templates/row_paginate_template";
import HelpdeskModal, { MODAL } from "./helpdesk-modal";
import DrawerDialog from "../../components/drawer-dialog";
import HelpdeskGoBack from "./helpdesk-goback";

const STR = {
  title: "Manutenção de assuntos",
  subtitle:
    "Criar, alterar, excluir e ativar/desativar assuntos usados no helpdesk.",
  headerName: "Assunto",
  headerPraz: "Prazo (dias)",
  headerActive: "Situação",
  headerDelete: "Excluir",
};

const mapKeyToTitle = {
  [STR.headerName]: "descricao",
  [STR.headerPraz]: "prazo",
  [STR.headerActive]: "situacao",
  [STR.headerDelete]: "id",
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
//
function HelpdeskAssunto() {
  const isMobile = useTheme()?.isMobile;
  const dispatch = useDispatch();
  const modal = useSelector(selectModal);
  const subjects = useSelector(selectSubjects);
  useEffect(() => {
    if (!subjects) {
      dispatch(helpdeskGetAssunto());
    }
  }, [dispatch, subjects]);

  const header = [
    STR.headerName,
    STR.headerPraz,
    STR.headerActive,
    STR.headerDelete,
  ];
  let rows = [];

  if (subjects) {
    rows = _.map(subjects, (val) => {
      const row = {
        onClick: () => {
          dispatch(
            helpdeskSetModal({
              tipo: MODAL.ADD_SUBJECT,
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
        } else if (k === STR.headerDelete) {
          row[k] = (
            <IconButton
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(
                  helpdeskSetModal({
                    tipo: MODAL.DEL_SUBJECT,
                    dados: val[mapKeyToTitle[k]],
                  })
                );
              }}
            >
              <Icone icone="Delete" />
            </IconButton>
          );
        } else {
          row[k] = val[mapKeyToTitle[k]];
        }
      });

      return row;
    });
  }
  //
  const onAddSubject = useCallback(() => {
    dispatch(
      helpdeskSetModal({
        tipo: MODAL.ADD_SUBJECT,
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
                onClickAdd={onAddSubject}
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

HelpdeskAssunto.rota = "/helpdesk_assunto_page";

export default HelpdeskAssunto;
