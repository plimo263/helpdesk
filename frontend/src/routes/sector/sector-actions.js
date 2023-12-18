import { toast } from "react-toastify";
import fetchRedux from "../../api/fetch_redux";
import { ToastErro } from "../../utils/toast-erro";

export const SECTOR_INIT = "SECTOR_INIT";
export const SECTOR_ADD = "SECTOR_ADD";
export const SECTOR_UPD = "SECTOR_UPD";
export const SECTOR_DEL = "SECTOR_DEL";
export const SECTOR_SET_MODAL = "SECTOR_SET_MODAL";
export const SECTOR_CLOSE_MODAL = "SECTOR_CLOSE_MODAL";

const ROUTES = ["/sector"];
// Recupera todos os setores
export const sectorInit = () => (dispatch) => {
  fetchRedux(
    ROUTES[0],
    "GET",
    null,
    (response) => {
      dispatch({
        type: SECTOR_INIT,
        data: response,
      });
    },
    () => {},
    (err) => ToastErro(err)
  );
};
// Adiciona/atualiza um setor
export const sectorAddUpd = (obj, setWait) => (dispatch) => {
  fetchRedux(
    ROUTES[0],
    obj.id ? "PUT" : "POST",
    obj,
    (response) => {
      //
      dispatch({
        type: obj.id ? SECTOR_UPD : SECTOR_ADD,
        data: response.data,
      });
    },
    () => setWait(),
    (err) => ToastErro(err)
  );
};
// Excluir um setor
export const sectorDel = (obj, setWait) => (dispatch) => {
  fetchRedux(
    ROUTES[0],
    "DELETE",
    obj,
    (response) => {
      toast.dark(response.sucesso, { type: "success" });
      //
      dispatch({
        type: SECTOR_DEL,
        data: obj.id,
      });
    },
    () => setWait(),
    (err) => ToastErro(err)
  );
};
// Setando o modal
export const sectorSetModal = (obj) => ({
  type: SECTOR_SET_MODAL,
  data: obj,
});

//Fechando o modal
export const sectorCloseModal = () => ({
  type: SECTOR_CLOSE_MODAL,
});
