import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  StatusBar,
  Keyboard,
  View,
  PermissionsAndroid,
  TouchableHighlight,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker, Polyline} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import _ from 'lodash'
import PolyLine from "@mapbox/polyline";
import Icon from "react-native-vector-icons/FontAwesome";
import socketIO from "socket.io-client";

import apiPlaces from '../api-places'
import apiKey from '../google-api-key'


class Passenger extends Component {
  constructor( props ){
    super(props)
    this.state = {
      latitude: 0,
      longitude: 0,
      error: null,
      destination: '',
      locationPredictions: [],
      pointCoords: [],
      lookingForDriver: false
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
      const data = await apiPlaces.places.predictions(apiKey, destination,this.state.longitude, this.state.latitude)
      this.setState({
        locationPredictions: data.predictions
      })
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }


    
  }

  async getRouteDirections(destinationPlaceId, destinationName) {
    try {
      const response = await apiPlaces.directions.routes(apiKey, destinationPlaceId, this.state.longitude, this.state.latitude)
      const points = PolyLine.decode(response.routes[0].overview_polyline.points);
      const pointCoords = points.map(point => {
        return { latitude: point[0], longitude: point[1] };
      });
      this.setState({
        pointCoords,
        locationPredictions: [],
        destination: destinationName,
        routeResponse: response
      });
      Keyboard.dismiss();
      this.map.fitToCoordinates(pointCoords, {
        edgePadding: { top: 20, bottom: 20, left: 20, right: 20 }
      });
    } catch (error) {
      console.error(error);
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
  renderItem = prediction => {
    return (
      <TouchableHighlight
        key={prediction.id}
        onPress={() =>
          this.getRouteDirections(
            prediction.place_id,
            prediction.structured_formatting.main_text
          )}
      >
        <Text style={styles.locationSuggestion}>
          {prediction.structured_formatting.main_text}
        </Text>
      </TouchableHighlight>
    )
    
  }
  handleSubmitEditing(){
    this.onChangeDestination(this.state.destination)
  }
  handleTouchEnd(){
    if (this.state.locationPredictions.length !== 0) {
      this.setState({
        locationPredictions: []
      })
    }

  }
  
  iconFlag = <Icon name="flag" color="red" size={20}/>
  getMarker(){
    return <Marker 
            coordinate={this.state.pointCoords[this.state.pointCoords.length - 1]}
            icon={this.iconFlag}
            />
  }
  async requestDriver(){
    this.setState({
      lookingForDriver: true
    })
    const socket = socketIO.connect('http://192.168.0.3:3000')
    socket.on('connect', () => {
      console.log('Client connected ;)');

      socket.emit('taxiRequest', this.state.routeResponse)
      
    })
  }
  showActivityIndicator(){
    return <ActivityIndicator
            animating={this.state.lookingForDriver}
            size='large'
          />
  }
  showFindDriverButton(){
    return <TouchableOpacity 
              style={styles.findButton}
              onPress={() => this.requestDriver()}
            >
              <Text style={styles.findButtonText}>Find Driver</Text>
              {this.state.lookingForDriver && this.showActivityIndicator()}
          </TouchableOpacity>
  }
  render(){
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar 
          hidden={false} 
          translucent={true} 
          backgroundColor='#FFFFFF00' 
          barStyle='dark-content' 
        />
        <MapView
          ref={map => {
            this.map = map;
          }}
          //provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.0015,
            longitudeDelta: 0.0121,
          }}
          showsUserLocation={true}
          onTouchEnd={()=>this.handleTouchEnd()}
        >
          <Polyline
            coordinates={this.state.pointCoords}
            strokeWidth={4}
            strokeColor="red"
          />
          {this.state.pointCoords.length > 1 && this.getMarker()}
        </MapView>
        <TextInput
          onChangeText={this.handleChangeText}
          style={styles.destination}
          placeholder= 'Enter destination...'
          onSubmitEditing={()=>this.onChangeDestination(this.state.destination)}

        />
        <View>
          <FlatList 
              data={this.state.locationPredictions} 
              renderItem={({item})=>this.renderItem(item)}
          />
        </View>
        {this.state.pointCoords.length > 1 && this.showFindDriverButton()}
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({

  destination: {
    borderWidth: 0.5,
    borderColor: "grey",
    height: 40,
    marginTop: 50,
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    backgroundColor: "white"
  },
  locationSuggestion: {
    backgroundColor: "white",
    borderColor: "grey",
    padding: 5,
    borderWidth: 0.5,
    marginLeft: 5,
    marginRight: 5,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  findButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'black',
    marginTop: 'auto',
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignSelf: 'center'
  },
  findButtonText: {
    color: 'white'
  }
 });

export default Passenger;
