import { format, isDate, parseISO } from "date-fns";

class Utils {
  static converterCelular(valor) {
    if (valor) {
      const novoValor = valor
        .replace("(", "")
        .replace(")", "")
        .replace(" ", "")
        .replace("-", "");
      const ddd = novoValor.substring(0, 2);
      const numeroParte1 = novoValor.substring(2, 7);
      const numeroParte2 = novoValor.substring(7, novoValor.length);
      return `(${ddd}) ${numeroParte1}-${numeroParte2}`;
    } else {
      return valor;
    }
  }
  static converter(valor) {
    if (isNaN(valor)) return "R$ 0,00";
    return `R$ ${parseFloat(valor)
      .toFixed(2)
      .replace(".", ",")
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.")}`;
  }
  static desconverter(valor) {
    valor = valor.replace(/\./g, "");
    valor = valor.replace(",", ".");
    valor = valor.replace("R$", "").trim();

    return valor;
  }
  static converterDataHora(valor) {
    return valor
      ? format(isDate(valor) ? valor : parseISO(valor), "dd/MM/yy HH:mm")
      : valor;
  }
  static converterPercentual(valor) {
    let newValor = (valor * 100).toFixed(2);
    return isNaN(newValor) ? "0.00 %" : newValor + " %";
  }
  static converterData(valor) {
    return isDate(valor)
      ? format(valor, "dd/MM/yyyy")
      : format(parseISO(valor), "dd/MM/yyyy");
  }
}

export default Utils;
