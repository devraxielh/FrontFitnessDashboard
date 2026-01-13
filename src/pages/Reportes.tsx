import { useState } from "react";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

const Reportes = () => {
  const [caracterizacionFilters, setCaracterizacionFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const [datosGeneralesFilters, setDatosGeneralesFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const [loadingCaracterizacion, setLoadingCaracterizacion] = useState(false);
  const [loadingDatosGenerales, setLoadingDatosGenerales] = useState(false);
  const [messageCaracterizacion, setMessageCaracterizacion] = useState("");
  const [messageDatosGenerales, setMessageDatosGenerales] = useState("");

//   const baseURL = import.meta.env.VITE_API_URL;
  const excelURL = import.meta.env.VITE_EXCEL_URL;

  const handleCaracterizacionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setCaracterizacionFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDatosGeneralesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setDatosGeneralesFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const downloadCaracterizacion = () => {
    try {
      setLoadingCaracterizacion(true);
      setMessageCaracterizacion("");

      let url = `${excelURL}caracterizacion/export/excel`;

      if (
        caracterizacionFilters.startDate &&
        caracterizacionFilters.endDate
      ) {
        url += `?startDate=${caracterizacionFilters.startDate}&endDate=${caracterizacionFilters.endDate}`;
      }

      // Crear un link temporal y hacer click para descargar (evita CORS)
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Caracterizacion_${new Date().getTime()}.xlsx`);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessageCaracterizacion("Descarga iniciada exitosamente");
      setTimeout(() => setMessageCaracterizacion(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setMessageCaracterizacion("Error al descargar el archivo");
      setTimeout(() => setMessageCaracterizacion(""), 3000);
    } finally {
      setLoadingCaracterizacion(false);
    }
  };

  const downloadDatosGenerales = () => {
    try {
      setLoadingDatosGenerales(true);
      setMessageDatosGenerales("");

      let url = `${excelURL}datos-generales/export/excel`;

      if (datosGeneralesFilters.startDate && datosGeneralesFilters.endDate) {
        url += `?startDate=${datosGeneralesFilters.startDate}&endDate=${datosGeneralesFilters.endDate}`;
      }

      // Crear un link temporal y hacer click para descargar (evita CORS)
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `DatosGenerales_${new Date().getTime()}.xlsx`);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessageDatosGenerales("Descarga iniciada exitosamente");
      setTimeout(() => setMessageDatosGenerales(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setMessageDatosGenerales("Error al descargar el archivo");
      setTimeout(() => setMessageDatosGenerales(""), 3000);
    } finally {
      setLoadingDatosGenerales(false);
    }
  };

  return (
    <>
      <PageMeta title="Reportes" />
      <PageBreadcrumb pageTitle="Reportes" />

      <div className="grid grid-cols-1 gap-8">
        {/* Reporte Caracterización */}
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="mb-6">
            <h3 className="font-medium text-black dark:text-white text-xl">
              Reporte de Caracterización
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Descarga el reporte de caracterización con opción de filtrar por
              fecha
            </p>
          </div>

          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={caracterizacionFilters.startDate}
                  onChange={handleCaracterizacionChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  Fecha Fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={caracterizacionFilters.endDate}
                  onChange={handleCaracterizacionChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>

            <button
              onClick={downloadCaracterizacion}
              disabled={loadingCaracterizacion}
              className="inline-flex items-center justify-center rounded-md bg-brand-500 py-3 px-6 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <FontAwesomeIcon
                icon={faDownload}
                className="mr-2"
              />
              {loadingCaracterizacion ? "Descargando..." : "Descargar Excel"}
            </button>

            {messageCaracterizacion && (
              <div
                className={`mt-4 rounded border-l-4 p-4 ${
                  messageCaracterizacion.includes("Error")
                    ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    : "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                }`}
              >
                {messageCaracterizacion}
              </div>
            )}
          </div>
        </div>

        {/* Reporte Datos Generales */}
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="mb-6">
            <h3 className="font-medium text-black dark:text-white text-xl">
              Reporte de Datos Generales
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Descarga el reporte de datos generales filtrado por fecha de
              nacimiento
            </p>
          </div>

          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  Fecha Nacimiento Inicio
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={datosGeneralesFilters.startDate}
                  onChange={handleDatosGeneralesChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  Fecha Nacimiento Fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={datosGeneralesFilters.endDate}
                  onChange={handleDatosGeneralesChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>

            <button
              onClick={downloadDatosGenerales}
              disabled={loadingDatosGenerales}
              className="inline-flex items-center justify-center rounded-md bg-brand-500 py-3 px-6 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <FontAwesomeIcon
                icon={faDownload}
                className="mr-2"
              />
              {loadingDatosGenerales ? "Descargando..." : "Descargar Excel"}
            </button>

            {messageDatosGenerales && (
              <div
                className={`mt-4 rounded border-l-4 p-4 ${
                  messageDatosGenerales.includes("Error")
                    ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    : "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                }`}
              >
                {messageDatosGenerales}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Reportes;
