import { toast } from "react-toastify";
import fetchRedux from "../../api/fetch_redux";
import { ToastErro } from "../../utils/toast-erro";
import _ from "lodash";

export const HELPDESK_INIT = "HELPDESK_INIT";
export const HELPDESK_INIT_ESTATISTICOS = "HELPDESK_INIT_ESTATISTICOS";
export const HELPDESK_PAGINA = "HELPDESK_PAGINA";
export const HELPDESK_LIMPAR_DADOS = "HELPDESK_LIMPAR_DADOS";
export const HELPDESK_FECHAR_MODAL = "HELPDESK_FECHAR_MODAL";
export const HELPDESK_SET_MODAL = "HELPDESK_SET_MODAL";
export const HELPDESK_FILTRO = "HELPDESK_FILTRO";
export const HELPDESK_FILTRO_LIMPAR = "HELPDESK_FILTRO_LIMPAR";
export const HELPDESK_ABRIR_TICKET = "HELPDESK_ABRIR_TICKET";
export const HELPDESK_ATUALIZAR_TICKET = "HELPDESK_ATUALIZAR_TICKET";
export const HELPDESK_ALTERAR_AGENTE = "HELPDESK_ALTERAR_AGENTE";
export const HELPDESK_ASSUNTO_INIT = "HELPDESK_ASSUNTO_INIT";
export const HELPDESK_ASSUNTO_ADD = "HELPDESK_ASSUNTO_ADD";
export const HELPDESK_ASSUNTO_UPD = "HELPDESK_ASSUNTO_UPD";
export const HELPDESK_ASSUNTO_DEL = "HELPDESK_ASSUNTO_DEL";

export const HELPDESK_STATUS_UPD = "HELPDESK_STATUS_UPD";
export const HELPDESK_STATUS_ADD = "HELPDESK_STATUS_ADD";
export const HELPDESK_STATUS_DEL = "HELPDESK_STATUS_DEL";
export const HELPDESK_STATUS_INIT = "HELPDESK_STATUS_INIT";
export const HELPDESK_STATUS_FROM_TO = "HELPDESK_STATUS_FROM_TO";
//
export const ROTAS = [
  "/helpdesk",
  "/helpdesk_filtro",
  "/helpdesk_assunto",
  "/helpdesk_status",
  "/helpdesk_envolvidos",
];

export const helpdeskInit = () => (dispatch) => {
  // A listagem de dados para construir o chamado
  fetchRedux(
    `${ROTAS[0]}?dados=true`,
    "GET",
    null,
    (resposta) => {
      dispatch({
        type: HELPDESK_INIT,
        data: resposta,
      });
    },
    () => {},
    (err) => ToastErro(err)
  );

  fetchRedux(
    `${ROTAS[0]}?dados_estatisticos=true`,
    "GET",
    null,
    (resposta) => {
      dispatch({
        type: HELPDESK_INIT_ESTATISTICOS,
        data: resposta,
      });
    },
    () => {},
    (err) => ToastErro(err)
  );
};
// Atualiza os dados estatisticos do helpdesk
export const helpdeskInitEstatisticosUpdate = (data) => ({
  type: HELPDESK_INIT_ESTATISTICOS,
  data: data,
});
// Atualiza a pagina com os novos dados
export const helpdeskPaginaUpdate = (data) => ({
  type: HELPDESK_PAGINA,
  data: {
    helpdesk: data,
  },
});
// Salta entre as paginas
export const helpdeskPagina =
  (idPagina, setAguardar, objOrdenacao) => (dispatch) => {
    // Obtem os chamados do usuário verificando de tem ordenacao
    //
    const params = new URLSearchParams();
    params.append("pagina", idPagina);
    // Se ordenacao for ativada deve-se ser inserida aos parametros
    if (objOrdenacao) {
      _.forEach(_.keys(objOrdenacao), (k) => {
        params.append(k, objOrdenacao[k]);
      });
    } else {
      objOrdenacao = {
        coluna: null,
        ordenar: null,
      };
    }

    fetchRedux(
      `${ROTAS[0]}?${params.toString()}`,
      "GET",
      null,
      (resposta) => {
        dispatch({
          type: HELPDESK_PAGINA,
          data: {
            idPagina,
            helpdesk: resposta,
            ...objOrdenacao,
          },
        });
      },
      setAguardar,
      (err) => ToastErro(err)
    );
  };
// Limpar os dados para sair
export const helpdeskLimparDados = () => ({
  type: HELPDESK_LIMPAR_DADOS,
});
// Ativar modal
export const helpdeskSetModal = (obj) => ({
  type: HELPDESK_SET_MODAL,
  data: obj,
});
// FecharModal
export const helpdeskFecharModal = () => ({
  type: HELPDESK_FECHAR_MODAL,
});
//
export const helpdeskFiltroAdd =
  (filtro, tipoDeFiltro, fnRetornar) => (dispatch) => {
    // Obtem os chamados do usuário
    fetchRedux(
      `${ROTAS[1]}?${filtro.toString()}`,
      "GET",
      null,
      (resposta) => {
        dispatch(helpdeskFecharModal());
        if (fnRetornar) {
          fnRetornar();
        }
        dispatch({
          type: HELPDESK_FILTRO,
          data: {
            helpdeskFiltro: resposta,
            tipoDeFiltro: tipoDeFiltro,
          },
        });
      },
      () => {},
      (err) => ToastErro(err)
    );
  };
// Limpar filtro de helpdesk
export const helpdeskFiltroLimpar = () => ({
  type: HELPDESK_FILTRO_LIMPAR,
});
// Abrir ticket
export const helpdeskAddTicket =
  (formData, setAguardar, fnRetornoSucesso) => (dispatch) => {
    //  Abrir um novo ticket
    fetchRedux(
      ROTAS[0],
      "POST",
      formData,
      (resposta) => {
        toast.dark(resposta.sucesso, {
          type: "success",
        });
        dispatch(helpdeskFecharModal());
        // Funcao executada quando sucesso na insercao
        if (fnRetornoSucesso) {
          fnRetornoSucesso();
        }
        //
        dispatch({
          type: HELPDESK_ABRIR_TICKET,
          data: resposta.data,
        });
      },
      setAguardar,
      (err) => ToastErro(err)
    );
  };
// Para uma atualização do ticket
export const helpdeskAddInteracao =
  (formData, setAguardar, fnRetornoSucesso) => (dispatch) => {
    //  Abrir um novo ticket
    fetchRedux(
      ROTAS[0],
      "PUT",
      formData,
      (resposta) => {
        toast.dark(resposta.sucesso, {
          type: "success",
        });
        // Executa uma acao em caso de sucesso
        if (fnRetornoSucesso) {
          fnRetornoSucesso();
        }
        //
        dispatch({
          type: HELPDESK_ATUALIZAR_TICKET,
          data: resposta.data,
        });
      },
      setAguardar,
      (err) => ToastErro(err)
    );
  };
//
export const helpdeskAlterarAgente =
  (formData, setAguardar, fnRetornoSucesso) => (dispatch) => {
    fetchRedux(
      ROTAS[0],
      "PATCH",
      formData,
      (resposta) => {
        toast.dark(resposta.sucesso, {
          type: "success",
        });
        // Executa uma acao em caso de sucesso
        if (fnRetornoSucesso) {
          fnRetornoSucesso();
        }
        //
        dispatch({
          type: HELPDESK_ALTERAR_AGENTE,
          data: resposta.data,
        });
      },
      setAguardar,
      (err) => ToastErro(err)
    );
  };

//
export const helpdeskGetAssunto = () => (dispatch) => {
  fetchRedux(
    ROTAS[2],
    "GET",
    null,
    (resposta) => {
      dispatch({
        type: HELPDESK_ASSUNTO_INIT,
        data: resposta,
      });
    },
    () => {},
    (err) => ToastErro(err)
  );
};
// Adicionar/atualizar assunto
export const helpdeskAddUpdAssunto = (data, setWait) => (dispatch) => {
  //  Abrir um novo ticket
  fetchRedux(
    ROTAS[2],
    data.id_assunto ? "PUT" : "POST",
    data,
    (resposta) => {
      toast.dark(resposta.sucesso, {
        type: "success",
      });
      dispatch(helpdeskFecharModal());
      //
      dispatch({
        type: data.id_assunto ? HELPDESK_ASSUNTO_UPD : HELPDESK_ASSUNTO_ADD,
        data: resposta.data,
      });
    },
    setWait,
    (err) => ToastErro(err)
  );
};
// Excluir
export const helpdeskDelAssunto = (data, setWait) => (dispatch) => {
  //  Abrir um novo ticket
  fetchRedux(
    ROTAS[2],
    "DELETE",
    data,
    (resposta) => {
      toast.dark(resposta.sucesso, {
        type: "success",
      });
      dispatch(helpdeskFecharModal());
      //
      dispatch({
        type: HELPDESK_ASSUNTO_DEL,
        data: data.id_assunto,
      });
    },
    setWait,
    (err) => ToastErro(err)
  );
};
//
export const helpdeskGetStatus = () => (dispatch) => {
  fetchRedux(
    ROTAS[3],
    "GET",
    null,
    (resposta) => {
      dispatch({
        type: HELPDESK_STATUS_INIT,
        data: resposta,
      });
    },
    () => {},
    (err) => ToastErro(err)
  );
};
// Adicionar/atualizar status
export const helpdeskAddUpdStatus = (data, setWait) => (dispatch) => {
  fetchRedux(
    ROTAS[3],
    data.id_status ? "PUT" : "POST",
    data,
    (resposta) => {
      toast.dark(resposta.sucesso, {
        type: "success",
      });
      dispatch(helpdeskFecharModal());
      //
      dispatch({
        type: data.id_status ? HELPDESK_STATUS_UPD : HELPDESK_STATUS_ADD,
        data: resposta.data,
      });
    },
    setWait,
    (err) => ToastErro(err)
  );
};
// Excluir
export const helpdeskDelStatus = (data, setWait) => (dispatch) => {
  //  Abrir um novo ticket
  fetchRedux(
    ROTAS[3],
    "DELETE",
    data,
    (resposta) => {
      toast.dark(resposta.sucesso, {
        type: "success",
      });
      dispatch(helpdeskFecharModal());
      //
      dispatch({
        type: HELPDESK_STATUS_DEL,
        data: data.id_status,
      });
    },
    setWait,
    (err) => ToastErro(err)
  );
};
// Atualizar a lista dos status PARA
export const helpdeskUpdFromToStatus = (data, setWait) => (dispatch) => {
  fetchRedux(
    ROTAS[3],
    "PATCH",
    data,
    (resposta) => {
      toast.dark(resposta.sucesso, {
        type: "success",
      });
      dispatch(helpdeskFecharModal());
      //
      dispatch({
        type: HELPDESK_STATUS_FROM_TO,
        data: resposta.data,
      });
    },
    setWait,
    (err) => ToastErro(err)
  );
};

// Atualizar a lista dos emails
export const helpdeskUpdInvolved = (data, setWait) => (dispatch) => {
  fetchRedux(
    ROTAS[4],
    "PUT",
    data,
    (resposta) => {
      // toast.dark(resposta.sucesso, {
      //   type: "success",
      // });
      dispatch(helpdeskFecharModal());
      window.location.reload();
    },
    setWait,
    (err) => ToastErro(err)
  );
};
