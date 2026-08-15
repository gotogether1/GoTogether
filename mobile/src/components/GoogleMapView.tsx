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

  // Send update message to WebView whenever latitude or longitude changes
  useEffect(() => {
    if (webViewRef.current) {
      const script = `
        if (window.map) {
          window.map.panTo({ lat: ${latitude}, lng: ${longitude} });
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
        <style>
          html, body, #map {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #e5e3df;
          }
          .gmnoprint, .gm-style-cc {
            display: none !important;
          }
        </style>
        <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places"></script>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function initMap() {
            var centerPos = { lat: ${latitude}, lng: ${longitude} };
            window.map = new google.maps.Map(document.getElementById('map'), {
              zoom: ${zoom},
              center: centerPos,
              disableDefaultUI: true,
              gestureHandling: 'greedy',
              zoomControl: false,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false
            });

            window.map.addListener('idle', function() {
              var center = window.map.getCenter();
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'centerChange',
                  lat: center.lat(),
                  lng: center.lng()
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
        source={{ html: htmlContent, baseUrl: 'https://maps.googleapis.com' }}
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
    backgroundColor: '#E2E8F0',
  },
});
