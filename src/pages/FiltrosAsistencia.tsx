import React from "react";

interface FiltrosAsistenciaProps {
  zona: string;
  comuna: string;
  barrio: string;
  parque: string;
  tipoActividad: string;
  fechaInicio: string;
  fechaFin: string;
  comunasDisponibles: string[];
  barriosDisponibles: string[];
  parquesDisponibles: string[];
  tiposActividadDisponibles: string[];
  onZonaChange: (zona: string) => void;
  onComunaChange: (comuna: string) => void;
  onBarrioChange: (barrio: string) => void;
  onParqueChange: (parque: string) => void;
  onTipoActividadChange: (tipo: string) => void;
  onFechaInicioChange: (fecha: string) => void;
  onFechaFinChange: (fecha: string) => void;
  onLimpiar: () => void;
}

const FiltrosAsistencia: React.FC<FiltrosAsistenciaProps> = ({
  zona,
  comuna,
  barrio,
  parque,
  tipoActividad,
  fechaInicio,
  fechaFin,
  comunasDisponibles,
  barriosDisponibles,
  parquesDisponibles,
  tiposActividadDisponibles,
  onZonaChange,
  onComunaChange,
  onBarrioChange,
  onParqueChange,
  onTipoActividadChange,
  onFechaInicioChange,
  onFechaFinChange,
  onLimpiar,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Zona:
        </label>
        <select
          className="w-full border border-gray-300 p-2 rounded-lg"
          value={zona}
          onChange={(e) => onZonaChange(e.target.value)}
        >
          <option value="todos">Todas</option>
          <option value="urbano">Urbano</option>
          <option value="rural">Rural</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Comuna / Corregimiento:
        </label>
        <select
          className="w-full border border-gray-300 p-2 rounded-lg"
          value={comuna}
          onChange={(e) => onComunaChange(e.target.value)}
        >
          <option value="">Todas</option>
          {comunasDisponibles.map((com, idx) => (
            <option key={idx} value={com}>
              {com}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Barrio:
        </label>
        <select
          className="w-full border border-gray-300 p-2 rounded-lg"
          value={barrio}
          onChange={(e) => onBarrioChange(e.target.value)}
        >
          <option value="">Todos</option>
          {barriosDisponibles.map((b, idx) => (
            <option key={idx} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Parque:
        </label>
        <select
          className="w-full border border-gray-300 p-2 rounded-lg"
          value={parque}
          onChange={(e) => onParqueChange(e.target.value)}
        >
          <option value="">Todos</option>
          {parquesDisponibles.map((p, idx) => (
            <option key={idx} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Tipo de Actividad:
        </label>
        <select
          className="w-full border border-gray-300 p-2 rounded-lg"
          value={tipoActividad}
          onChange={(e) => onTipoActividadChange(e.target.value)}
        >
          <option value="">Todas</option>
          {tiposActividadDisponibles.map((tipo, idx) => (
            <option key={idx} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Fecha inicial:
        </label>
        <input
          type="date"
          className="w-full border border-gray-300 p-2 rounded-lg"
          value={fechaInicio}
          onChange={(e) => onFechaInicioChange(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Fecha final:
        </label>
        <input
          type="date"
          className="w-full border border-gray-300 p-2 rounded-lg"
          value={fechaFin}
          onChange={(e) => onFechaFinChange(e.target.value)}
        />
      </div>

      <div className="flex items-end">
        <button
          onClick={onLimpiar}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          🔄 Restablecer filtros
        </button>
      </div>
    </div>
  );
};

export default FiltrosAsistencia;