import { toast } from "react-toastify";
import fetchRedux from "../../api/fetch_redux";
import { ToastErro } from "../../utils/toast-erro";

export const MANAGER_USER_INIT = "MANAGER_USER_INIT";
export const MANAGER_USER_SET_MODAL = "MANAGER_USER_SET_MODAL";
export const MANAGER_USER_CLOSE_MODAL = "MANAGER_USER_CLOSE_MODAL";
export const MANAGER_USER_PUT = "MANAGER_USER_PUT";
export const MANAGER_USER_POST = "MANAGER_USER_POST";
export const MANAGER_USER_DEL = "MANAGER_USER_DEL";

const ROUTES = ["/manager_user"];

// Recupera a lista com os usuarios cadastrados no sistema.
export const managerUserInit = () => (dispatch) => {
  fetchRedux(
    ROUTES[0],
    "GET",
    null,
    (response) => {
      dispatch({
        type: MANAGER_USER_INIT,
        data: response,
      });
    },
    () => {},
    (err) => ToastErro(err)
  );
};

export const managerUserSetModal = (obj) => ({
  type: MANAGER_USER_SET_MODAL,
  data: obj,
});

export const managerUserCloseModal = () => ({
  type: MANAGER_USER_CLOSE_MODAL,
});
// Atualiza/deleta usuario do sistema
export const managerUserAddUpd = (obj, setWait) => (dispatch) => {
  fetchRedux(
    ROUTES[0],
    obj.id ? "PUT" : "POST",
    obj,
    (response) => {
      toast.dark(response.sucesso, { type: "success" });

      dispatch({
        type: obj.id ? MANAGER_USER_PUT : MANAGER_USER_POST,
        data: response.data,
      });
    },
    () => {
      setWait();
    },
    (err) => ToastErro(err)
  );
};

// Exclui usuario do sistema.
export const managerUserDel = (obj, setWait) => (dispatch) => {
  fetchRedux(
    ROUTES[0],
    "DELETE",
    obj,
    (response) => {
      toast.dark(response.sucesso, { type: "success" });

      dispatch({
        type: MANAGER_USER_DEL,
        data: obj.id,
      });
    },
    () => {
      setWait();
    },
    (err) => ToastErro(err)
  );
};
