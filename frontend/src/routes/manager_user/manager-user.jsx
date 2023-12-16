import { Avatar, Container, IconButton } from "@mui/material";
import React, { useCallback, useEffect } from "react";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import {
  managerUserCloseModal,
  managerUserInit,
  managerUserSetModal,
} from "./manager-user-actions";
import RowPaginateTemplate from "../../templates/row_paginate_template";
import {
  selectorManagerUserList,
  selectorManagerUserModal,
} from "./manager-selectors";
import { Icone } from "../../components";
import ManagerUserModal from "./manager-user-modal";
import DrawerDialog from "../../components/drawer-dialog";
import { green, red } from "@mui/material/colors";
import OptionsMenu from "../../components/options-menu";

const STR = {
  titleDelete: "Clique para excluir o usuario",
};

const FIELDS = {
  AVATAR: "avatar",
  "E-MAIL": "email",
  NOME: "name",
  SETOR: "sector",
  "É AGENTE": "is_agent",
  ATIVO: "active",
};

const HEADERS = [
  "ATIVO",
  "AVATAR",
  "NOME",
  "E-MAIL",
  "SETOR",
  "É AGENTE",
  "EXCLUIR",
  "OPÇÕES",
];

const getColor = (status) => {
  switch (status) {
    case "S":
      return green[500];
    case "N":
    default: // N
      return red[500];
  }
};
//
const getIcon = (status) => {
  switch (status) {
    case "S":
      return "Check";
    case "N":
    default: // N
      return "Block";
  }
};

function ManagerUser() {
  const dispatch = useDispatch();
  const usersList = useSelector(selectorManagerUserList);
  let bodyRows = usersList || [];
  const modal = useSelector(selectorManagerUserModal);

  const getRowsFormat = (rows) => {
    return _.map(rows, (row) => {
      const obj = {
        onClick: (e) => {
          e.stopPropagation();
          dispatch(
            managerUserSetModal({
              type: ManagerUserModal.modal.UPD,
              data: { managerUser: row },
            })
          );
        },
      };
      _.forEach(HEADERS, (k) => {
        if (k === "AVATAR") {
          obj[k] = <Avatar alt={row.name} src={row[FIELDS[k]]} />;
        } else if (k === "OPCOES") {
          obj[k] = <MoreOptions />;
        } else if (k === "SETOR") {
          obj[k] = row[FIELDS[k]].name;
        } else if (k === "EXCLUIR") {
          obj[k] = (
            <IconButton
              title={STR.titleDelete}
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(
                  managerUserSetModal({
                    type: ManagerUserModal.modal.DEL,
                    data: { managerUser: row },
                  })
                );
              }}
            >
              <Icone icone="Delete" />
            </IconButton>
          );
        } else if (k === "ATIVO") {
          obj[k] = (
            <Icone
              sx={{ color: getColor(row[FIELDS[k]]) }}
              icone={getIcon(row[FIELDS[k]])}
            />
          );
        } else {
          obj[k] = row[FIELDS[k]];
        }
      });

      return obj;
    });
  };

  bodyRows = getRowsFormat(usersList);

  //
  useEffect(() => {
    dispatch(managerUserInit());
  }, [dispatch]);
  //
  const onClickAdd = useCallback(() => {
    dispatch(
      managerUserSetModal({
        type: ManagerUserModal.modal.ADD,
      })
    );
  }, [dispatch]);
  //
  const fnCloseModal = useCallback(() => {
    dispatch(managerUserCloseModal());
  }, [dispatch]);
  //
  return (
    <>
      {modal && (
        <DrawerDialog
          fnGetCorpo={() => <ManagerUserModal modal={modal} />}
          fecharModal={fnCloseModal}
        />
      )}
      <Container maxWidth="lg">
        <RowPaginateTemplate
          onClickAdd={onClickAdd}
          titlePage=""
          pageCurrent={false}
          header={HEADERS}
          rows={bodyRows}
        />
      </Container>
    </>
  );
}
//
const MoreOptions = () => {
  return <OptionsMenu />;
};

ManagerUser.rota = "/manager_user_view";

export default ManagerUser;
