import {
  Avatar,
  Box,
  Chip,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
} from "@mui/material";
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
import { Body1, Body2, Caption, FabCustom, Icone } from "../../components";
import ManagerUserModal from "./manager-user-modal";
import DrawerDialog from "../../components/drawer-dialog";
import { blue, green, red } from "@mui/material/colors";
import OptionsMenu from "../../components/options-menu";
import { useTheme } from "@emotion/react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ManagerUserAddUpd from "./manager-user-add-upd";

const STR = {
  titleDelete: "Clique para excluir o usuario",
  labelOptionDelete: "Excluir Usuário",
  labelOptionResetPasswd: "Resetar senha",
  labelOptionEdit: "Editar Usuário",
  isActive: "Ativo",
  isInactive: "Inativo",
  isAgent: "Suporte",
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

const isActive = (status) => {
  switch (status) {
    case "S":
      return STR.isActive;
    case "N":
    default: // N
      return STR.isInactive;
  }
};

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
  const isMobile = useTheme()?.isMobile;

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
        } else if (k === "OPÇÕES") {
          obj[k] = <MoreOptions register={row} />;
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
    if (!usersList) dispatch(managerUserInit());
  }, [usersList, dispatch]);
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
      <Container disableGutters maxWidth="lg">
        {isMobile ? (
          <ListMobile rows={usersList} />
        ) : (
          <RowPaginateTemplate
            onClickAdd={onClickAdd}
            titlePage=""
            pageCurrent={false}
            header={HEADERS}
            rows={bodyRows}
          />
        )}
      </Container>
    </>
  );
}
//
const ListMobile = ({ rows }) => {
  const history = useHistory();

  const onAddUser = useCallback(() => {
    history.push(ManagerUserAddUpd.rota);
  }, [history]);

  return (
    <>
      <List>
        {rows?.map((ele, idx) => (
          <ListItemUserMobile
            {...ele}
            register={ele}
            key={idx}
            isDivider={idx < rows.length - 1}
          />
        ))}
      </List>
      <FabCustom onClick={onAddUser} icon="Add" />
    </>
  );
};
const ListItemUserMobile = ({
  isDivider,
  name,
  avatar,
  email,
  sector,
  is_agent,
  active,
  register,
}) => {
  return (
    <ListItem divider={isDivider}>
      <ListItemAvatar>
        <Avatar alt={name} src={avatar} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Body1>{name}</Body1>
            <Chip
              icon={<Icone icone={getIcon(active)} />}
              size="small"
              label={isActive(active)}
              sx={{ background: getColor(active) }}
            />
          </Stack>
        }
        secondary={
          <Stack gap={0.5} alignItems="flex-start">
            <Body2>{email}</Body2>
            <Stack direction="row" gap={1}>
              <Box sx={{ px: 0.5, borderRadius: 1, background: blue[200] }}>
                <Caption>{sector?.name}</Caption>
              </Box>
              {is_agent === "S" && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.2,
                    px: 0.5,
                    borderRadius: 1,
                    background: green[500],
                  }}
                >
                  <Icone icone="Build" sx={{ fontSize: 12 }} />
                  <Caption>{STR.isAgent}</Caption>
                </Box>
              )}
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
//
const MoreOptions = ({ register }) => {
  const isMobile = useTheme()?.isMobile;

  const history = useHistory();

  const dispatch = useDispatch();

  const onEditPassword = useCallback(() => {
    dispatch(
      managerUserSetModal({
        type: ManagerUserModal.modal.UPD_PASSWORD,
        data: {
          managerUser: register,
        },
      })
    );
  }, [register, dispatch]);
  //
  const onDeleteUser = useCallback(() => {
    dispatch(
      managerUserSetModal({
        type: ManagerUserModal.modal.DEL,
        data: { managerUser: register },
      })
    );
  }, [dispatch, register]);

  const onEditUser = useCallback(() => {
    history.push(ManagerUserAddUpd.rota, register);
  }, [history, register]);

  const options = [
    {
      icon: "VpnKey",
      label: STR.labelOptionResetPasswd,
      onClick: onEditPassword,
    },
  ];

  if (isMobile) {
    options.splice(0, 0, {
      icon: "Edit",
      label: STR.labelOptionEdit,
      onClick: onEditUser,
    });

    options.push({
      icon: "Delete",
      label: STR.labelOptionDelete,
      onClick: onDeleteUser,
    });
  }

  return <OptionsMenu options={options} />;
};

ManagerUser.rota = "/manager_user_view";

export default ManagerUser;
