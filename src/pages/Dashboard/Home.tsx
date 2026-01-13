import { useState, useEffect } from "react";
import axios from "axios";
import MapaComunasAsistencias from "../MapaComunasAsistencias";
import { useNavigate } from "react-router-dom";

interface Asistencia {
  comuna_actividad: string;
  [key: string]: any;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [datosFiltrados, setDatosFiltrados] = useState<Asistencia[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      navigate("/");
      return;
    }


    axios
      .get<Asistencia[]>(import.meta.env.VITE_API_URL + "asistencias", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setDatosFiltrados(res.data); // Puedes filtrar aquí si lo deseas
      });
  }, []);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="px-2 sm:px-4 md:px-6 lg:px-8">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6">
          📍 Mapa de Asistencias por Comuna
        </h1>
        <div className="w-full relative">
          <MapaComunasAsistencias datosFiltrados={datosFiltrados} />
        </div>
        
        {/* Información adicional en móviles */}
        <div className="mt-4 md:hidden">
          <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              💡 Información del Mapa
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              • Usa pellizco para hacer zoom<br/>
              • Arrastra para mover el mapa<br/>
              • Los números muestran asistencias por comuna
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
