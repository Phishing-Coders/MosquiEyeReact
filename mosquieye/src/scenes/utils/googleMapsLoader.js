let googleMapsPromise = null;

export const loadGoogleMapsAPI = (apiKey) => {
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,visualization&v=weekly`;
      script.async = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    }
  });

  return googleMapsPromise;
};