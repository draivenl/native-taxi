import React, { Component } from "react";
import { 
    TouchableOpacity,
    View,
    Text,
    ActivityIndicator

} from "react-native";

class BottomButtom extends Component {
    showActivityIndicator(){
        return <ActivityIndicator
                  animating={this.props.showIndicator}
                  size='large'
                />
      }

    render(){
        return  <TouchableOpacity 
                    style={this.props.styleTouchable}
                    onPress={this.props.onPress}
                >
                    <View>
                        <Text style={this.props.styleFindButtonText}>{this.props.buttonText}</Text>
                        {this.props.showIndicator && this.showActivityIndicator()}
                    </View>
                </TouchableOpacity>
    }

}

export default BottomButtom