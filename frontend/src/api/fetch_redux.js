import { ToastErro } from "../utils/toast-erro";
import axios from "axios";

const ERRO_INTERNO_SERVIDOR = "Erro interno do servidor.";

function fnError(error) {
  ToastErro(error);
}

export default async function fetchRedux(
  route,
  method,
  formData,
  onSuccess,
  onWait,
  onError = fnError
) {
  let fnExec;
  let innerFormData = formData;
  let innerRoute = route;
  switch (method) {
    case "POST":
      fnExec = axios.post;
      break;
    case "GET":
    default:
      fnExec = axios.get;
      innerRoute =
        formData !== null ? `${route}?${formData.toString()}` : route;
      break;
    case "PUT":
      fnExec = axios.put;
      break;
    case "PATCH":
      fnExec = axios.patch;
      break;
    case "DELETE":
      fnExec = axios.delete;
      innerFormData = { data: formData };
      break;
  }
  //
  if (onWait) onWait(true);
  //
  try {
    const resp = await fnExec(innerRoute, innerFormData);
    if (resp.status !== 200) {
      onError(ERRO_INTERNO_SERVIDOR);
      return false;
    }
    if (resp.data.erro) {
      onError(resp.data.erro);
      return false;
    }
    // Deu tudo certo execute a funcao repassada para caso de sucesso
    onSuccess(resp.data);
  } catch (e) {
    console.dir(e);
    if (e?.response?.data?.message) {
      ToastErro(e.response.data.message);
    } else {
      ToastErro(String(e));
    }
    return false;
  } finally {
    if (onWait) onWait(false);
  }
}
