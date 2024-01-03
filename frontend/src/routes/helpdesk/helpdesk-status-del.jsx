import { Stack } from "@mui/material";
import React, { useCallback } from "react";
import { Confirmar } from "../../components";
import { useDispatch } from "react-redux";
import { useToggle } from "react-use";
import { helpdeskDelStatus, helpdeskFecharModal } from "./helpdesk-actions";

const STR = {
  title: "Exclusão de status",
  subtitle: "Deseja realmente excluir o status ?",
};

function HelpdeskStatusDel({ id }) {
  const [wait, setWait] = useToggle();
  const dispatch = useDispatch();
  //
  const fnCancel = useCallback(() => {
    dispatch(helpdeskFecharModal());
  }, [dispatch]);
  //
  const fnConfirm = useCallback(() => {
    dispatch(helpdeskDelStatus({ id_status: id }, setWait));
  }, [dispatch, id, setWait]);
  return (
    <Stack>
      <Confirmar
        aguardar={wait}
        fnCancelar={fnCancel}
        fnConfirmar={fnConfirm}
        titulo={STR.title}
        subtitulo={STR.subtitle}
      />
    </Stack>
  );
}

export default HelpdeskStatusDel;
