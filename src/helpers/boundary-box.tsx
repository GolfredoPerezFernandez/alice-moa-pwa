// Check map area boundaries function
export const getBoundaryBox = (map: any) => {
  const bounds = map.getBounds();
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  
  return {
    north: ne.lat,
    east: ne.lng,
    south: sw.lat,
    west: sw.lng
  };
};