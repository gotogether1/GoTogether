import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface GoogleMapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  onCenterChange?: (lat: number, lng: number) => void;
}

export function GoogleMapView({
  latitude,
  longitude,
  zoom = 15,
  onCenterChange,
}: GoogleMapViewProps) {
  const webViewRef = useRef<any>(null);

  // Smoothly pan map whenever latitude or longitude changes from search or GPS button
  useEffect(() => {
    if (webViewRef.current) {
      const script = `
        if (window.map) {
          window.map.panTo([${latitude}, ${longitude}]);
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [latitude, longitude]);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
          }
          .leaflet-control-attribution {
            font-family: Roboto, Arial, sans-serif;
            font-size: 10px;
            color: #5f6368;
            background: rgba(255, 255, 255, 0.8) !important;
            padding: 2px 6px !important;
            border-radius: 4px;
          }
          .google-logo {
            position: absolute;
            bottom: 8px;
            left: 10px;
            z-index: 1000;
            pointer-events: none;
          }
          .google-logo img {
            height: 18px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="google-logo">
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" />
        </div>
        <script>
          function initMap() {
            window.map = L.map('map', {
              zoomControl: false,
              attributionControl: false,
              fadeAnimation: true,
              zoomAnimation: true
            }).setView([${latitude}, ${longitude}], ${zoom});

            // Official Google Maps Vector Roadmap Tiles
            L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
              maxZoom: 20,
              subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
            }).addTo(window.map);

            window.map.on('moveend', function() {
              var center = window.map.getCenter();
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'centerChange',
                  lat: center.lat,
                  lng: center.lng
                }));
              }
            });
          }

          window.onload = initMap;
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={(event: any) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'centerChange' && onCenterChange) {
              onCenterChange(data.lat, data.lng);
            }
          } catch {}
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  webview: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
