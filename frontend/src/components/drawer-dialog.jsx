import PropTypes from "prop-types";
import { useMediaQuery, useTheme } from "@mui/material";
import { DialogExibicao as Dialog, DrawerExibicao } from ".";

//
const DrawerDialog = ({ fnGetCorpo, fecharModal }) => {
  const isMobile = useMediaQuery(useTheme()?.breakpoints?.down("md"));
  let corpo = fnGetCorpo();

  return (
    <>
      {isMobile ? (
        <DrawerExibicao corpo={corpo} fecharDrawer={fecharModal} />
      ) : (
        <Dialog corpo={corpo} comoSlide fecharDialogo={fecharModal} />
      )}
    </>
  );
};
//
DrawerDialog.propTypes = {
  /** Uma funcao que irá lidar com a logica para escolha do conteudo do modal. Se retornar null isto quer dizer que o modal não será exibido */
  fnGetCorpo: PropTypes.func.isRequired,
  /** Uma funcao responsavel por fechar o modal. Lembre-se de que esta função deve de alguma forma influenciar no retorno da função fnGetCorpo fazendo ela retornar null */
  fecharModal: PropTypes.func.isRequired,
};
export default DrawerDialog;
