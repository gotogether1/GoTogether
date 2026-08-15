import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

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

  const handleZoomIn = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('if(window.map){ window.map.zoomIn(); }');
    }
  };

  const handleZoomOut = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('if(window.map){ window.map.zoomOut(); }');
    }
  };

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
            display: none !important;
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
              touchZoom: true,
              scrollWheelZoom: true,
              doubleClickZoom: true,
              boxZoom: true,
              dragging: true,
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

      {/* Floating Zoom Controls (+ and - buttons) */}
      <View style={styles.zoomControlsContainer}>
        <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomIn} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.zoomDivider} />
        <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOut} activeOpacity={0.8}>
          <Ionicons name="remove" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>
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
  zoomControlsContainer: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 30,
  },
  zoomBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
});
