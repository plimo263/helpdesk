import { toast } from "react-toastify";

export const ToastErro = (erro) => {
  toast.dark(erro, {
    type: "error",
    toastId: "ERRO",
  });
};
