import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  StatusBar,
  View,
  PermissionsAndroid,
  TouchableHighlight,
  FlatList
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import _ from 'lodash'

import API from './src/api-places'
import apiKey from './src/google-api-key'


class App extends Component {
  constructor( props ){
    super(props)
    this.state = {
      latitude: 0,
      longitude: 0,
      error: null,
      destination: '',
      locationPredictions: []
    }
    // this.onChangeDestinationDebounced = _.debounce(
    //   this.onChangeDestination,
    //   5000
    // );
  }


  async requestLocationPermission() {
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
    this.requestLocationPermission()
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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
    );
    
    //navigator.geolocation.getCurrentPosition()
  }

  async onChangeDestination(destination) {
    try {
      const data = await API.places.predictions(apiKey, destination,this.state.longitude, this.state.latitude)
      this.setState({
        locationPredictions: data.predictions
      })
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }


    
  }

  handleChangeText = destination =>{
    this.setState({
      destination
    })
    //this.onChangeDestinationDebounced(destination);
  }

  pressedPrediction(prediction){
    console.log(prediction);
    
  }
  renderEmpty = () => {
    return <Text style={styles.locationSuggestion}>No locations found</Text>
  }
  renderItem = item => {
    return (
      <TouchableHighlight
        key={item.id}
        onPress={() => this.pressedPrediction(item)}
      >
        <Text style={styles.locationSuggestion}>
          {item.description}
        </Text>
      </TouchableHighlight>
    )
    
  }
  handleSubmitEditing(){
    this.onChangeDestination(this.state.destination)
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
          showsUserLocation={true}
        />

        <TextInput
          onChangeText={this.handleChangeText}
          style={styles.destination}
          placeholder= 'Enter destination...'
          onSubmitEditing={()=>this.onChangeDestination(this.state.destination)}

        />
        <FlatList 
            ListEmptyComponent={()=>this.renderEmpty()}
            data={this.state.locationPredictions} 
            renderItem={({item})=>this.renderItem(item)}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  destination: {
    borderWidth: 0.5,
    borderColor: "grey",
    height: 40,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    backgroundColor: "white"
  },
  locationSuggestion: {
    backgroundColor: "white",
    padding: 5,
    fontSize: 18,
    borderWidth: 0.5
  },
 });

export default App;
