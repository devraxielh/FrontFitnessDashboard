import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";

interface Asistencia {
  parque: string;
  fecha_asistencia: string;
}

interface Props {
  datosFiltrados: Asistencia[];
}

const GraficoPromedioParque: React.FC<Props> = ({ datosFiltrados }) => {
  const parquesPromedio = Object.entries(
    datosFiltrados.reduce<Record<string, { total: number; fechas: Set<string> }>>(
      (acc, cur) => {
        const parque = cur.parque;
        const fecha = cur.fecha_asistencia;

        if (!acc[parque]) {
          acc[parque] = { total: 0, fechas: new Set() };
        }

        acc[parque].total += 1;
        acc[parque].fechas.add(fecha);

        return acc;
      },
      {}
    )
  ).map(([parque, { total, fechas }]) => {
    const dias = fechas.size || 1;
    const promedio = total / dias;
    return { parque, promedio: parseFloat(promedio.toFixed(2)) };
  });

  if (parquesPromedio.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        📈 Promedio diario de asistencias por parque
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={parquesPromedio}
          margin={{ top: 20, right: 30, left: 0, bottom: 100 }}
        >
          <XAxis
            dataKey="parque"
            angle={-90}
            textAnchor="end"
            interval={0}
            height={150}
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="promedio" fill="#00C49F">
            <LabelList dataKey="promedio" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoPromedioParque;