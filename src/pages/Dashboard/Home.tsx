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
      <>
      <MapaComunasAsistencias datosFiltrados={datosFiltrados} />
      </>
  );
}
