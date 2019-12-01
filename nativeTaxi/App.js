import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  StatusBar,
  Keyboard,
  View,
  PermissionsAndroid,
  TouchableHighlight,
  FlatList,
  Button
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker, Polyline} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import _ from 'lodash'
import PolyLine from "@mapbox/polyline";
import Icon from "react-native-vector-icons/FontAwesome";

import apiPlaces from './src/api-places'
import apiKey from './src/google-api-key'
import Passenger from './src/screens/passenger';
import Driver from './src/screens/driver';




class App extends Component {
  constructor( props ){
    super(props)
    this.state = {
      isPassenger: false,
      isDriver: false
    }
  }

  render(){
    if (this.state.isPassenger) {
      return <Passenger/>
    }
    if (this.state.isDriver) {
      return <Driver/>
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.button}>
          <Button  title='Passenger' onPress={() => this.setState({isPassenger: true})}/>
        </View>
        <View style={styles.button}>
          <Button  title='Driver' onPress={() => this.setState({isDriver: true})}/>
        </View>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 10,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    
  },

  
 });

export default App;
