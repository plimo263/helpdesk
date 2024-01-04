import React from "react";
import { Box, Stack } from "@mui/material";
import { Caption } from "../components";
import _ from "lodash";
import Utilitarios from "../utils/utilitarios";
import { colorsGradient, GraficoItemTooltip } from "../components/graficos";

// Esta função gera o roulo para o grafico, usado em Tooltip do recharts. Ela ja tem
// Estilizações para modo claro/escuro
export const fnGerarToolTipMonetario = ({ payload }) => {
  if (payload && payload.length > 0) {
    // Nome do campo
    const nome = payload[0].payload.name;
    // Passa sobre cada item e pegue o dataKey e value
    const resultado = _.map(payload, (val, idx) => {
      const { value, dataKey } = val;
      return (
        <ValorLegenda
          key={idx}
          chave={dataKey}
          idx={idx}
          valor={Utilitarios.converter(value)}
        />
      );
    });
    return <GraficoItemTooltip titulo={nome} valor={resultado} />;
  }
  return null;
};
//

export const fnGerarToolTip = ({ payload }) => {
  if (payload && payload.length > 0) {
    // Nome do campo
    const nome = payload[0].payload.name;
    // Passa sobre cada item e pegue o dataKey e value
    const resultado = _.map(payload, (val, idx) => {
      const { value, dataKey } = val;
      return <ValorLegenda key={idx} chave={dataKey} idx={idx} valor={value} />;
    });
    return <GraficoItemTooltip titulo={nome} valor={resultado} />;
  }
  return null;
};

// Componente para a legenda que faz uso de valores monetarios
export const LegendaGraficoMonetario = ({ children, dataKey }) => (
  <>
    <Stack
      spacing={2}
      direction="row"
      justifyContent="center"
      sx={{ mt: 1, width: "100%", overflowX: "auto" }}
    >
      {_.map(_.keys(dataKey), (k, idx) => {
        const valor = parseFloat(dataKey[k].toFixed(2));
        return (
          <ValorLegenda
            key={k}
            idx={idx}
            chave={k}
            valor={Utilitarios.converter(valor < 0 ? valor * -1 : valor)}
          />
        );
      })}
    </Stack>
    {children}
  </>
);

// Componente para a legenda que faz uso de valores monetarios
export const LegendaGrafico = ({ children, dataKey }) => (
  <>
    <Stack
      spacing={2}
      direction="row"
      justifyContent="center"
      sx={{ mt: 1, width: "100%", overflowX: "auto" }}
    >
      {_.map(_.keys(dataKey), (k, idx) => {
        const valor = parseFloat(dataKey[k].toFixed(2));
        return <ValorLegenda key={k} idx={idx} chave={k} valor={valor} />;
      })}
    </Stack>
    {children}
  </>
);

// Componente que representa a legenda com os itens contidos e colorizações
// como representadas no grafico
const ValorLegenda = ({ chave, valor, idx }) => (
  <Stack sx={{ my: 0.2 }} direction="row" spacing={1} alignItems="center">
    <Box
      sx={{
        borderRadius: 1,
        width: 24,
        height: 12,
        backgroundColor: colorsGradient[idx],
      }}
    />
    <Caption sx={{ whiteSpace: "nowrap" }}>
      {chave} - {valor}
    </Caption>
  </Stack>
);
