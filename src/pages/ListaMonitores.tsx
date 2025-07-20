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

const API_URL = import.meta.env.VITE_API_URL + "monitores/basico";

export default function ListaMonitores() {
  const navigate = useNavigate();
  const [monitores, setMonitores] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

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
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
    </>
  );
}
