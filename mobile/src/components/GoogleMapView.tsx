import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface RoutePolylineOption {
  id: string;
  points: { latitude: number; longitude: number }[];
}

interface GoogleMapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  isProgrammatic?: boolean;
  onCenterChange?: (lat: number, lng: number) => void;
  pickupCoords?: { latitude: number; longitude: number; name?: string };
  dropoffCoords?: { latitude: number; longitude: number; name?: string };
  routes?: RoutePolylineOption[];
  activeRouteId?: string;
}

export function GoogleMapView({
  latitude,
  longitude,
  zoom = 15,
  isProgrammatic = false,
  onCenterChange,
  pickupCoords,
  dropoffCoords,
  routes,
  activeRouteId,
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

  // Inject script to update active route line when driver changes selection card
  useEffect(() => {
    if (webViewRef.current && routes && activeRouteId) {
      const script = `
        if (window.updateActiveRoute) {
          window.updateActiveRoute(${JSON.stringify(activeRouteId)});
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [activeRouteId, routes]);

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
            background-color: #F5EFE6;
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
          .marker-pickup-circle {
            background-color: #0066FF;
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .marker-pickup-inner {
            width: 8px;
            height: 8px;
            background-color: #FFFFFF;
            border-radius: 50%;
          }
          .marker-dropoff-circle {
            background-color: #0F172A;
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .marker-dropoff-inner {
            width: 8px;
            height: 8px;
            background-color: #FFFFFF;
            border-radius: 50%;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="google-logo">
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" />
        </div>
        <script>
          window.routeLines = {};

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

              var iconPickup = L.divIcon({
                className: 'marker-pickup-circle',
                html: '<div class="marker-pickup-inner"></div>',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
              });

              var iconDropoff = L.divIcon({
                className: 'marker-dropoff-circle',
                html: '<div class="marker-dropoff-inner"></div>',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
              });

              L.marker([pLat, pLng], { icon: iconPickup }).addTo(window.map);
              L.marker([dLat, dLng], { icon: iconDropoff }).addTo(window.map);

              var routesData = ${JSON.stringify(routes || [])};
              var currentActiveId = ${JSON.stringify(activeRouteId || (routes && routes[0] ? routes[0].id : ''))};

              if (routesData.length > 0) {
                routesData.forEach(function(r) {
                  var coords = r.points.map(function(p) { return [p.latitude, p.longitude]; });
                  var isActive = (r.id === currentActiveId);
                  
                  var line = L.polyline(coords, {
                    color: '#0066FF',
                    weight: isActive ? 6 : 4,
                    opacity: isActive ? 0.95 : 0.35,
                    lineJoin: 'round'
                  }).addTo(window.map);

                  window.routeLines[r.id] = line;
                });
              } else {
                var defaultLine = L.polyline([[pLat, pLng], [dLat, dLng]], {
                  color: '#0066FF',
                  weight: 6,
                  opacity: 0.95,
                  lineJoin: 'round'
                }).addTo(window.map);
                window.routeLines['default'] = defaultLine;
              }

              var routeBounds = L.latLngBounds([[pLat, pLng], [dLat, dLng]]);
              window.map.fitBounds(routeBounds, { padding: [50, 50] });
            `
                : ''
            }

            window.updateActiveRoute = function(activeId) {
              Object.keys(window.routeLines).forEach(function(rId) {
                var line = window.routeLines[rId];
                if (rId === activeId) {
                  line.setStyle({ weight: 6, opacity: 0.95, color: '#0066FF' });
                  line.bringToFront();
                } else {
                  line.setStyle({ weight: 4, opacity: 0.35, color: '#0066FF' });
                }
              });
            };

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
    backgroundColor: '#F5EFE6',
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
