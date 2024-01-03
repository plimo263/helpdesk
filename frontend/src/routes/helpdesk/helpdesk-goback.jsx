import { Button } from "@mui/material";
import React, { useCallback } from "react";
import { useHistory } from "react-router-dom";
import { Icone } from "../../components";

function HelpdeskGoBack() {
  const tituloBotao = "Retornar a tela de chamados";
  const history = useHistory();
  const fnRetornoSucesso = useCallback(() => {
    // Caso tenha vindo de um encaminhamento de link direto, para retornar a pagina de helpdesk deve ser feito um replace
    if (history.action === "POP") {
      history.replace("/helpdesk");
    } else {
      // Se não pode usar o goBack
      history.goBack();
    }
  }, [history]);
  return (
    <Button
      variant="text"
      size="small"
      title={tituloBotao}
      startIcon={<Icone icone="ArrowBack" />}
      onClick={fnRetornoSucesso}
      sx={{ ml: 1 }}
    >
      RETORNAR
    </Button>
  );
}

export default HelpdeskGoBack;
