import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // ← usa react-router-dom aquí
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Asistencia from "./pages/Asistencia";
import ListaMonitores from "./pages/ListaMonitores";
import Caracterizacion from "./pages/Caracterizacion";
import Reportes from "./pages/Reportes";
import PrivateRoute from './utils/PrivateRoute';
export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<SignIn />} />
        {/* Rutas protegidas */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/asistencia" element={<Asistencia />} />
          <Route path="/monitores" element={<ListaMonitores />} />
          <Route path="/caracterizacion" element={<Caracterizacion />} />
          <Route path="/reportes" element={<Reportes />} />
        </Route>
        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}