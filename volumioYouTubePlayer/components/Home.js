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
      width: "90%",
      height: "10%",
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      marginBottom: 20,
      borderRadius: 10,
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
          style={[this.style.button, { backgroundColor: "#c4302b" }]}
          onPress={() => this.props.navigation.navigate("YouTube")}
        >
          <Text style={this.style.buttonText}>YouTube</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[this.style.button, { backgroundColor: "#2aa1a1" }]}
          onPress={() => this.props.navigation.navigate("Volumio")}
        >
          <Text style={this.style.buttonText}>Volumio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[this.style.button, { backgroundColor: "#d16c19" }]}
          onPress={() => this.props.navigation.navigate("Volume")}
        >
          <Text style={this.style.buttonText}>Głośność</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[this.style.button, { backgroundColor: "#3060e3" }]}
          onPress={() => this.props.navigation.navigate("Microphone")}
        >
          <Text style={this.style.buttonText}>Nagrywanie</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
