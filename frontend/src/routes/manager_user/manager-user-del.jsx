import React, { useCallback } from "react";
import { Confirmar } from "../../components";
import { useDispatch } from "react-redux";
import { managerUserCloseModal, managerUserDel } from "./manager-user-actions";
import { useToggle } from "react-use";

const STR = {
  title: "Deseja realmente excluir ?",
  subtitle: "A exclusão do usuário não poderá ser desfeita",
};

function ManagerUserDel({ managerUser }) {
  const [wait, setWait] = useToggle();

  const dispatch = useDispatch();

  const fnConfirm = useCallback(() => {
    dispatch(managerUserDel({ id: managerUser.id }, setWait));
  }, [dispatch, managerUser, setWait]);
  //
  const fnCancel = useCallback(() => {
    dispatch(managerUserCloseModal());
  }, [dispatch]);

  return (
    <Confirmar
      titulo={STR.title}
      subtitulo={STR.subtitle}
      aguardar={wait}
      fnCancelar={fnCancel}
      fnConfirmar={fnConfirm}
    />
  );
}

export default ManagerUserDel;
