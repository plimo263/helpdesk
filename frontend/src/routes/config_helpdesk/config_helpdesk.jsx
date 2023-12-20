import { Container, IconButton } from "@mui/material";
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
import { Icone } from "../../components";
import _ from "lodash";
import RowPaginateTemplate from "../../templates/row_paginate_template";

const STR = {
  title: "",
  titleDelete: "Excluir variavel do sistema",
};

const FIELDS = {
  NOME: "name",
  VALOR: "value",
  DESCRIÇÃO: "description",
};

const HEADERS = ["NOME", "VALOR", "DESCRIÇÃO", "EXCLUIR"];

function ConfigHelpdesk() {
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
      <Container maxWidth="lg">{data && <ListItems />}</Container>
    </>
  );
}
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
  console.log(configList);
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
