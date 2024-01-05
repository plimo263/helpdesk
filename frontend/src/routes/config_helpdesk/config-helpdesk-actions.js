import { toast } from "react-toastify";
import fetchRedux from "../../api/fetch_redux";
import { ToastErro } from "../../utils/toast-erro";

export const CONFIG_HELPDESK_INIT = "CONFIG_HELPDESK_INIT";
export const CONFIG_HELPDESK_ADD = "CONFIG_HELPDESK_ADD";
export const CONFIG_HELPDESK_UPD = "CONFIG_HELPDESK_UPD";
export const CONFIG_HELPDESK_DEL = "CONFIG_HELPDESK_DEL";
export const CONFIG_HELPDESK_SET_MODAL = "CONFIG_HELPDESK_SET_MODAL";
export const CONFIG_HELPDESK_CLOSE_MODAL = "CONFIG_HELPDESK_CLOSE_MODAL";

const ROUTES = ["/config_helpdesk"];

export const configHelpdeskInit = () => (dispatch) => {
  fetchRedux(
    ROUTES[0],
    "GET",
    null,
    (response) => {
      dispatch({
        type: CONFIG_HELPDESK_INIT,
        data: response,
      });
    },
    () => {},
    (err) => ToastErro(err)
  );
};

export const configHelpdeskAddUpd =
  (obj, setWait, fnCallback) => (dispatch) => {
    fetchRedux(
      ROUTES[0],
      obj.id ? "PUT" : "POST",
      obj,
      (response) => {
        toast.dark(response.sucesso, { type: "success" });

        if (fnCallback) fnCallback();

        dispatch({
          type: obj.id ? CONFIG_HELPDESK_UPD : CONFIG_HELPDESK_ADD,
          data: response.data,
        });
      },
      () => {
        setWait();
      },
      (err) => ToastErro(err)
    );
  };

export const configHelpdeskDel = (obj, setWait) => (dispatch) => {
  fetchRedux(
    ROUTES[0],
    "DELETE",
    obj,
    (response) => {
      toast.dark(response.sucesso, { type: "success" });
      //
      dispatch({
        type: CONFIG_HELPDESK_DEL,
        data: obj.id,
      });
    },
    () => {
      setWait();
    },
    (err) => ToastErro(err)
  );
};

export const configHelpdesSetModal = (data) => ({
  type: CONFIG_HELPDESK_SET_MODAL,
  data,
});

export const configHelpdesCloseModal = () => ({
  type: CONFIG_HELPDESK_CLOSE_MODAL,
});
