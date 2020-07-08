import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { ip } from "./ipConfig";

import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";

export default class Microphone extends React.Component {
  style = StyleSheet.create({
    container: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#75a3ff",
    },
    player: {
      display: "flex",
      flexDirection: "row",
    },
    slider: {
      display: "flex",
      justifyContent: "center",
      height: 50,
    },
    playerText: {
      marginLeft: -130,
      color: "white",
      marginTop: 30,
      fontSize: 20,
    },
    record: {
      display: "flex",
      flexDirection: "row",
      position: "absolute",
      bottom: 3,
    },
    button: {
      position: "absolute",
      right: 0,
      bottom: 0,
      backgroundColor: "#3060e3",
      width: 150,
      height: 50,
      justifyContent: "center",
    },
    buttonText: {
      color: "white",
      fontSize: 25,
      textAlign: "center",
    },
  });
  constructor(props) {
    super(props);
    this.state = {
      isPreviewing: false,
      isRecording: false,
      currentPosition: 0,
      totalLength: 0,
    };
  }

  static navigationOptions = {
    title: "Nagrywanie",
    headerStyle: {
      backgroundColor: "#75a3ff",
    },
    headerTintColor: "#ffffff",
  };
  parseMilis(time) {
    let seconds = time / 1000;
    let minutes = Math.floor(seconds / 60);
    console.log(minutes);
    seconds -= minutes * 60;
    return `${this.addZero(minutes)}:${this.addZero(Math.floor(seconds))}`;
  }

  addZero(value) {
    if (value < 10) {
      return "0" + value;
    } else {
      return value;
    }
  }

  tooglePreview() {
    let preview = !this.state.isPreviewing;
    //DEV
    this.setState({ isPreviewing: preview });
  }

  record() {}

  render() {
    return (
      <View style={this.style.container}>
        <View style={this.style.player}>
          <TouchableOpacity onPress={this.tooglePreview.bind(this)}>
            <AntDesign
              name={this.state.isPreviewing ? "pausecircleo" : "playcircleo"}
              size={60}
              color="white"
            />
          </TouchableOpacity>

          <View style={this.style.slider}>
            <Slider
              style={{ width: 300 }}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
            />
          </View>
          <Text style={this.style.playerText}>
            {this.parseMilis(this.state.currentPosition)}/
            {this.parseMilis(this.state.totalLength)}
          </Text>
        </View>
        <View style={this.style.record}>
          <FontAwesome
            name={this.state.isRecording ? "stop-circle" : "microphone"}
            size={90}
            color="white"
          />
        </View>
        <TouchableOpacity style={this.style.button}>
          <Text style={this.style.buttonText}>Dalej</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
