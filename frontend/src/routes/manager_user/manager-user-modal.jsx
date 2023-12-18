import React from "react";
import ManagerUserAddUpd from "./manager-user-add-upd";
import ManagerUserDel from "./manager-user-del";
import ContainerAdaptavel from "../../components/container-adaptavel";
import ManagerUserChangePassword from "./manager-user-change-password";

function ManagerUserModal({ modal }) {
  let body;
  switch (modal.type) {
    case ManagerUserModal.modal.ADD:
    case ManagerUserModal.modal.UPD:
      body = <ManagerUserAddUpd {...modal.data} />;
      break;
    case ManagerUserModal.modal.DEL:
      body = <ManagerUserDel {...modal.data} />;
      break;
    case ManagerUserModal.modal.UPD_PASSWORD:
      body = <ManagerUserChangePassword {...modal.data} />;
      break;
    default:
      break;
  }

  return (
    <ContainerAdaptavel sx={{ minHeight: "50vh" }}>{body}</ContainerAdaptavel>
  );
}

ManagerUserModal.modal = {
  ADD: "ADD",
  UPD: "UPD",
  DEL: "DEL",
  UPD_PASSWORD: "UPD_PASSWORD",
};

export default ManagerUserModal;
