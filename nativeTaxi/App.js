import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  StatusBar,
  View,
  PermissionsAndroid
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';


class App extends Component {
  constructor( props ){
    super(props)
    this.state = {
      latitude: 0,
      longitude: 0,
      error: null
    }
  }


  async requestCameraPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'NativeTaxi Location App Permission',
          message:
            'NativeTaxi needs access to your location ' +
            'to know your current position.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the locatio');
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  componentDidMount(){
    this.requestCameraPermission()
    Geolocation.getCurrentPosition(
        (position) => {
            console.log(position.coords);
            
            this.setState({
              longitude: position.coords.longitude,
              latitude: position.coords.latitude
            })
        },
        (error) => {
            // See error code charts below.
            console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1 }
    );
    
    
    //navigator.geolocation.getCurrentPosition()
  }

  render(){
    return (
      <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
        style={styles.map}
        region={{
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          latitudeDelta: 0.0015,
          longitudeDelta: 0.0121,
        }}
      />
      <Marker
        coordinate={this.state}
        pinColor='red'
        
      >
      </Marker>
    </View>
    );
  }
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
