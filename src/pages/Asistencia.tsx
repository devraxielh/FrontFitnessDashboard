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

const API_URL = import.meta.env.VITE_API_URL + "asistencias";

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

    axios
      .get<Asistencia[]>(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Error al cargar datos:", err);
        if (err.response && err.response.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

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
              <div className="text-xl text-gray-600 dark:text-white animate-pulse">
                🔄 Cargando datos...
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
                  <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">2,421</p>
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