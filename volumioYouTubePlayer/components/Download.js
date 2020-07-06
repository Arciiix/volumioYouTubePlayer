import React from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Progress from "react-native-progress";

import io from "socket.io-client";
import { ip } from "./ipConfig";

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0.0,
      loaded: false,
      state: "Łączenie z serwerem...",
    };
  }
  style = StyleSheet.create({
    container: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#75a3ff",
    },
    text: {
      color: "white",
      fontSize: 30,
      //DEV
      //fontFamily:
    },
  });
  static navigationOptions = {
    headerShown: false,
  };

  componentDidMount() {
    const socket = io(ip);

    if (socket) {
      this.setState({ loaded: true, state: "Oczekiwanie..." });
    }

    //To avoid getting data on a unmounted component, I handle socket logs after some time
    setTimeout(() => {
      socket.on("progress", (data) => {
        this.setState(
          {
            progress: data / 100,
            state: `Pobieranie (${data}%)`,
          },
          this.forceUpdate
        );
      });
    }, 300);
    setTimeout(() => {
      socket.on("error", (err) => {
        this.setState(
          {
            state: "Błąd!",
          },
          this.forceUpdate
        );
      });
    }, 700);
    setTimeout(() => {
      socket.on("finished", () => {
        this.setState(
          {
            state: "Zakończono!",
          },
          this.forceUpdate
        );
        this.props.navigation.navigate("Volumio");
      });
    }, 1200);
  }

  render() {
    return (
      <View style={this.style.container}>
        <Progress.Bar
          progress={this.state.progress}
          width={300}
          height={20}
          indeterminate={!this.state.loaded}
        />
        <Text style={this.style.text}>{this.state.state}</Text>
      </View>
    );
  }
}
