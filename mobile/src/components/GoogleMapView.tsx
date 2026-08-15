import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface GoogleMapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  isProgrammatic?: boolean;
  onCenterChange?: (lat: number, lng: number) => void;
}

export function GoogleMapView({
  latitude,
  longitude,
  zoom = 15,
  isProgrammatic = false,
  onCenterChange,
}: GoogleMapViewProps) {
  const webViewRef = useRef<any>(null);
  const prevCoords = useRef<{ lat: number; lng: number }>({ lat: latitude, lng: longitude });

  // Only inject panTo when coordinates change programmatically (e.g., search click or GPS button click)
  useEffect(() => {
    const dist = Math.abs(latitude - prevCoords.current.lat) + Math.abs(longitude - prevCoords.current.lng);
    prevCoords.current = { lat: latitude, lng: longitude };

    if (webViewRef.current && (isProgrammatic || dist > 0.005)) {
      const script = `
        if (window.map) {
          window.map.panTo([${latitude}, ${longitude}], { animate: true, duration: 0.4 });
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [latitude, longitude, isProgrammatic]);

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=0.5, maximum-scale=20.0, user-scalable=yes" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            background-color: #74BBE3;
            overflow: hidden;
            -webkit-user-select: none;
            user-select: none;
          }
          .leaflet-control-attribution {
            display: none !important;
          }
          .google-logo {
            position: absolute;
            bottom: 12px;
            left: 14px;
            z-index: 1000;
            pointer-events: none;
          }
          .google-logo img {
            height: 20px;
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
              minZoom: 3,
              maxZoom: 19,
              touchZoom: 'center',
              bounceAtZoomLimits: false,
              scrollWheelZoom: true,
              doubleClickZoom: true,
              boxZoom: true,
              dragging: true,
              inertia: true,
              inertiaDeceleration: 2500,
              inertiaMaxSpeed: 1500,
              easeLinearity: 0.25,
              fadeAnimation: false,
              zoomAnimation: true
            }).setView([${latitude}, ${longitude}], ${zoom});

            // Official Google Maps Vector Roadmap Tiles
            L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
              minZoom: 3,
              maxZoom: 19,
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
        scrollEnabled={false}
        overScrollMode="never"
        androidLayerType="hardware"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
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
    backgroundColor: '#74BBE3',
  },
  zoomControlsContainer: {
    position: 'absolute',
    top: 116,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 35,
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
