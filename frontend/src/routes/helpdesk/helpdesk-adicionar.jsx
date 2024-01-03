import _ from "lodash";
import { useMediaQuery, useTheme, Container, Grow } from "@mui/material";
import React, { useCallback } from "react";
import { H5, EntradaForm } from "../../components";
import { useDispatch, useSelector } from "react-redux";
import { useToggle } from "react-use";
import * as yup from "yup";
import { obterValidador, VALIDADOR_TIPO } from "../../utils/validadores";
import {
  selectAssuntos,
  selectColaboradores,
  selectColaboradoresFormatados,
  selectIsAgente,
  selectUsuario,
} from "./helpdesk-seletores";
import { helpdeskAddTicket } from "./helpdesk-actions";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import axios from "axios";
import { ToastErro } from "../../utils/toast-erro";

const selectColaboradoresSolicitantes = createSelector(
  selectColaboradores,
  (val) => {
    return _.map(val, (item) => [
      item.id_usuario,
      `${_.capitalize(item.nome)} - ${item.email}`,
    ]);
  }
);

// Formulario para abertura de um ticket
const HelpdeskAdicionar = () => {
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));
  const [wait, setWait] = useToggle();
  const dispatch = useDispatch();
  const itensAssunto = useSelector(selectAssuntos);
  const colaboradores = useSelector(selectColaboradoresFormatados);
  const solicitantes = useSelector(selectColaboradoresSolicitantes);
  const usuario = useSelector(selectUsuario);
  const isAgente = useSelector(selectIsAgente);
  const history = useHistory();
  console.log(usuario);
  //
  const schema = [
    {
      type: "select",
      name: "idassunto",
      itens: itensAssunto,
      label: "Assunto",
      autoFormat: true,
    },
    {
      type: "text",
      name: "titulo",
      label: "Título",
      placeholder: "Descreva um titulo ao problema",
    },

    { type: "textrich", name: "descricao" },
    { type: "file", name: "arquivo", multiple: true, label: "Arquivos" },
    {
      type: "select",
      name: "copia_chamado",
      itens: colaboradores,
      autoFormat: true,
      isMulti: true,
      label: "Colaboradores envolvidos",
    },
    {
      type: "switch",
      name: "enviar_email",
      defaultChecked: true,
      label: "Enviar e-mail de notificação ",
    },
  ];
  let schemaValidator = {
    titulo: obterValidador(VALIDADOR_TIPO.texto, 3),
    idassunto: obterValidador(VALIDADOR_TIPO.selectUnico),
    descricao: yup.array().min(1).required(),
  };
  //
  const schemaMessageError = {
    titulo: "* Mínimo de 3 caracteres",
    idassunto: "* Escolha um assunto",
    descricao: "* Necessário preencher a descrição do ocorrido",
  };
  // Se for agente devemos ter um select para o colaborador
  if (isAgente) {
    schema.splice(0, 0, {
      type: "select",
      name: "id_usuario",
      itens: solicitantes,
      autoFormat: true,
      label: "Solicitante",
    });
    //
    schemaValidator.id_usuario = obterValidador(VALIDADOR_TIPO.selectUnico);
    schemaMessageError.id_usuario = "* Escolher o solicitante";
  }
  //
  schemaValidator = yup.object().shape(schemaValidator);

  const onResultSuccess = useCallback(() => {
    if (isMobile) {
      history.goBack();
    }
  }, [isMobile, history]);
  //
  const onSubmit = useCallback(
    async (val) => {
      const obj = {
        enviar_email:
          typeof val.enviar_email === "undefined" ? true : val.enviar_email,
        titulo: val.titulo,
        idstatus: 1, //aberto
        idassunto: parseInt(val.idassunto.value),
        descricao: val.descricao,
        copia_chamado: [parseInt(usuario.id)],
        id_usuario: parseInt(usuario.id),
        arquivo: [],
      };

      // Se for agente recupere id_usuario informado
      if (isAgente) {
        obj.id_usuario = parseInt(val.id_usuario.value);
      }
      if (val.arquivo) {
        const formData = new FormData();
        [...val.arquivo].forEach((arq) => {
          formData.append("arquivo", arq);
        });
        setWait();
        // Enviar arquivos ao bucket
        try {
          const response = await axios.post("/bucket", formData, {
            headers: {
              ContentType: "multipart/form-data",
            },
          });
          obj.arquivo = _.map(response.data.arquivo, (val) => val.url);
        } catch (error) {
          if (error?.message) {
            ToastErro(error.message);
          } else {
            ToastErro("Erro ao enviar arquivos");
          }
          return false;
        } finally {
          setWait();
        }
      }
      // Verifique se teve outros usuarios envolvidos
      if (val.copia_chamado?.length > 0) {
        _.forEach(val.copia_chamado, (reg) => {
          obj.copia_chamado.push(parseInt(reg.value));
        });
      }

      //
      dispatch(helpdeskAddTicket(obj, setWait, onResultSuccess));
    },
    [dispatch, isAgente, setWait, usuario, onResultSuccess]
  );

  return (
    <Grow in unmountOnExit>
      <Container maxWidth="md" sx={{ minHeight: isMobile ? "70vh" : "50vh" }}>
        <H5>Abertura de Ticket</H5>
        <EntradaForm
          schema={schema}
          schemaMessageError={schemaMessageError}
          schemaValidator={schemaValidator}
          wait={wait}
          onSubmit={onSubmit}
        />
      </Container>
    </Grow>
  );
};

HelpdeskAdicionar.rota = "/helpdesk_adicionar";

export default HelpdeskAdicionar;
