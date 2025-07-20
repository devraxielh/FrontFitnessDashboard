import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageMeta from "../components/common/PageMeta";
import FiltrosAsistencia from "./FiltrosAsistencia";
import GraficoPromedioParque from "./GraficoPromedioParque";

interface Asistencia {
  monitor_nombre: string;
  comuna_actividad: string;
  parque: string;
  barrio_actividad: string;
  tipo_actividad: string;
  fecha_asistencia: string;
  [key: string]: any;
}

interface AsistenciaPorGenero {
  genero_normalizado: string;
  total_asistencias: number;
  porcentaje_asistencias: number;
}

interface EstadisticasGenero {
  asistencias_por_genero: AsistenciaPorGenero[];
  estadisticas_generales: {
    total_asistencias: number;
    total_generos: number;
  };
  filtros: {
    fecha_inicio: string | null;
    fecha_fin: string | null;
    fecha_especifica: string | null;
  };
}

const API_URL = import.meta.env.VITE_API_URL + "asistencias";

// Debug: Verificar variables de entorno
console.log("🔧 VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("🔧 API_URL completa:", API_URL);

// Componente para la barra de progreso
const ProgressBar = ({ percentage, colorClass }: { percentage: number; colorClass: string }) => {
  return (
    <div className="mt-3">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalUsuarios, setTotalUsuarios] = useState<number>(0);
  const [estadisticasGenero, setEstadisticasGenero] = useState<EstadisticasGenero | null>(null);

  // Debug: Verificar token al inicializar
  const token = localStorage.getItem("access");
  console.log("🔑 Token en localStorage:", token ? "Presente" : "Ausente");
  console.log("🔑 Longitud del token:", token?.length || 0);

  const [zonaSeleccionada, setZonaSeleccionada] = useState<string>("todos");
  const [comunaSeleccionada, setComunaSeleccionada] = useState<string>("");
  const [barrioSeleccionado, setBarrioSeleccionado] = useState<string>("");
  const [parqueSeleccionado, setParqueSeleccionado] = useState<string>("");
  const [tipoActividadSeleccionado, setTipoActividadSeleccionado] = useState<string>("");

  const [fechaInicio, setFechaInicio] = useState<string>("2025-01-01");
  const [fechaFin, setFechaFin] = useState<string>(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      navigate("/");
      return;
    }

    console.log("🔄 Iniciando carga de asistencias...");
    setLoading(true);

    // Timeout de seguridad - si después de 10 segundos no hay respuesta, mostrar error
    const timeoutId = setTimeout(() => {
      console.log("⏰ Timeout alcanzado, deteniendo loading");
      setLoading(false);
    }, 10000);

    axios
      .get<Asistencia[]>(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 8000, // timeout de 8 segundos para la petición
      })
      .then((res) => {
        console.log("✅ Asistencias cargadas:", res.data.length, "registros");
        setData(res.data);
        clearTimeout(timeoutId);
      })
      .catch((err) => {
        console.error("❌ Error al cargar datos:", err);
        console.error("URL:", API_URL);
        console.error("Token presente:", !!token);
        
        if (err.response) {
          console.error("Status:", err.response.status);
          console.error("Response:", err.response.data);
        }
        
        if (err.response && err.response.status === 401) {
          console.log("🔑 Token expirado, redirigiendo al login");
          localStorage.clear();
          navigate("/");
        }
        clearTimeout(timeoutId);
      })
      .finally(() => {
        console.log("🏁 Finalizando carga de asistencias");
        setLoading(false);
      });
  }, [navigate]);

  // Función para obtener el total de usuarios
  useEffect(() => {
    const token = localStorage.getItem("access");
    
    if (!token) return;

    const fetchTotalUsuarios = async () => {
      try {
        console.log("🔄 Obteniendo total de usuarios...");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}usuarios/count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("✅ Total usuarios obtenido:", response.data.total_usuarios);
        setTotalUsuarios(response.data.total_usuarios);
      } catch (error) {
        console.error("❌ Error al obtener total de usuarios:", error);
      }
    };

    fetchTotalUsuarios();
  }, [navigate]);

  // Función para obtener estadísticas de género
  useEffect(() => {
    const token = localStorage.getItem("access");
    
    if (!token) return;

    const fetchEstadisticasGenero = async () => {
      try {
        const params = new URLSearchParams();
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        
        const url = `${import.meta.env.VITE_API_URL}asistencias/por-genero${params.toString() ? '?' + params.toString() : ''}`;
        console.log("🔄 Obteniendo estadísticas de género desde:", url);
        
        const response = await axios.get<EstadisticasGenero>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("✅ Estadísticas de género obtenidas:", response.data);
        setEstadisticasGenero(response.data);
      } catch (error) {
        console.error("❌ Error al obtener estadísticas de género:", error);
      }
    };

    fetchEstadisticasGenero();
  }, [navigate, fechaInicio, fechaFin]);

  const esNumero = (valor: string): boolean => !isNaN(Number(valor));

  const comunasFiltradas = [
    ...new Set(
      data
        .filter((item) => {
          if (zonaSeleccionada === "urbano") return esNumero(item.comuna_actividad);
          if (zonaSeleccionada === "rural") return !esNumero(item.comuna_actividad);
          return true;
        })
        .map((item) => item.comuna_actividad)
        .filter(Boolean)
    ),
  ];

  const barriosFiltrados = [
    ...new Set(
      data
        .filter((item) => {
          const esZonaOk =
            zonaSeleccionada === "todos" ||
            (zonaSeleccionada === "urbano" && esNumero(item.comuna_actividad)) ||
            (zonaSeleccionada === "rural" && !esNumero(item.comuna_actividad));
          const esComunaOk =
            comunaSeleccionada === "" || item.comuna_actividad === comunaSeleccionada;

          return esZonaOk && esComunaOk;
        })
        .map((item) => item.barrio_actividad)
        .filter(Boolean)
    ),
  ];

  const parquesFiltrados = [
    ...new Set(
      data
        .filter((item) => {
          return barrioSeleccionado === "" || item.barrio_actividad === barrioSeleccionado;
        })
        .map((item) => item.parque)
        .filter(Boolean)
    ),
  ];

  const tiposActividadFiltrados = [
    ...new Set(data.map((item) => item.tipo_actividad).filter(Boolean))
  ];

  useEffect(() => {
    if (comunaSeleccionada && !comunasFiltradas.includes(comunaSeleccionada)) {
      setComunaSeleccionada("");
      setBarrioSeleccionado("");
      setParqueSeleccionado("");
    }
  }, [zonaSeleccionada, comunasFiltradas]);

  useEffect(() => {
    if (barrioSeleccionado && !barriosFiltrados.includes(barrioSeleccionado)) {
      setBarrioSeleccionado("");
      setParqueSeleccionado("");
    }
  }, [comunaSeleccionada, barriosFiltrados]);

  useEffect(() => {
    if (parqueSeleccionado && !parquesFiltrados.includes(parqueSeleccionado)) {
      setParqueSeleccionado("");
    }
  }, [barrioSeleccionado, parquesFiltrados]);

  const datosFiltrados = data.filter((item) => {
    const esZonaOk =
      zonaSeleccionada === "todos" ||
      (zonaSeleccionada === "urbano" && esNumero(item.comuna_actividad)) ||
      (zonaSeleccionada === "rural" && !esNumero(item.comuna_actividad));

    const esComunaOk =
      comunaSeleccionada === "" || item.comuna_actividad === comunaSeleccionada;

    const esBarrioOk =
      barrioSeleccionado === "" || item.barrio_actividad === barrioSeleccionado;

    const esParqueOk =
      parqueSeleccionado === "" || item.parque === parqueSeleccionado;

    const esTipoOk =
      tipoActividadSeleccionado === "" || item.tipo_actividad === tipoActividadSeleccionado;

    const fecha = new Date(item.fecha_asistencia);
    const desde = new Date(fechaInicio);
    const hasta = new Date(fechaFin);

    const esFechaOk = fecha >= desde && fecha <= hasta;

    return esZonaOk && esComunaOk && esBarrioOk && esParqueOk && esTipoOk && esFechaOk;
  });

  const totalParquesUnicos = new Set(datosFiltrados.map((d) => d.parque)).size;

  const limpiarFiltros = () => {
    setZonaSeleccionada("todos");
    setComunaSeleccionada("");
    setBarrioSeleccionado("");
    setParqueSeleccionado("");
    setTipoActividadSeleccionado("");
    setFechaInicio("2025-01-01");
    setFechaFin(new Date().toISOString().slice(0, 10));
  };

  return (
    <>
      <PageMeta title="Fitness" description="Asistencias" />
      <div className="grid grid-cols-12 gap-6 px-4 xl:px-8 mt-4">
        <div className="col-span-12">
          {loading ? (
            <div className="flex justify-center items-center h-[60vh]">
              <div className="text-center">
                <div className="text-xl text-gray-600 dark:text-white animate-pulse mb-4">
                  🔄 Cargando datos...
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Si esto toma mucho tiempo, revisa la consola (F12) para más detalles
                </div>
              </div>
            </div>
          ) : (
            <section
              id="dashboard-pdf"
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                📊 Asistencias
              </h2>

              <FiltrosAsistencia
                zona={zonaSeleccionada}
                comuna={comunaSeleccionada}
                barrio={barrioSeleccionado}
                parque={parqueSeleccionado}
                tipoActividad={tipoActividadSeleccionado}
                comunasDisponibles={comunasFiltradas}
                barriosDisponibles={barriosFiltrados}
                parquesDisponibles={parquesFiltrados}
                tiposActividadDisponibles={tiposActividadFiltrados}
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
                onZonaChange={setZonaSeleccionada}
                onComunaChange={setComunaSeleccionada}
                onBarrioChange={setBarrioSeleccionado}
                onParqueChange={setParqueSeleccionado}
                onTipoActividadChange={setTipoActividadSeleccionado}
                onFechaInicioChange={setFechaInicio}
                onFechaFinChange={setFechaFin}
                onLimpiar={limpiarFiltros}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-800 dark:text-white mb-6">
                <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Usuarios Registrados</p>
                  <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                    {totalUsuarios.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Asistencia Total (filtrada)</p>
                  <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{datosFiltrados.length}</p>
                </div>
                <div className="p-4 rounded-xl shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Parques con Asistencia</p>
                  <p className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">{totalParquesUnicos}</p>
                </div>
              </div>

              {/* Sección de Estadísticas por Género */}
              {estadisticasGenero && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    👥 Asistencias por Género
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {estadisticasGenero.asistencias_por_genero.map((genero, index) => (
                      <div 
                        key={genero.genero_normalizado}
                        className="p-4 rounded-xl shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {genero.genero_normalizado === 'Mujer' ? '👩' : '👨'} {genero.genero_normalizado}
                            </p>
                            <p className={`text-2xl font-bold mt-1 ${
                              index === 0 ? 'text-pink-600 dark:text-pink-400' : 'text-blue-600 dark:text-blue-400'
                            }`}>
                              {genero.total_asistencias.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Porcentaje</p>
                            <p className={`text-xl font-semibold ${
                              index === 0 ? 'text-pink-600 dark:text-pink-400' : 'text-blue-600 dark:text-blue-400'
                            }`}>
                              {genero.porcentaje_asistencias.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        
                        {/* Barra de progreso */}
                        <ProgressBar 
                          percentage={genero.porcentaje_asistencias}
                          colorClass={index === 0 ? 'bg-pink-600 dark:bg-pink-400' : 'bg-blue-600 dark:bg-blue-400'}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Resumen general */}
                  <div className="p-4 rounded-xl shadow bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Total Asistencias (período)</p>
                        <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                          {estadisticasGenero.estadisticas_generales.total_asistencias.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Géneros Registrados</p>
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {estadisticasGenero.estadisticas_generales.total_generos}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <GraficoPromedioParque datosFiltrados={datosFiltrados} />
              <hr></hr>
                <ul className="list-disc pl-5 space-y-1">
                  {datosFiltrados.map((d, i) => (
                    <li key={i}>
                      {d.fecha_asistencia} — {d.monitor_nombre} — {d.parque} — {d.barrio_actividad} — {d.tipo_actividad} — {d.comuna_actividad}
                    </li>
                  ))}
                </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}