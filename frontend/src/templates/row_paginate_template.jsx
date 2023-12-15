import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Container,
  Divider,
  Fab,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import { Body2, H6, Icone } from "../components";

const STR = {
  titlePagination: "Clique para alterar entre as paginas",
  titleButtonOptions: "Clique para exibir as opções",
  labelButtonOptions: "Opções",
};
function RowPaginateTemplate({
  titlePage,
  titleButtonAdd,
  labelButtonAdd,
  iconButtonAdd,
  onClickAdd,
  totalPages,
  pageCurrent,
  onSetPage,
  headerAboveTable,
  header,
  sxHeader,
  rows,
  backgroundPage,
}) {
  const isMobile = useTheme()?.isMobile;
  let bgPage = useTheme()?.backgroundPage;
  if (backgroundPage) {
    bgPage = backgroundPage;
  }

  return (
    <Container maxWidth={false} sx={{ my: 1, background: bgPage }}>
      <H6>{titlePage}</H6>

      <Paginate
        totalPages={totalPages}
        pageCurrent={pageCurrent}
        onSetPage={onSetPage}
        onClickAdd={onClickAdd}
        labelButtonAdd={labelButtonAdd}
        iconButtonAdd={iconButtonAdd}
        titleButtonAdd={titleButtonAdd}
      />
      {headerAboveTable && headerAboveTable}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={sxHeader}>
            <TableRow>
              {header.map((value) => (
                <TableCell sx={sxHeader} key={value}>
                  {value}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((item, idx) => (
              <TableRow
                onClick={item.onClick}
                sx={{ cursor: "pointer" }}
                hover
                key={idx}
              >
                {header.map((k) => (
                  <TableCell
                    sx={{ whiteSpace: isMobile ? "nowrap" : "normal" }}
                    key={k}
                  >
                    {item[k]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
//
const ButtonAdd = ({
  titleButtonAdd,
  onClickAdd,
  iconButtonAdd,
  labelButtonAdd,
}) => {
  const isMobile = useTheme()?.isMobile;
  const sxFab = {};
  if (isMobile) {
    sxFab.position = "fixed";
    sxFab.right = 16;
    sxFab.bottom = 72;
  } else {
    sxFab.mb = 0;
  }
  return (
    <Fab
      size="small"
      title={titleButtonAdd}
      color="success"
      sx={sxFab}
      variant={isMobile ? "circular" : "extended"}
      onClick={onClickAdd}
    >
      <Icone icone={iconButtonAdd} />
      {!isMobile && <Body2>{labelButtonAdd}</Body2>}
    </Fab>
  );
};
//

const Paginate = ({
  totalPages,
  pageCurrent,
  onSetPage,
  onClickAdd,
  labelButtonAdd,
  iconButtonAdd,
  titleButtonAdd,
}) => {
  return (
    <Stack sx={{ mb: 1 }}>
      <Divider sx={{ mb: 1 }} />
      <Stack direction="row" justifyContent="space-between">
        {!pageCurrent || pageCurrent === 0 ? (
          <Box />
        ) : (
          <Pagination
            size="medium"
            title={STR.titlePagination}
            color="primary"
            count={totalPages}
            page={pageCurrent}
            onChange={(evt, value) => onSetPage(value)}
          />
        )}
        <ButtonAdd
          onClickAdd={onClickAdd}
          labelButtonAdd={labelButtonAdd}
          iconButtonAdd={iconButtonAdd}
          titleButtonAdd={titleButtonAdd}
        />
      </Stack>
    </Stack>
  );
};
//

//
RowPaginateTemplate.defaultProps = {
  titlePage: "Template de paginação como registro",
  titleButtonAdd: "Clique para incluir",
  labelButtonAdd: "Adicionar",
  iconButtonAdd: "Add",
  onClickAdd: () => {},
  totalPages: 1,
  pageCurrent: 1,
  animateItems: null,
  onSetPage: () => {},
  sxHeader: { background: "#d9d9d9" },
};
//
RowPaginateTemplate.propTypes = {
  /** Um componente React que fica acima da tabela para dar algum destaque */
  headerAboveTable: PropTypes.node,
  /** Estilos para o cabecalho da tabela */
  sxHeader: PropTypes.object,
  /** O titulo da pagina, texto que fica na parte superior central da tela. */
  titlePage: PropTypes.string.isRequired,
  /** Titulo para o botão de inclusão */
  titleButtonAdd: PropTypes.string,
  /** Rotulo para o botão de adição */
  labelButtonAdd: PropTypes.string,
  /** Uma string que representa um Icone para o botão de adição. Aceitas strings de icones do MUI  */
  iconButtonAdd: PropTypes.string,
  /** Uma função de callback para o botão de adição */
  onClickAdd: PropTypes.func.isRequired,
  /** Um inteiro que representa o total de paginas a serem exibidas */
  totalPages: PropTypes.number.isRequired,
  /** Um inteiro que representa a pagina atual */
  pageCurrent: PropTypes.number.isRequired,
  /** Uma função de callback que controla a alteração entre as paginas */
  onSetPage: PropTypes.func.isRequired,
  /** Uma lista que representa o cabecalho da tabela a pagina */
  header: PropTypes.arrayOf(PropTypes.string).isRequired,
  /** Uma lista com listas aninhadas que representam os registros da tabela. Os objetos desta lista devem ter atributos que remetam a itens do header */
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  /** Envia animação relacionado aos itens, animação de entrada/saida */
  animateItems: PropTypes.oneOf(["slide", "grow", "fade", null]),
  /** Background da pagina da tabela */
  backgroundPage: PropTypes.string,
};

export default RowPaginateTemplate;
