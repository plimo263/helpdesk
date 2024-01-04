import {
  Chip,
  Container,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  useTheme,
} from "@mui/material";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import {
  Body1,
  Body2,
  Caption,
  FiltroPorPeriodo,
  H3,
  H6,
  Icone,
} from "../../components";
import { ToastErro } from "../../utils/toast-erro";
import { format } from "date-fns";
import _ from "lodash";
import {
  blue,
  blueGrey,
  cyan,
  green,
  orange,
  purple,
  red,
  yellow,
} from "@mui/material/colors";
import {
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { fnGerarToolTip } from "../../components/componentes-grafico";
import { GradientColor } from "../../components/graficos";
import useSWR from "swr";
import { useToggle } from "react-use";
import fetchGet from "../../api/fetch_mensagem";
import { ContainerAdaptavel, DrawerDialog } from "../../components";
import { VALIDADOR_TIPO, obterValidador } from "../../utils/validadores";
import GestaoHelpdeskFiltroAvancado from "./gestao-helpdesk-filtro-avancado";

const STR = {
  labelFilterAdvanced: "Filtro avançado",
  labelFilter: "Filtro por periodo",
  tickets: "Tickets",
  titleChartStatus: "Tickets por status",
  titleChartSubject: "Tickets por assunto",
  titleChartAgent: "Tickets por agente",
  titleChartSector: "Tickets por setor",
  titleChartUser: "Tickets por usuario",
  titleChartMonth: "Tickets por mês",
  timeMedium: "Tempo médio de atendimento (geral)",
  titleChartTimeMedium: "Tempo médio de atendimento por Assunto",
  filterNameStatus: "Status",
  filterErrorStatus: "* Escolha ao menos um Status",
  filterNameAgent: "Agente",
  filterErrorAgent: "* Escolha ao menos um Agente",
  filterNameSubject: "Assunto",
  filterErrorSubject: "* Escolha ao menos um Assunto",
  filterNameSector: "Setor",
  filterErrorSector: "* Escolha ao menos um Setor",
  filterNameUser: "Usuário",
  filterErrorUser: "* Escolha ao menos um Usuário",
  filterNamePlant: "Planta",
  filterErrorPlant: "* Escolha ao menos um Planta",
};

// const convertMinsAndHours = (mins) => {
//   const hours = parseInt(mins / 60);
//   const minsTime = parseInt(mins % 60);

//   return `${hours.toString().padStart(2, "0")}:${minsTime
//     .toString()
//     .padStart(2, "0")}`;
// };

const aspectDesktop = 1.5;
const aspectDesktopMonth = 2;

const formatValues = (dataValue, fnConvert) => {
  const colorDefault = cyan[400];
  const colors = [
    green[600],
    blue[600],
    yellow[700],
    orange[600],
    purple[700],
    red[600],
    blueGrey[600],
  ];
  const dataFields = _.map(dataValue, (val, idx) => ({
    name: val[0],
    total: fnConvert ? fnConvert(val[1]) : val[1],
    identify: val[2],
    color: idx > colors.length ? colorDefault : colors[idx],
  }));

  return dataFields;
};

const GestaoHelpdeskContext = createContext();
//
const ACTIONS = {
  SET_FILTER: "SET_FILTER",
  SET_MODAL: "SET_MODAL",
  CLOSE_MODAL: "CLOSE_MODAL",
  NO_APPLY_FILTER: "NO_APPLY_FILTER",
  APPLY_FILTER: "APPLY_FILTER",
};
//
const MODAL = {
  FILTER_ADVANCED: "FILTER_ADVANCED",
};
//
const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_FILTER:
      return {
        ...state,
        dataFilter: {
          ...state?.dataFilter,
          ...action.data,
        },
      };
    case ACTIONS.SET_MODAL:
      return {
        ...state,
        modal: action.data,
      };
    case ACTIONS.CLOSE_MODAL:
      return {
        ...state,
        modal: false,
      };
    case ACTIONS.APPLY_FILTER:
      return {
        ...state,
        dataFilter: {
          de: state?.dataFilter?.de,
          ate: state?.dataFilter?.ate,
          ...action.data,
        },
        modal: false,
        filterActive: true,
      };
    case ACTIONS.NO_APPLY_FILTER:
      return {
        ...state,
        dataFilter: {
          de: state?.dataFilter?.de,
          ate: state?.dataFilter?.ate,
        },
        filterActive: null,
      };
    default:
      return state;
  }
};

//
function GestaoHelpdesk() {
  const [state, dispatch] = useReducer(reducer, {
    dataFilter: {
      de: "2023-01-01",
      ate: format(new Date(), "yyyy-MM-dd"),
    },
  });
  const [wait, setWait] = useToggle(true);
  //
  const urlSearchParams = new URLSearchParams();
  _.forEach(_.keys(state?.dataFilter), (k) => {
    urlSearchParams.append(k, state.dataFilter[k]);
  });

  const { data, error } = useSWR(
    `/gestao_helpdesk?${urlSearchParams.toString()}`,
    fetchGet,
    {
      refreshInterval: 2e3,
    }
  );

  //
  useEffect(() => {
    if (data) {
      setWait(true);
      setTimeout(() => {
        setWait(false);
      }, 300);
    }
  }, [setWait, data]);

  useEffect(() => {
    if (error) ToastErro(error);
  }, [error]);

  //
  const onQuery = useCallback(
    (data) => {
      if (data) {
        const [de, ate] = data.split("_");

        dispatch({
          type: ACTIONS.SET_FILTER,
          data: {
            de,
            ate,
          },
        });
      }
    },
    [dispatch]
  );
  return (
    <>
      <GestaoHelpdeskContext.Provider value={dispatch}>
        <Container maxWidth={false}>
          {state?.modal && (
            <DrawerDialog
              fnGetCorpo={() => <RenderModal modal={state?.modal} />}
              fecharModal={() => dispatch({ type: ACTIONS.CLOSE_MODAL })}
            />
          )}
          <Container maxWidth="md" sx={{ my: 1 }}>
            <Stack direction={{ xs: "column", md: "row" }} gap={1}>
              <Stack alignItems="flex-start">
                <Body2>{STR.labelFilter}</Body2>
                <FiltroPorPeriodo grid={{ xs: 12 }} onClick={onQuery} />
                <FilterAdvanced
                  options={data}
                  filterActive={state?.filterActive}
                />
              </Stack>
              {wait ? (
                <Stack direction="row" gap={1}>
                  <SkeletonPanel />
                  <SkeletonPanel />
                </Stack>
              ) : (
                <Stack direction={{ xs: "column", md: "row" }} gap={1}>
                  <TotalOfTickets total={data?.total[0][1]} />
                  {/* <TimeMediumOfResolution tempo_medio={data?.tempo_medio} /> */}
                </Stack>
              )}
            </Stack>
          </Container>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6} lg={4}>
              {wait ? <SkeletonChart /> : <ChartStatus status={data?.status} />}
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              {wait ? <SkeletonChart /> : <ChartAgent agente={data?.agente} />}
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              {wait ? (
                <SkeletonChart />
              ) : (
                <ChartSubject assunto={data?.assunto} />
              )}
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              {wait ? <SkeletonChart /> : <ChartSector setor={data?.setor} />}
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              {wait ? <SkeletonChart /> : <ChartUser usuario={data?.usuario} />}
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              {wait ? <SkeletonChart /> : <ChartMounth mes={data?.mes} />}
              {/* {wait ? (
                <SkeletonChart />
              ) : (
                <ChartTimeMedium tempo_medio={data?.tempo_medio} />
              )} */}
            </Grid>
          </Grid>
        </Container>
      </GestaoHelpdeskContext.Provider>
    </>
  );
}
//
const RenderModal = ({ modal }) => {
  let corpo;
  switch (modal.type) {
    case MODAL.FILTER_ADVANCED:
      corpo = <GestaoHelpdeskFiltroAvancado {...modal.data} />;
      break;
    default:
      break;
  }
  return (
    <ContainerAdaptavel sx={{ minHeight: "50vh" }}>{corpo}</ContainerAdaptavel>
  );
};
//
const FilterAdvanced = ({ options, filterActive }) => {
  const dispatch = useContext(GestaoHelpdeskContext);

  let schema = useMemo(() => {
    if (options) {
      return [
        {
          name: "status",
          rotulo: STR.filterNameStatus,
          label: STR.filterNameStatus,
          icone: "SwapVert",
          type: "select",
          itens: options?.status.map((ele) => [ele[2], ele[0]]) || [],
          autoFormat: true,
          isMulti: true,
          erro: STR.filterErrorStatus,
          validador: obterValidador(VALIDADOR_TIPO.selectMultiplo),
        },
        {
          name: "agente",
          rotulo: STR.filterNameAgent,
          label: STR.filterNameAgent,
          icone: "Engineering",
          type: "select",
          itens: options?.agente?.map((ele) => [ele[2], ele[0]]) || [],
          autoFormat: true,
          isMulti: true,
          erro: STR.filterErrorAgent,
          validador: obterValidador(VALIDADOR_TIPO.selectMultiplo),
        },
        {
          name: "assunto",
          rotulo: STR.filterNameSubject,
          label: STR.filterNameSubject,
          icone: "Category",
          type: "select",
          itens: options?.assunto?.map((ele) => [ele[2], ele[0]]) || [],
          autoFormat: true,
          isMulti: true,
          erro: STR.filterErrorSubject,
          validador: obterValidador(VALIDADOR_TIPO.selectMultiplo),
        },
        {
          name: "usuario",
          rotulo: STR.filterNameUser,
          label: STR.filterNameUser,
          icone: "Person",
          type: "select",
          itens: options?.usuario?.map((ele) => [ele[2], ele[0]]) || [],
          autoFormat: true,
          isMulti: true,
          erro: STR.filterErrorUser,
          validador: obterValidador(VALIDADOR_TIPO.selectMultiplo),
        },
      ];
    } else {
      return [];
    }
  }, [options]);

  // Aplica o filtro na interface
  const onFilter = useCallback(
    (val) => {
      const filterFormatted = {};
      _.forEach(_.keys(val), (k) => {
        if (!filterFormatted.hasOwnProperty(k)) {
          filterFormatted[k] = [];
        }
        if (Array.isArray(val[k])) {
          filterFormatted[k] = _.map(val[k], (value) => value.value);
        }
      });

      dispatch({
        type: ACTIONS.APPLY_FILTER,
        data: filterFormatted,
      });
    },
    [dispatch]
  );

  // Chama modal para intencao de filtro
  const onClickFilter = useCallback(() => {
    dispatch({
      type: ACTIONS.SET_MODAL,
      data: {
        type: MODAL.FILTER_ADVANCED,
        data: {
          onFilter,
          filters: schema,
        },
      },
    });
  }, [dispatch, schema, onFilter]);

  // Limpeza de filtro
  const onClearFilter = useCallback(() => {
    dispatch({ type: ACTIONS.NO_APPLY_FILTER });
  }, [dispatch]);

  return (
    <Chip
      icon={<Icone icone="FilterAlt" />}
      color="info"
      variant={filterActive ? "filled" : "outlined"}
      onClick={!filterActive ? onClickFilter : onClearFilter}
      clickable
      sx={{ mt: 1 }}
      label={STR.labelFilterAdvanced}
    />
  );
};
//
const TotalOfTickets = ({ total }) => {
  const sx = {
    p: 1,
    background: green[200],
    display: "flex",
    alignItems: "center",
    flex: 1,
  };
  return (
    <Paper sx={sx}>
      <Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Icone sx={{ fontSize: 56 }} icone="Construction" />
          <H3>{total}</H3>
        </Stack>
        <H6 align="center">{STR.tickets}</H6>
      </Stack>
    </Paper>
  );
};
//
// const TimeMediumOfResolution = ({ tempo_medio }) => {
//   const totalTimeMedium = _.sumBy(tempo_medio, (val) => val[1]);
//   const totalTickets = _.sumBy(tempo_medio, (val) => val[2]);

//   const timeMedium = parseInt(totalTimeMedium / totalTickets);

//   const sx = {
//     p: 1,
//     background: blue[100],
//     display: "flex",
//     alignItems: "center",
//     flex: 1,
//   };
//   return (
//     <Paper sx={sx}>
//       <Stack>
//         <Stack direction="row" spacing={1} alignItems="center">
//           <Icone sx={{ fontSize: 56 }} icone="Schedule" />
//           <H3>{convertMinsAndHours(timeMedium)}</H3>
//         </Stack>
//         <Caption align="center">{STR.timeMedium}</Caption>
//       </Stack>
//     </Paper>
//   );
// };
//
const ChartStatus = ({ status }) => {
  const data = formatValues(status);

  return (
    <PaperCustom>
      <Body1 align="center">{STR.titleChartStatus}</Body1>
      <PieChartCustom data={data} />
    </PaperCustom>
  );
};

const ChartSubject = ({ assunto }) => {
  const data = formatValues(assunto);

  return (
    <PaperCustom>
      <Body1 align="center">{STR.titleChartSubject}</Body1>
      <PieChartCustom data={data} />
    </PaperCustom>
  );
};

const ChartAgent = ({ agente }) => {
  const data = formatValues(agente);

  return (
    <PaperCustom>
      <Body1 align="center">{STR.titleChartAgent}</Body1>
      <PieChartCustom data={data} />
    </PaperCustom>
  );
};

const ChartSector = ({ setor }) => {
  const data = formatValues(setor);
  return (
    <PaperCustom>
      <Body1 align="center">{STR.titleChartSector}</Body1>
      <ListDataCustom data={data} />
    </PaperCustom>
  );
};

const ChartUser = ({ usuario }) => {
  const data = formatValues(usuario);
  return (
    <PaperCustom>
      <Body1 align="center">{STR.titleChartUser}</Body1>
      <ListDataCustom data={data} />
    </PaperCustom>
  );
};

// const ChartTimeMedium = ({ tempo_medio }) => {
//   const data = formatValues(
//     tempo_medio,
//     (val) => `${convertMinsAndHours(val)} (Médio por atendimento)`
//   );
//   return (
//     <PaperCustom>
//       <Body1 align="center">{STR.titleChartTimeMedium}</Body1>
//       <ListDataCustom data={data} noProgressBar />
//     </PaperCustom>
//   );
// };

const ChartMounth = ({ mes }) => {
  const primary = useTheme()?.palette.primary.main;

  const data = formatValues(mes);
  const idChart = "status_chart";

  return (
    <PaperCustom>
      <Body1 align="center">{STR.titleChartMonth}</Body1>
      <ResponsiveContainer width="100%" aspect={aspectDesktopMonth}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <defs>
            <GradientColor color={primary} idColor={idChart} />
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="1 3" />

          <Tooltip
            cursor={{ fill: "rgba(0,0,0,.03)", strokeWidth: 0.5 }}
            content={fnGerarToolTip}
          />

          <Line
            dataName="name"
            dataKey="total"
            type="monotone"
            strokeWidth={2}
            fill={`url(#${idChart})`}
          >
            <LabelList dataKey="total" position="top" />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </PaperCustom>
  );
};

const LegendChart = ({ data }) => {
  return (
    <Stack gap={1}>
      {data.map((ele, idx) => (
        <Stack alignItems="center" key={idx} direction="row" gap={1}>
          <Icone icone="Circle" sx={{ color: ele.color }} />
          <Caption sx={{ whiteSpace: "nowrap" }}>
            {ele.name} - {ele.total}
          </Caption>
        </Stack>
      ))}
    </Stack>
  );
};

const PaperCustom = ({ children }) => (
  <Paper elevation={3} sx={{ p: 1, height: "calc(100% - 16px)" }}>
    {children}
  </Paper>
);

const PieChartCustom = ({ data }) => {
  const isMobile = useTheme()?.isMobile;
  //
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const totalPercent = percent * 100;

    if (totalPercent < 8) {
      return null;
    }

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${totalPercent.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Stack direction="row" sx={{ height: "100%" }}>
      <ResponsiveContainer width="100%" aspect={aspectDesktop}>
        <PieChart>
          <Pie
            dataKey="total"
            isAnimationActive={true}
            data={data}
            cx="60%"
            cy="50%"
            outerRadius="95%"
            innerRadius="50%"
            paddingAngle={1}
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip
            content={fnGerarToolTip}
            cursor={{ fill: "rgba(0,0,0,.03)", strokeWidth: 0.5 }}
          />
          {/* <Legend style={{ marginTop: "8px" }} /> */}
        </PieChart>
      </ResponsiveContainer>
      {!isMobile && <LegendChart data={data} />}
    </Stack>
  );
};

//
const ListDataCustom = ({ data, noProgressBar }) => {
  const total = _.sumBy(data, "total");

  return (
    <List sx={{ maxHeight: "364px", overflowY: "auto" }} disablePadding dense>
      {data?.map((ele, idx) => (
        <ListItem key={idx} divider>
          <ListItemIcon>
            <Icone icone="Circle" sx={{ color: ele.color }} />
          </ListItemIcon>
          <ListItemText
            primary={`${ele.name} - ${ele.total}`}
            secondary={
              !noProgressBar && (
                <LinearProgress
                  sx={{ height: 8 }}
                  variant="determinate"
                  value={(ele.total / total) * 100}
                />
              )
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

const SkeletonChart = () => {
  return (
    <Paper sx={{ p: 1 }}>
      <Stack gap={1}>
        <Skeleton variant="rectangular" height={10} />
        <Skeleton variant="rectangular" height={30} />
        <Skeleton variant="rectangular" height={260} />
      </Stack>
    </Paper>
  );
};

const SkeletonPanel = () => {
  return (
    <Paper sx={{ p: 1, flex: 1 }}>
      <Skeleton variant="rectangular" width={120} height="100%" />
    </Paper>
  );
};

GestaoHelpdesk.rota = "/gestao_helpdesk_view";

export default GestaoHelpdesk;
