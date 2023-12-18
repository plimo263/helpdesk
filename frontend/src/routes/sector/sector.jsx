import {
  Container,
  Fab,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Stack,
} from "@mui/material";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  seletorSector,
  seletorSectorItems,
  seletorSectorModal,
} from "./sector-selector";
import DrawerDialog from "../../components/drawer-dialog";
import { Body1, H6, Icone } from "../../components";
import { green, red } from "@mui/material/colors";
import { sectorCloseModal, sectorInit, sectorSetModal } from "./sector-actions";
import SectorModal from "./sector-modal";

const STR = {
  title: "Setores",
  titleBtn: "Clique para adicionar um novo setor",
  labelBtn: "Adicionar",
};

const getSituation = (situation) => {
  switch (situation) {
    case "A":
      return "Ativo";
    case "B":
      return "Inativo";
    default:
      return situation;
  }
};
const getSituationIcon = (situation) => {
  switch (situation) {
    case "A":
      return "Check";
    case "B":
      return "Block";
    default:
      return situation;
  }
};
//
const getSituationColor = (situation) => {
  switch (situation) {
    case "A":
      return green[400];
    case "B":
      return red[400];
    default:
      return null;
  }
};

function Sector() {
  const dispatch = useDispatch();
  const sector = useSelector(seletorSector);
  const modal = useSelector(seletorSectorModal);
  //
  useEffect(() => {
    dispatch(sectorInit());
  }, [dispatch]);
  //
  const fnCloseModal = useCallback(() => {
    dispatch(sectorCloseModal());
  }, [dispatch]);

  return (
    <>
      {modal && (
        <DrawerDialog
          fnGetCorpo={() => <SectorModal modal={modal} />}
          fecharModal={fnCloseModal}
        />
      )}
      <Container maxWidth="sm">
        <H6>{STR.title}</H6>
        <AddSector />

        {sector ? <SectorList /> : null}
      </Container>
    </>
  );
}
//
const AddSector = () => {
  const dispatch = useDispatch();
  const onClick = useCallback(() => {
    dispatch(
      sectorSetModal({
        type: SectorModal.modal.ADD,
      })
    );
  }, [dispatch]);

  return (
    <Stack direction="row-reverse">
      <Fab
        onClick={onClick}
        title={STR.titleBtn}
        color="success"
        variant="extended"
      >
        <Icone icone="Add" />
        <Body1>{STR.labelBtn}</Body1>
      </Fab>
    </Stack>
  );
};
//
const SectorList = () => {
  const sectorList = useSelector(seletorSectorItems);

  return (
    <List>
      {sectorList.map((ele) => (
        <Paper sx={{ my: 0.5 }} key={ele.id}>
          <SectorItem name={ele.name} situation={ele.situation} id={ele.id} />
        </Paper>
      ))}
    </List>
  );
};

const SectorItem = ({ id, name, situation }) => {
  const dispatch = useDispatch();
  //
  const onClick = useCallback(
    (e) => {
      e.stopPropagation();
      dispatch(
        sectorSetModal({
          type: SectorModal.modal.UPD,
          data: { id, name, situation },
        })
      );
    },
    [id, name, situation, dispatch]
  );
  //
  const onDelete = useCallback(
    (e) => {
      e.stopPropagation();
      dispatch(
        sectorSetModal({
          type: SectorModal.modal.DEL,
          data: { id, name, situation },
        })
      );
    },
    [id, name, situation, dispatch]
  );
  //
  return (
    <ListItemButton onClick={onClick}>
      <ListItemIcon>
        <Icone
          sx={{ color: getSituationColor(situation) }}
          icone={getSituationIcon(situation)}
        />
      </ListItemIcon>
      <ListItemText primary={name} secondary={getSituation(situation)} />
      <ListItemSecondaryAction>
        <IconButton color="error" onClick={onDelete}>
          <Icone icone="Delete" />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItemButton>
  );
};

Sector.rota = "/sector_view";

export default Sector;
