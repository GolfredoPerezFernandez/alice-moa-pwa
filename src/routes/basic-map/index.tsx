import {
  component$,
  useSignal,
} from '@builder.io/qwik';
import { LeafletMap } from '~/components/leaflet-map';

// Sample data for markers
const markers = [
  {
    name: "Oficina Central",
    label: "HQ",
    lat: "45.770946",
    lon: "13.31338",
  },
  {
    name: "Sucursal Norte",
    label: "N",
    lat: "46.312663",
    lon: "13.274682",
  },
  {
    name: "Sucursal Sur",
    label: "S",
    lat: "45.610495",
    lon: "13.752682",
  }
];

export default component$(() => {
  const currentLocation = useSignal({
    name: "Ubicación Actual",
    point: [45.943512, 13.482948] as [number, number],
    zoom: 9,
    marker: true,
  });

  const groupSig = useSignal('all');

  return (
    <div class="px-4 py-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Demo de LeafletJS Map
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          Ejemplo de implementación del mapa para la aplicación.
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Mapa Interactivo</h2>
        <LeafletMap
          location={currentLocation}
          markers={markers}
          group={groupSig}
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 class="font-medium mb-2">Instrucciones de Uso</h3>
          <ul class="list-disc pl-5 space-y-1 text-sm">
            <li>Utiliza el componente <code>LeafletMap</code> para mostrar ubicaciones</li>
            <li>Configura el zoom y centro del mapa con <code>location</code></li>
            <li>Añade marcadores con el array <code>markers</code></li>
            <li>Los marcadores pueden ser filtrados con grupos</li>
          </ul>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 class="font-medium mb-2">En la aplicación de Timesheet</h3>
          <p class="text-sm">
            Este mapa se utiliza para mostrar las ubicaciones de fichaje de los empleados.
            Reemplaza el iframe de Google Maps con un mapa interactivo de LeafletJS que
            es más ligero y no requiere API key.
          </p>
        </div>
      </div>
    </div>
  );
});