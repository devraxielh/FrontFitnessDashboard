import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Interfaces para el tipado
interface CaracterizacionZona {
  zona: string;
  nombre_zona_agrupacion: string;
  promedio_peso: number;
  promedio_estatura: number;
  promedio_perimetro_cuello: number;
  promedio_perimetro_cadera: number;
  promedio_perimetro_brazo_relajado: number;
  promedio_perimetro_brazo_contraido: number;
  promedio_perimetro_muslo_maximo: number;
  promedio_perimetro_muslo_medial: number;
  promedio_perimetro_pierna_maxima: number;
  promedio_perimetro_abdominal_cintura: number;
  promedio_grasa_corporal: number;
  promedio_imc: number;
  promedio_icc: number;
  total_registros_en_zona: number;
}

interface CaracterizacionResponse {
  caracterizacion_por_zona: CaracterizacionZona[];
  total: number;
  message: string;
}

export default function Caracterizacion() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState<CaracterizacionZona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroZona, setFiltroZona] = useState<"todas" | "urbana" | "rural">("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZona, setSelectedZona] = useState<CaracterizacionZona | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const obtenerDatos = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Obteniendo datos de caracterización...");

        const response = await axios.get<CaracterizacionResponse>(
          `${import.meta.env.VITE_API_URL}caracterizacion-por-zona`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }
        );

        console.log("✅ Datos de caracterización obtenidos:", response.data);
        setDatos(response.data.caracterizacion_por_zona);

      } catch (error) {
        console.error("❌ Error al obtener datos de caracterización:", error);
        setError("Error al cargar los datos de caracterización");
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
  }, [navigate]);

  // Filtrar datos por zona y búsqueda
  const datosFiltrados = datos.filter(dato => {
    const cumpleFiltroZona = filtroZona === "todas" || dato.zona === filtroZona;
    const cumpleBusqueda = dato.nombre_zona_agrupacion.toLowerCase().includes(searchTerm.toLowerCase());
    return cumpleFiltroZona && cumpleBusqueda;
  });

  // Calcular estadísticas generales
  const estadisticasGenerales = {
    totalZonas: datosFiltrados.length,
    promedioGeneral: {
      peso: datosFiltrados.reduce((acc, curr) => acc + curr.promedio_peso, 0) / datosFiltrados.length || 0,
      estatura: datosFiltrados.reduce((acc, curr) => acc + curr.promedio_estatura, 0) / datosFiltrados.length || 0,
      imc: datosFiltrados.reduce((acc, curr) => acc + curr.promedio_imc, 0) / datosFiltrados.length || 0,
      icc: datosFiltrados.reduce((acc, curr) => acc + curr.promedio_icc, 0) / datosFiltrados.length || 0,
    },
    totalRegistros: datosFiltrados.reduce((acc, curr) => acc + curr.total_registros_en_zona, 0)
  };

  const abrirModal = (zona: CaracterizacionZona) => {
    setSelectedZona(zona);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setSelectedZona(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-2xl text-gray-600 dark:text-white animate-pulse mb-4">
            🔄 Cargando datos de caracterización...
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Obteniendo información de zonas urbanas y rurales
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">❌ {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            📊 Caracterización por Zona
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Promedios antropométricos por zona urbana y rural
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filtroZona}
            onChange={(e) => setFiltroZona(e.target.value as "todas" | "urbana" | "rural")}
            title="Filtrar por tipo de zona"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todas">📍 Todas las zonas</option>
            <option value="urbana">🏙️ Zona Urbana</option>
            <option value="rural">🌾 Zona Rural</option>
          </select>

          <input
            type="text"
            placeholder="Buscar zona..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700">
          <p className="text-sm text-blue-600 dark:text-blue-400">Total Zonas</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {estadisticasGenerales.totalZonas}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-gray-700">
          <p className="text-sm text-green-600 dark:text-green-400">Peso Promedio</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {estadisticasGenerales.promedioGeneral.peso.toFixed(1)} kg
          </p>
        </div>
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-gray-800 border border-purple-200 dark:border-gray-700">
          <p className="text-sm text-purple-600 dark:text-purple-400">Estatura Promedio</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {estadisticasGenerales.promedioGeneral.estatura.toFixed(1)} cm
          </p>
        </div>
        <div className="p-4 rounded-xl bg-orange-50 dark:bg-gray-800 border border-orange-200 dark:border-gray-700">
          <p className="text-sm text-orange-600 dark:text-orange-400">IMC Promedio</p>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {(estadisticasGenerales.promedioGeneral.imc * 1000).toFixed(2)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-gray-800 border border-red-200 dark:border-gray-700">
          <p className="text-sm text-red-600 dark:text-red-400">Total Registros</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            {estadisticasGenerales.totalRegistros}
          </p>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Datos por Zona ({datosFiltrados.length} resultados)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Zona
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Peso (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estatura (cm)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  IMC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ICC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Registros
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {datosFiltrados.map((dato, index) => (
                <tr 
                  key={index} 
                  onClick={() => abrirModal(dato)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      dato.zona === 'urbana' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {dato.zona === 'urbana' ? '🏙️' : '🌾'} {dato.zona.charAt(0).toUpperCase() + dato.zona.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {dato.nombre_zona_agrupacion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {dato.promedio_peso.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {dato.promedio_estatura.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {(dato.promedio_imc * 1000).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {dato.promedio_icc.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {dato.total_registros_en_zona} personas
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {datosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg font-medium">No se encontraron resultados</p>
              <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showModal && selectedZona && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    📊 Detalles de Caracterización
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedZona.zona === 'urbana' ? '🏙️' : '🌾'} {selectedZona.nombre_zona_agrupacion} - Zona {selectedZona.zona}
                  </p>
                </div>
                <button
                  onClick={cerrarModal}
                  title="Cerrar modal"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Medidas Básicas */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-3">
                    📏 Medidas Básicas
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Peso Promedio</p>
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                        {selectedZona.promedio_peso.toFixed(1)} kg
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-gray-700">
                      <p className="text-sm text-green-600 dark:text-green-400">Estatura Promedio</p>
                      <p className="text-xl font-bold text-green-700 dark:text-green-300">
                        {selectedZona.promedio_estatura.toFixed(1)} cm
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-gray-800 border border-purple-200 dark:border-gray-700">
                      <p className="text-sm text-purple-600 dark:text-purple-400">Total Registros</p>
                      <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                        {selectedZona.total_registros_en_zona} personas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Perímetros Corporales */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-3">
                    📐 Perímetros Corporales
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cuello:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedZona.promedio_perimetro_cuello.toFixed(1)} cm
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cadera:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedZona.promedio_perimetro_cadera.toFixed(1)} cm
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Brazo Relajado:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedZona.promedio_perimetro_brazo_relajado.toFixed(1)} cm
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Brazo Contraído:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedZona.promedio_perimetro_brazo_contraido.toFixed(1)} cm
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cintura:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedZona.promedio_perimetro_abdominal_cintura.toFixed(1)} cm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Índices Corporales */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-3">
                    📊 Índices Corporales
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-orange-50 dark:bg-gray-800 border border-orange-200 dark:border-gray-700">
                      <p className="text-sm text-orange-600 dark:text-orange-400">Índice de Masa Corporal</p>
                      <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                        {(selectedZona.promedio_imc * 1000).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-gray-800 border border-red-200 dark:border-gray-700">
                      <p className="text-sm text-red-600 dark:text-red-400">Índice Cintura-Cadera</p>
                      <p className="text-xl font-bold text-red-700 dark:text-red-300">
                        {selectedZona.promedio_icc.toFixed(3)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-gray-700">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Grasa Corporal</p>
                      <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                        {selectedZona.promedio_grasa_corporal.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medidas de Extremidades */}
                <div className="space-y-4 md:col-span-2 lg:col-span-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-3">
                    🦵 Medidas de Extremidades
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-indigo-50 dark:bg-gray-800 border border-indigo-200 dark:border-gray-700">
                      <p className="text-sm text-indigo-600 dark:text-indigo-400">Muslo Máximo</p>
                      <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                        {selectedZona.promedio_perimetro_muslo_maximo.toFixed(1)} cm
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-pink-50 dark:bg-gray-800 border border-pink-200 dark:border-gray-700">
                      <p className="text-sm text-pink-600 dark:text-pink-400">Muslo Medial</p>
                      <p className="text-lg font-bold text-pink-700 dark:text-pink-300">
                        {selectedZona.promedio_perimetro_muslo_medial.toFixed(1)} cm
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-teal-50 dark:bg-gray-800 border border-teal-200 dark:border-gray-700">
                      <p className="text-sm text-teal-600 dark:text-teal-400">Pierna Máxima</p>
                      <p className="text-lg font-bold text-teal-700 dark:text-teal-300">
                        {selectedZona.promedio_perimetro_pierna_maxima.toFixed(1)} cm
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
