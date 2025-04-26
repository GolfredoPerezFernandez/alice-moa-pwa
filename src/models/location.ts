// Model to define locations info elements to use in props
export interface LocationsProps {
  name: string;
  point: [number, number];
  zoom: number;
  marker: boolean;
}

export interface MarkersProps {
  name: string;
  label: string;
  lat: string;
  lon: string;
}