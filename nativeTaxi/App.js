import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  StatusBar,
  View
} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';


const App = () => {
  return (
    <View style={styles.container}>
    <MapView
      provider={PROVIDER_GOOGLE} // remove if not using Google Maps
      style={styles.map}
      region={{
        latitude: 6.2079964,
        longitude: -75.5686769,
        latitudeDelta: 0.0015,
        longitudeDelta: 0.0121,
      }}
    >
    </MapView>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: 400,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
 });

export default App;
