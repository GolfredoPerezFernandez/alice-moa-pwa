import { Signal } from '@builder.io/qwik';
import { LocationsProps, MarkersProps } from './location';

// The properties used in the LeafletMap component
export interface MapProps {
  location: Signal<LocationsProps>;
  markers?: MarkersProps[];
  group?: Signal<string>;
}