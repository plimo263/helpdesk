import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useToggle } from "react-use";
import { Confirmar } from "../../components";
import {
  configHelpdesCloseModal,
  configHelpdeskDel,
} from "./config-helpdesk-actions";

const STR = {
  title: "Deseja mesmo excluir esta configuração ?",
  subtitle:
    "Esta exclusão não poderá ser desfeita e pode impactar no comportamento do sistema",
};

function ConfigHeldeskDel({ item }) {
  const dispatch = useDispatch();
  const [wait, setWait] = useToggle();
  //
  const fnCancel = useCallback(() => {
    dispatch(configHelpdesCloseModal());
  }, [dispatch]);
  //
  const fnConfirm = useCallback(() => {
    dispatch(configHelpdeskDel({ id: item.id }, setWait));
  }, [dispatch, setWait, item]);
  //

  return (
    <Confirmar
      aguardar={wait}
      titulo={STR.title}
      subtitulo={STR.subtitle}
      fnCancelar={fnCancel}
      fnConfirmar={fnConfirm}
    />
  );
}

export default ConfigHeldeskDel;
