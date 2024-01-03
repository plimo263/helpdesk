import {
  Button,
  Checkbox,
  Container,
  Divider,
  Grid,
  Grow,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Stack,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectManuStatus } from "./helpdesk-seletores";
import { getAuthorized } from "./helpdesk-status";
import { Body2, H6, Icone } from "../../components";
import { useSet, useToggle } from "react-use";
import { helpdeskUpdFromToStatus } from "./helpdesk-actions";
import _ from "lodash";

const STR = {
  title: "Definição de destino Status",
  subtitle:
    "Escolha os destinos em que o status que esta do lado esquerdo pode seguir quando tiver que ser movimentado.",
  canInteract: " pode interagir neste status.",
  labelBtn: "SALVAR",
  fromStatus: "HELPDESK NESTE STATUS",
  toStatus: "PODE IR PARA ESTES STATUS",
};

function HelpdeskStatusFromTo({ item }) {
  const dispatch = useDispatch();
  const [wait, setWait] = useToggle();
  const [firstModified, setFirstModified] = useToggle(false);
  const options = useSelector(selectManuStatus);
  const selectedItems = useMemo(
    () => new Set(item?.status_para?.map((ele) => ele.id) || []),
    [item]
  );
  const [set, { has, toggle }] = useSet(new Set(selectedItems));
  //
  const onSaveUpdateStatus = useCallback(() => {
    dispatch(
      helpdeskUpdFromToStatus(
        { id_status: item.id, status_para: [...set] },
        setWait
      )
    );
  }, [set, item.id, setWait, dispatch]);
  //
  useEffect(() => {
    if (!_.isEqual(set, selectedItems) && !firstModified) {
      setFirstModified();
    } else if (_.isEqual(set, selectedItems)) {
      setFirstModified(false);
    }
  }, [setFirstModified, firstModified, set, selectedItems]);

  return (
    <Container
      sx={{ background: ({ backgroundPage }) => backgroundPage, py: 2 }}
    >
      <H6>{STR.title}</H6>
      <Body2>{STR.subtitle}</Body2>
      <br />
      <Grow in={firstModified} unmountOnExit>
        <Stack alignItems="center">
          <Button variant="contained" onClick={onSaveUpdateStatus}>
            {STR.labelBtn}
          </Button>
        </Stack>
      </Grow>
      <br />
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Paper sx={{ height: "100%" }}>
            <H6>{STR.fromStatus}</H6>
            <Divider />
            <List disablePadding dense>
              <ItemStatus {...item} noChecked />
            </List>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ height: "100%" }}>
            <H6>{STR.toStatus}</H6>
            <Divider />
            <List disablePadding dense>
              {options
                .filter((ele) => ele.id !== item.id)
                .map((ele) => (
                  <ItemStatus
                    {...ele}
                    key={ele.id}
                    isActive={has(ele.id)}
                    wait={wait}
                    toggle={toggle}
                  />
                ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

const ItemStatus = ({
  id,
  autorizado_interagir,
  descricao,
  cor,
  noChecked,
  isActive,
  toggle,
  wait,
}) => {
  //
  return (
    <ListItemButton
      divider
      sx={{ width: "100%" }}
      onClick={noChecked || wait ? () => {} : () => toggle(id)}
    >
      <ListItemIcon>
        <Icone icone="Circle" sx={{ color: cor }} />
      </ListItemIcon>
      <ListItemText
        primary={descricao}
        secondary={`O ${getAuthorized(autorizado_interagir)} ${
          STR.canInteract
        }`}
      />
      <ListItemSecondaryAction>
        {!noChecked && <Checkbox disabled={wait} checked={isActive} />}
      </ListItemSecondaryAction>
    </ListItemButton>
  );
};

export default HelpdeskStatusFromTo;
