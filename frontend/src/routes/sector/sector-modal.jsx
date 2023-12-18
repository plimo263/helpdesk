import React from "react";
import SectorAddUpd from "./sector-add-upd";
import SectorDel from "./sector-del";
import ContainerAdaptavel from "../../components/container-adaptavel";

function SectorModal({ modal }) {
  let body;
  switch (modal.type) {
    case SectorModal.modal.ADD:
      body = <SectorAddUpd />;
      break;
    case SectorModal.modal.UPD:
      body = <SectorAddUpd sector={modal.data} />;
      break;
    case SectorModal.modal.DEL:
      body = <SectorDel sector={modal.data} />;
      break;
    default:
      break;
  }
  return (
    <ContainerAdaptavel sx={{ minHeight: "40vh" }}>{body}</ContainerAdaptavel>
  );
}

SectorModal.modal = {
  ADD: "ADD",
  DEL: "DEL",
  UPD: "UPD",
};

export default SectorModal;
