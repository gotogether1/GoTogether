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
  pickupCoords?: { latitude: number; longitude: number; name?: string };
  dropoffCoords?: { latitude: number; longitude: number; name?: string };
  polyline?: { latitude: number; longitude: number }[];
}

export function GoogleMapView({
  latitude,
  longitude,
  zoom = 15,
  isProgrammatic = false,
  onCenterChange,
  pickupCoords,
  dropoffCoords,
  polyline,
}: GoogleMapViewProps) {
  const webViewRef = useRef<any>(null);
  const prevCoords = useRef<{ lat: number; lng: number }>({ lat: latitude, lng: longitude });

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
          .custom-marker-a {
            background-color: #2563EB;
            color: #FFFFFF;
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            text-align: center;
            font-weight: bold;
            font-family: sans-serif;
            font-size: 13px;
            line-height: 24px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
          .custom-marker-b {
            background-color: #EF4444;
            color: #FFFFFF;
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            text-align: center;
            font-weight: bold;
            font-family: sans-serif;
            font-size: 13px;
            line-height: 24px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
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
            var wideBounds = L.latLngBounds(L.latLng(-85, -540), L.latLng(85, 540));

            window.map = L.map('map', {
              zoomControl: false,
              attributionControl: false,
              minZoom: 3,
              maxZoom: 19,
              maxBounds: wideBounds,
              maxBoundsViscosity: 0.8,
              worldCopyJump: true,
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

            L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
              minZoom: 3,
              maxZoom: 19,
              noWrap: false,
              subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
            }).addTo(window.map);

            ${
              pickupCoords && dropoffCoords
                ? `
              var pLat = ${pickupCoords.latitude};
              var pLng = ${pickupCoords.longitude};
              var dLat = ${dropoffCoords.latitude};
              var dLng = ${dropoffCoords.longitude};

              var iconA = L.divIcon({
                className: 'custom-marker-a',
                html: 'A',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
              });

              var iconB = L.divIcon({
                className: 'custom-marker-b',
                html: 'B',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
              });

              L.marker([pLat, pLng], { icon: iconA }).addTo(window.map).bindPopup(${JSON.stringify(pickupCoords.name || 'Pickup')});
              L.marker([dLat, dLng], { icon: iconB }).addTo(window.map).bindPopup(${JSON.stringify(dropoffCoords.name || 'Drop-off')});

              var polylinePoints = ${
                polyline && polyline.length > 0
                  ? JSON.stringify(polyline.map(p => [p.latitude, p.longitude]))
                  : `[[pLat, pLng], [dLat, dLng]]`
              };

              var routeLine = L.polyline(polylinePoints, {
                color: '#2563EB',
                weight: 5,
                opacity: 0.85,
                lineJoin: 'round'
              }).addTo(window.map);

              var routeBounds = L.latLngBounds([[pLat, pLng], [dLat, dLng]]);
              window.map.fitBounds(routeBounds, { padding: [60, 60] });
            `
                : ''
            }

            window.map.on('moveend', function() {
              var center = window.map.getCenter();
              var normalizedLng = ((center.lng + 180) % 360 + 360) % 360 - 180;
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'centerChange',
                  lat: center.lat,
                  lng: normalizedLng
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
