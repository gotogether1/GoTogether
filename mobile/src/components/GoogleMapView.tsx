import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

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
          .leaflet-control-container .leaflet-routing-container-hide {
            display: none !important;
          }
          .leaflet-control-attribution {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function initMap() {
            window.map = L.map('map', {
              zoomControl: false,
              attributionControl: false,
              fadeAnimation: true,
              zoomAnimation: true
            }).setView([${latitude}, ${longitude}], ${zoom});

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              subdomains: ['a', 'b', 'c']
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
