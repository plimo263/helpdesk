import React from "react";
import ContainerAdaptavel from "../../components/container-adaptavel";
import ConfigHelpdeskDel from "./config-helpdesk-del";
import ConfigHelpdeskAddUpd from "./config-helpdesk-add-upd";

function ConfigHelpdeskModal({ modal }) {
  let body;
  switch (modal.type) {
    case ConfigHelpdeskModal.modal.ADD:
    case ConfigHelpdeskModal.modal.UPD:
      body = <ConfigHelpdeskAddUpd item={modal.data} />;
      break;
    case ConfigHelpdeskModal.modal.DEL:
      body = <ConfigHelpdeskDel item={modal.data} />;
      break;
    default:
      break;
  }

  return <ContainerAdaptavel>{body}</ContainerAdaptavel>;
}

ConfigHelpdeskModal.modal = {
  ADD: "ADD",
  DEL: "DEL",
  UPD: "UPD",
};

export default ConfigHelpdeskModal;
