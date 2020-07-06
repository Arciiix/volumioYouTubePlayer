import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

export default class Home extends React.Component {
  style = StyleSheet.create({
    container: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#75a3ff",
    },
    button: {
      backgroundColor: "#43b5b5",
      width: "90%",
      height: "10%",
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      marginBottom: 20,
    },
    buttonText: {
      color: "#ffffff",
      textAlign: "center",
      fontSize: 30,
    },
  });
  static navigationOptions = {
    headerShown: false,
  };
  render() {
    return (
      <View style={this.style.container}>
        <TouchableOpacity
          style={this.style.button}
          onPress={() => this.props.navigation.navigate("YouTube")}
        >
          <Text style={this.style.buttonText}>YouTube</Text>
        </TouchableOpacity>
        <TouchableOpacity style={this.style.button}>
          <Text style={this.style.buttonText}>Volumio</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
