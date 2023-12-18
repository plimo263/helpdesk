import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { sectorCloseModal, sectorDel } from "./sector-actions";
import { useToggle } from "react-use";
import { Confirmar } from "../../components";

const STR = {
  title: "Exclusão de setor",
  subtitle: "Tem certeza que deseja excluir o setor informado ?",
};

function SectorDel({ sector }) {
  const [wait, setWait] = useToggle();
  const dispatch = useDispatch();
  const fnCancel = useCallback(() => {
    dispatch(sectorCloseModal());
  }, [dispatch]);
  //
  const fnConfirm = useCallback(() => {
    dispatch(sectorDel({ id: sector.id }, setWait));
  }, [sector, setWait, dispatch]);

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

export default SectorDel;
