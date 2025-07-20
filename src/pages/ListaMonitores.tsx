import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageMeta from "../components/common/PageMeta";

interface Monitor {
  user_id: string;
  first_name: string;
  document_number: string;
}

interface MonitoresResponse {
  monitores: Monitor[];
  total: number;
}

interface ActividadCancelada {
  id: string;
  descripcion: string;
  fecha: string;
  hora: string;
  motivoCancelado: string;
  tipo_actividad: string;
  parque_nombre: string;
  barrio_nombre: string;
  comuna_nombre: string;
}

interface ActividadesCanceladasResponse {
  actividades_canceladas: ActividadCancelada[];
  total: number;
  monitor_id: string;
  message: string;
}

interface EstadisticasMonitor {
  monitor: {
    user_id: string;
    nombre: string;
    documento: string;
  };
  estadisticas: {
    total_actividades: number;
    actividades_activas: number;
    actividades_canceladas: number;
    porcentaje_canceladas: number;
  };
}

interface ActividadCalificada {
  actividad_id: string;
  descripcion: string;
  fecha: string;
  hora: string;
  tipo_actividad: string;
  parque_nombre: string;
  total_calificaciones: number;
  promedio_calificacion: number;
  calificacion_minima: number;
  calificacion_maxima: number;
}

interface CalificacionesResponse {
  actividades_con_calificaciones: ActividadCalificada[];
  total_actividades: number;
  actividades_calificadas: number;
  monitor_id: string;
  monitor_nombre: string;
  monitor_documento: string;
  estadisticas_generales: {
    promedio_general: number;
    total_calificaciones: number;
    actividades_sin_calificar: number;
  };
  message: string;
}

interface MonitorDetallado {
  monitor: Monitor;
  estadisticas?: EstadisticasMonitor;
  actividadesCanceladas?: ActividadesCanceladasResponse;
  calificaciones?: CalificacionesResponse;
  loading: boolean;
}

const API_URL = import.meta.env.VITE_API_URL + "monitores/basico";

export default function ListaMonitores() {
  const navigate = useNavigate();
  const [monitores, setMonitores] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedMonitor, setSelectedMonitor] = useState<MonitorDetallado | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      navigate("/");
      return;
    }

    console.log("🔄 Cargando lista de monitores...");
    setLoading(true);
    setError("");

    const timeoutId = setTimeout(() => {
      console.log("⏰ Timeout alcanzado para monitores");
      setLoading(false);
      setError("Timeout: La solicitud tardó demasiado en responder");
    }, 10000);

    axios
      .get<MonitoresResponse>(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 8000,
      })
      .then((res) => {
        console.log("✅ Monitores cargados:", res.data.total, "monitores");
        setMonitores(res.data.monitores);
        clearTimeout(timeoutId);
      })
      .catch((err) => {
        console.error("❌ Error al cargar monitores:", err);
        
        if (err.response) {
          console.error("Status:", err.response.status);
          console.error("Response:", err.response.data);
          
          if (err.response.status === 401) {
            console.log("🔑 Token expirado, redirigiendo al login");
            localStorage.clear();
            navigate("/");
          } else {
            setError(`Error ${err.response.status}: ${err.response.data?.message || 'Error al cargar monitores'}`);
          }
        } else if (err.code === 'ECONNABORTED') {
          setError("Timeout: La solicitud tardó demasiado en responder");
        } else {
          setError("Error de conexión: No se pudo conectar con el servidor");
        }
        
        clearTimeout(timeoutId);
      })
      .finally(() => {
        console.log("🏁 Finalizando carga de monitores");
        setLoading(false);
      });
  }, [navigate]);

  // Filtrar monitores basado en el término de búsqueda
  const monitoresFiltrados = monitores.filter((monitor) =>
    monitor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    monitor.document_number.includes(searchTerm)
  );

  // Función para obtener detalles completos de un monitor
  const obtenerDetallesMonitor = async (monitor: Monitor) => {
    const token = localStorage.getItem("access");
    if (!token) return;

    setSelectedMonitor({
      monitor,
      loading: true
    });
    setShowModal(true);

    try {
      // Obtener estadísticas, actividades canceladas y calificaciones en paralelo
      const [estadisticasRes, canceladasRes, calificacionesRes] = await Promise.all([
        axios.get<EstadisticasMonitor>(`${import.meta.env.VITE_API_URL}monitores/estadisticas-actividades/${monitor.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        }),
        axios.get<ActividadesCanceladasResponse>(`${import.meta.env.VITE_API_URL}monitores/actividades-canceladas/${monitor.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        }),
        axios.get<CalificacionesResponse>(`${import.meta.env.VITE_API_URL}monitores/calificaciones-promedio/${monitor.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        })
      ]);

      setSelectedMonitor({
        monitor,
        estadisticas: estadisticasRes.data,
        actividadesCanceladas: canceladasRes.data,
        calificaciones: calificacionesRes.data,
        loading: false
      });

    } catch (error) {
      console.error("Error al obtener detalles del monitor:", error);
      setSelectedMonitor({
        monitor,
        loading: false
      });
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setSelectedMonitor(null);
  };

  return (
    <>
      <PageMeta title="Monitores" description="Lista de Monitores" />
      <div className="grid grid-cols-12 gap-6 px-4 xl:px-8 mt-4">
        <div className="col-span-12">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">
                👥 Lista de Monitores
              </h2>
              
              {/* Barra de búsqueda */}
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Buscar por nombre o documento..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="text-xl text-gray-600 dark:text-white animate-pulse mb-4">
                    🔄 Cargando monitores...
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Obteniendo información de la base de datos
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 dark:text-red-400 text-lg mb-4">
                  ❌ {error}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <>
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl shadow bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Monitores</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {monitores.length}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl shadow bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Monitores Filtrados</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {monitoresFiltrados.length}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl shadow bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Estado</p>
                    <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      ✅ Activos
                    </p>
                  </div>
                </div>

                {/* Lista de monitores */}
                {monitoresFiltrados.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400 text-lg">
                      {searchTerm ? "No se encontraron monitores con ese criterio de búsqueda" : "No hay monitores registrados"}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Nombre Completo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Documento
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {monitoresFiltrados.map((monitor, index) => (
                          <tr 
                            key={monitor.user_id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            onClick={() => obtenerDetallesMonitor(monitor)}
                            title="Haz clic para ver detalles del monitor"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {monitor.first_name.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {monitor.first_name.trim()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              <span className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                                {monitor.document_number}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* Modal de detalles del monitor */}
      {showModal && selectedMonitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {selectedMonitor.monitor.first_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedMonitor.monitor.first_name.trim()}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Documento: {selectedMonitor.monitor.document_number}
                    </p>
                  </div>
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
              {selectedMonitor.loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="text-xl text-gray-600 dark:text-white animate-pulse mb-4">
                      🔄 Cargando detalles del monitor...
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Estadísticas Generales */}
                  {selectedMonitor.estadisticas && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        📊 Estadísticas de Actividades
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700">
                          <p className="text-sm text-blue-600 dark:text-blue-400">Total Actividades</p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {selectedMonitor.estadisticas.estadisticas.total_actividades}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-gray-700">
                          <p className="text-sm text-green-600 dark:text-green-400">Activas</p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {selectedMonitor.estadisticas.estadisticas.actividades_activas}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-gray-800 border border-red-200 dark:border-gray-700">
                          <p className="text-sm text-red-600 dark:text-red-400">Canceladas</p>
                          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                            {selectedMonitor.estadisticas.estadisticas.actividades_canceladas}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-gray-700">
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">% Canceladas</p>
                          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                            {selectedMonitor.estadisticas.estadisticas.porcentaje_canceladas.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Calificaciones Promedio */}
                  {selectedMonitor.calificaciones && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        ⭐ Calificaciones y Rendimiento
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="p-4 rounded-xl bg-purple-50 dark:bg-gray-800 border border-purple-200 dark:border-gray-700">
                          <p className="text-sm text-purple-600 dark:text-purple-400">Promedio General</p>
                          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {selectedMonitor.calificaciones.estadisticas_generales.promedio_general.toFixed(2)} ⭐
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-gray-800 border border-indigo-200 dark:border-gray-700">
                          <p className="text-sm text-indigo-600 dark:text-indigo-400">Total Calificaciones</p>
                          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                            {selectedMonitor.calificaciones.estadisticas_generales.total_calificaciones}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Sin Calificar</p>
                          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                            {selectedMonitor.calificaciones.estadisticas_generales.actividades_sin_calificar}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actividades Canceladas */}
                  {selectedMonitor.actividadesCanceladas && selectedMonitor.actividadesCanceladas.actividades_canceladas.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        ❌ Actividades Canceladas ({selectedMonitor.actividadesCanceladas.total})
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedMonitor.actividadesCanceladas.actividades_canceladas.slice(0, 5).map((actividad) => (
                          <div key={actividad.id} className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-red-800 dark:text-red-200">
                                {actividad.tipo_actividad}
                              </span>
                              <span className="text-sm text-red-600 dark:text-red-400">
                                {actividad.fecha} - {actividad.hora}
                              </span>
                            </div>
                            <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                              📍 {actividad.parque_nombre} - {actividad.barrio_nombre}
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                              <strong>Motivo:</strong> {actividad.motivoCancelado}
                            </p>
                          </div>
                        ))}
                        {selectedMonitor.actividadesCanceladas.actividades_canceladas.length > 5 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Y {selectedMonitor.actividadesCanceladas.actividades_canceladas.length - 5} más...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Últimas Actividades Calificadas */}
                  {selectedMonitor.calificaciones && selectedMonitor.calificaciones.actividades_con_calificaciones.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🎯 Últimas Actividades Calificadas
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedMonitor.calificaciones.actividades_con_calificaciones.slice(0, 5).map((actividad) => (
                          <div key={actividad.actividad_id} className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-green-800 dark:text-green-200">
                                {actividad.tipo_actividad}
                              </span>
                              <div className="text-right">
                                <span className="text-lg font-bold text-green-700 dark:text-green-300">
                                  {actividad.promedio_calificacion.toFixed(1)} ⭐
                                </span>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                  {actividad.total_calificaciones} calificaciones
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                              📍 {actividad.parque_nombre}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              🗓️ {actividad.fecha} - {actividad.hora}
                            </p>
                          </div>
                        ))}
                        {selectedMonitor.calificaciones.actividades_con_calificaciones.length > 5 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Y {selectedMonitor.calificaciones.actividades_con_calificaciones.length - 5} más...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
