import { MapContainer, TileLayer, Polygon, Tooltip, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useRef } from "react";
import L from "leaflet";

interface Asistencia {
  comuna_actividad: string;
  [key: string]: any;
}

interface MapaComunasAsistenciasProps {
  datosFiltrados: Asistencia[];
}

// Colores únicos para cada comuna (hasta 12)
const comunaColors = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728",
  "#9467bd", "#8c564b", "#e377c2", "#7f7f7f",
  "#bcbd22", "#17becf", "#f1c40f", "#34495e",
];

// Geometrías de las comunas (puedes agregar hasta 12)
const comunasGeo: Record<string, [number, number][][]> = {
  "1":[
    [
    [8.753607, -75.917244],
    [8.757594, -75.911579],
    [8.763023, -75.906086],
    [8.769216, -75.900936],
    [8.764126, -75.895572],
    [8.76315, -75.894413],
    [8.756406, -75.897331],
    [8.754201, -75.896645],
    [8.751274, -75.894284],
    [8.751062, -75.892525],
    [8.749153, -75.892353],
    [8.748178, -75.892739],
    [8.748305, -75.894027],
    [8.749493, -75.897331],
    [8.750553, -75.900893],
    [8.749153, -75.903425],
    [8.743088, -75.90673],
    [8.753607, -75.917244]
]
  ],
    "2": [
    [
    [8.751497, -75.892503],
    [8.751709, -75.894134],
    [8.752144, -75.894434],
    [8.752335, -75.894971],
    [8.75488, -75.896494],
    [8.755622, -75.896752],
    [8.756619, -75.896709],
    [8.759545, -75.895529],
    [8.762026, -75.894434],
    [8.773457, -75.889778],
    [8.782364, -75.885057],
    [8.783297, -75.884027],
    [8.782788, -75.883212],
    [8.782661, -75.88201],
    [8.781261, -75.88141],
    [8.779268, -75.876603],
    [8.772079, -75.881431],
    [8.771676, -75.881989],
    [8.770064, -75.882912],
    [8.767933, -75.883491],
    [8.767243, -75.884006],
    [8.760097, -75.887525],
    [8.75857, -75.888877],
    [8.758061, -75.88995],
    [8.75594, -75.891473],
    [8.753618, -75.89231],
    [8.751497, -75.892503]
    ]],
  "3": [
[
    [8.739737, -75.906515],
    [8.746778, -75.903082],
    [8.748178, -75.902009],
    [8.748772, -75.899949],
    [8.748178, -75.897202],
    [8.746821, -75.89407],
    [8.74699, -75.892396],
    [8.749069, -75.891409],
    [8.751147, -75.89098],
    [8.750638, -75.889735],
    [8.747923, -75.889392],
    [8.744572, -75.889049],
    [8.743639, -75.888319],
    [8.742918, -75.88716],
    [8.738846, -75.888147],
    [8.733332, -75.888577],
    [8.733841, -75.891623],
    [8.734477, -75.892181],
    [8.733841, -75.893126],
    [8.732738, -75.894241],
    [8.732696, -75.895572],
    [8.730108, -75.89879],
    [8.740755, -75.902224],
    [8.739737, -75.906515]
]
  ],
};

export default function MapaComunasAsistencias({ datosFiltrados }: MapaComunasAsistenciasProps) {
  const conteoPorComuna = datosFiltrados.reduce<Record<string, number>>((acc, cur) => {
    if (cur.comuna_actividad) {
      acc[cur.comuna_actividad] = (acc[cur.comuna_actividad] || 0) + 1;
    }
    return acc;
  }, {});

  const featureGroupRef = useRef<L.FeatureGroup<any>>(null);

  const handleCreated = (e: any) => {
    const layer = e.layer;
    const geojson = layer.toGeoJSON();
    console.log("🆕 Polígono creado:", geojson);
  };

  const handleEdited = (e: any) => {
    e.layers.eachLayer((layer: any) => {
      const geojson = layer.toGeoJSON();
      console.log("✏️ Polígono editado:", geojson);
    });
  };

  return (
    <div className="h-[760px] mt-8 rounded-2xl overflow-hidden shadow-md border border-gray-300">
      <MapContainer center={[8.76, -75.88]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            draw={{ rectangle: false, circle: false, marker: false, polyline: false }}
            onCreated={handleCreated}
            onEdited={handleEdited}
          />

          {Object.entries(comunasGeo).map(([comuna, coords], idx) => (
            <Polygon
              key={comuna}
              pathOptions={{
                color: comunaColors[idx % comunaColors.length],
                weight: 2,
              }}
              positions={coords}
            >
              <Tooltip
                permanent
                direction="center"
                className="leaflet-tooltip-transparent"
              >
                <div
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    lineHeight: 1,
                    color: "#000",
                    textShadow: "0 0 3px white",
                  }}
                >
                  C-{comuna}
                  <br />
                  {conteoPorComuna[comuna] || 0}
                </div>
              </Tooltip>
            </Polygon>
          ))}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
}