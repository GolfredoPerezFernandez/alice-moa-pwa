import {
  component$,
  noSerialize,
  useSignal,
  useStyles$,
  useVisibleTask$,
  type Signal,
} from '@builder.io/qwik';
import * as L from 'leaflet';
import leafletStyles from 'leaflet/dist/leaflet.css?inline';
import { MapProps } from '~/models/map';

export const LeafletMap = component$<MapProps>(
  ({ location, markers, group }) => {
    useStyles$(
      leafletStyles +
        `
      .marker-label {
        color: red;
        font-weight: 700;
      }
      .custom-marker {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #ef4444;
        color: white;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
    `
    );

    const mapContainerSig = useSignal<L.Map>();

    useVisibleTask$(async ({ track }) => {
      track(location);
      group && track(group);

      if (mapContainerSig.value) {
        mapContainerSig.value.remove();
      }

      // center location
      const { value: locationData } = location;
      const centerPosition = locationData.point;

      // layers
      const markersLayer = new L.LayerGroup();
      const bordersLayer = new L.LayerGroup();

      // map
      const map = L.map('map', {
        layers: [markersLayer, bordersLayer],
      }).setView(centerPosition, locationData.zoom || 14);
      
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // custom marker icon
      const customIcon = L.divIcon({
        html: `<div class="custom-marker">📍</div>`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      // center position marker
      locationData.marker &&
        L.marker(centerPosition, { icon: customIcon })
          .bindPopup(`${locationData.name}`)
          .addTo(map);

      // add markers to map
      const markersList = await markers;
      markersList &&
        markersList.map((m: { name: string; label: string; lat: string; lon: string }) => {
          const myIcon = L.divIcon({
            className: 'marker-point',
            html: `<div class="marker-label" title="${m.name}" >${m.label}</div>`,
          });
          L.marker([+m.lat, +m.lon], { icon: myIcon }).addTo(markersLayer);
        });

      mapContainerSig.value = noSerialize(map);
    });

    return <div id="map" style={{ height: '25rem', width: '100%', borderRadius: '0.5rem' }}></div>;
  }
);

// Component to show a single timesheet location on a map
export const TimesheetLocationMap = component$<{
  latitude: number;
  longitude: number;
  name?: string;
}>(({ latitude, longitude, name = 'Tu ubicación' }) => {
  const currentLocation = useSignal<any>({
    name: name,
    point: [latitude, longitude],
    zoom: 15,
    marker: true,
  });

  return (
    <LeafletMap
      location={currentLocation}
    />
  );
});