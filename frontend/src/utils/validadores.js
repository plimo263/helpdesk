/**
 * Registra todos os validadores para campos padrão no sistema
 */
import * as yup from "yup";

export const VALIDADOR_TIPO = {
  senha: "SENHA",
  selectUnico: "SELECT_UNICO",
  selectMultiplo: "SELECT_MULTIPLO",
  texto: "TEXTO",
  celular: "CELULAR",
  data: "DATA",
  hora: "HORA",
  arquivo: "ARQUIVO",
};

export function obterValidador(tipo, quantidadeCaracteres = 1) {
  switch (tipo) {
    case VALIDADOR_TIPO.data:
      return yup.date().required();
    case VALIDADOR_TIPO.senha:
      return yup
        .string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$!%#*?&]{8,}$/g
        )
        .required();
    case VALIDADOR_TIPO.hora:
      return yup
        .string()
        .matches(/^([0-1][0-9]|[2][0-3]):[0-5][0-9]$/g)
        .required();
    case VALIDADOR_TIPO.selectUnico:
      return yup
        .object()
        .shape({
          label: yup.string().min(1).required(),
          value: yup.string().min(1).required(),
        })
        .required();
    case VALIDADOR_TIPO.selectMultiplo:
      return yup
        .array(
          yup.object().shape({
            label: yup.string().min(1).required(),
            value: yup.string().min(1).required(),
          })
        )
        .min(1)
        .required();
    case VALIDADOR_TIPO.celular:
      return yup
        .string()
        .matches(/^\([0-9]{2}\) [9][0-9]{4}-[0-9]{4}$/g)
        .required();
    case VALIDADOR_TIPO.arquivo:
      return yup
        .mixed()
        .required()
        .test("name", "Obrigatorio arquivo", (value) => {
          return value && value[0]?.name.length > quantidadeCaracteres;
        });
    case VALIDADOR_TIPO.email:
      return yup.string().email().required();
    case VALIDADOR_TIPO.texto:
    default:
      return yup.string().min(quantidadeCaracteres).required();
  }
}
