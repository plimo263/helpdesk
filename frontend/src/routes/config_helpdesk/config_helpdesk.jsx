import {
  Box,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Stack,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  seletorConfigHelpdesk,
  seletorConfigHelpdeskItems,
  seletorConfigHelpdeskModal,
} from "./config-helpdesk-selectors";
import {
  configHelpdesCloseModal,
  configHelpdesSetModal,
  configHelpdeskInit,
} from "./config-helpdesk-actions";
import ConfigHelpdeskModal from "./config-helpdesk-modal";
import DrawerDialog from "../../components/drawer-dialog";
import { Body1, Body2, Caption, FabCustom, Icone } from "../../components";
import _ from "lodash";
import RowPaginateTemplate from "../../templates/row_paginate_template";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ConfigHelpdeskAddUpd from "./config-helpdesk-add-upd";
import OptionsMenu from "../../components/options-menu";

const STR = {
  title: "",
  titleDelete: "Excluir variavel do sistema",
  labelOptionDelete: "Excluir",
  labelOptionEdit: "Editar",
};

const FIELDS = {
  NOME: "name",
  VALOR: "value",
  DESCRIÇÃO: "description",
};

const HEADERS = ["NOME", "VALOR", "DESCRIÇÃO", "EXCLUIR"];

function ConfigHelpdesk() {
  const isMobile = useTheme()?.isMobile;

  const dispatch = useDispatch();

  const data = useSelector(seletorConfigHelpdesk);

  const modal = useSelector(seletorConfigHelpdeskModal);

  //
  useEffect(() => {
    dispatch(configHelpdeskInit());
  }, [dispatch]);
  //
  const fnCloseModal = useCallback(() => {
    dispatch(configHelpdesCloseModal());
  }, [dispatch]);
  //
  return (
    <>
      {modal && (
        <DrawerDialog
          fnGetCorpo={() => <ConfigHelpdeskModal modal={modal} />}
          fecharModal={fnCloseModal}
        />
      )}
      <Container disableGutters maxWidth="lg">
        {data && isMobile ? <ListMobile /> : <ListItems />}
      </Container>
    </>
  );
}
const ListMobile = () => {
  const history = useHistory();

  const configList = useSelector(seletorConfigHelpdeskItems);

  const onAddConfig = useCallback(() => {
    history.push(ConfigHelpdeskAddUpd.rota);
  }, [history]);

  return (
    <>
      <List sx={{ mx: 1 }}>
        {configList?.map((ele, idx) => (
          <Paper sx={{ my: 0.5 }}>
            <ListItemMobile {...ele} key={idx} />
          </Paper>
        ))}
      </List>
      <FabCustom icon="Add" onClick={onAddConfig} />
    </>
  );
};
//
const ListItemMobile = ({ id, name, description, value }) => {
  const register = { id, name, description, value };

  return (
    <ListItem>
      <ListItemText
        primary={name}
        secondary={
          <Stack gap={1} alignItems="flex-start">
            <Body2>{description}</Body2>
            <Stack direction="row" gap={1} alignItems="center">
              <Caption>Valor:</Caption>
              <Box
                sx={{
                  px: 1,
                  borderRadius: 1,
                  background: ({ palette }) => palette.primary.main,
                }}
              >
                <Body1 fontWeight="bold">{value}</Body1>
              </Box>
            </Stack>
          </Stack>
        }
      />
      <ListItemSecondaryAction>
        <MoreOptions register={register} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const MoreOptions = ({ register }) => {
  const history = useHistory();

  const dispatch = useDispatch();
  //
  const onDelete = useCallback(() => {
    dispatch(
      configHelpdesSetModal({
        type: ConfigHelpdeskModal.modal.DEL,
        data: register,
      })
    );
  }, [dispatch, register]);

  const onEdit = useCallback(() => {
    history.push(ConfigHelpdeskAddUpd.rota, register);
  }, [history, register]);

  const options = [
    {
      icon: "Edit",
      label: STR.labelOptionEdit,
      onClick: onEdit,
    },
    {
      icon: "Delete",
      label: STR.labelOptionDelete,
      onClick: onDelete,
    },
  ];

  return <OptionsMenu options={options} />;
};

//
const ListItems = () => {
  const dispatch = useDispatch();
  const onClickAdd = useCallback(() => {
    dispatch(
      configHelpdesSetModal({
        type: ConfigHelpdeskModal.modal.ADD,
      })
    );
  }, [dispatch]);
  //
  const configList = useSelector(seletorConfigHelpdeskItems);
  let bodyRows = configList || [];

  const getRowsFormat = (rows) => {
    return _.map(rows, (row) => {
      const obj = {
        onClick: (e) => {
          e.stopPropagation();
          dispatch(
            configHelpdesSetModal({
              type: ConfigHelpdeskModal.modal.UPD,
              data: row,
            })
          );
        },
      };
      _.forEach(HEADERS, (k) => {
        if (k === "EXCLUIR") {
          obj[k] = (
            <IconButton
              title={STR.titleDelete}
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(
                  configHelpdesSetModal({
                    type: ConfigHelpdeskModal.modal.DEL,
                    data: row,
                  })
                );
              }}
            >
              <Icone icone="Delete" />
            </IconButton>
          );
        } else {
          obj[k] = row[FIELDS[k]];
        }
      });

      return obj;
    });
  };

  bodyRows = getRowsFormat(configList);

  return (
    <RowPaginateTemplate
      onClickAdd={onClickAdd}
      titlePage=""
      pageCurrent={false}
      header={HEADERS}
      rows={bodyRows}
    />
  );
};

ConfigHelpdesk.rota = "/config_helpdesk";

export default ConfigHelpdesk;
