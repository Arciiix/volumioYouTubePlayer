import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { ip } from "./ipConfig";

import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import FloatingActionButton from "react-native-floating-action-button";

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
      right: 20,
      bottom: 20,
    },
  });

  recording = new Audio.Recording();
  playing = new Audio.Sound();
  constructor(props) {
    super(props);
    this.state = {
      isPreviewing: false,
      isRecording: false,
      currentPosition: 0,
      totalLength: 0,
      uri: undefined,
    };
  }

  static navigationOptions = {
    title: "Nagrywanie",
    headerStyle: {
      backgroundColor: "#75a3ff",
    },
    headerTintColor: "#ffffff",
  };

  async componentDidMount() {
    this.props.navigation.addListener("didFocus", async () => {
      await this.checkPermissions();
    });
    await this.checkPermissions();

    this.props.navigation.addListener("willBlur", async () => {
      await this.unLoadPlayer();
    });
  }

  async componentWillUnmount() {
    await this.unLoadPlayer();
  }

  async checkPermissions() {
    let permission = await Audio.getPermissionsAsync();
    if (!permission.granted) {
      let request = await Audio.requestPermissionsAsync();
      if (!request.granted) {
        this.props.navigation.navigate("Home");
      }
    }
  }

  parseMilis(time) {
    let seconds = time / 1000;
    let minutes = Math.floor(seconds / 60);
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

  async tooglePreview() {
    let isLoaded = await (await this.playing.getStatusAsync()).isLoaded;

    if (!this.state.uri) return;

    if (!this.state.isPreviewing && !isLoaded) {
      //If the player isn't loaded yet
      await this.playing.loadAsync({ uri: this.state.uri });
      await this.playing.setIsLoopingAsync(true);
      await this.playing.playAsync();
      this.interval = setInterval(async () => {
        this.playbackUpdate();
      }, 950);
      this.setState({ isPreviewing: true });
    } else if (!this.state.isPreviewing) {
      //If the player is paused
      await this.playing.playAsync();
      this.setState({ isPreviewing: true });
    } else {
      //If the player is playing and user wants it to pause
      await this.playing.pauseAsync();
      this.setState({ isPreviewing: false });
    }
  }

  async playbackUpdate() {
    let status = await this.playing.getStatusAsync();
    this.setState({
      currentPosition: status.positionMillis,
      totalLength: status.durationMillis,
    });
  }

  async toogleRecord() {
    if (this.state.isRecording) {
      //Stop, get the uri and unload the recording instance
      await this.recording.stopAndUnloadAsync();
      let uri = await this.recording.getURI();
      this.recording = new Audio.Recording();

      //Create a new player instance
      let isLoaded = await (await this.playing.getStatusAsync()).isLoaded;
      if (isLoaded) {
        await this.playing.stopAsync();
        await this.playing.unloadAsync();
        clearInterval(this.interval);
      }
      this.playing = new Audio.Sound();

      this.setState({
        isRecording: false,
        uri: uri,
        currentPosition: 0,
        totalLength: 0,
      });
    } else {
      await this.recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      //If the preview is playnig, pause it
      if (this.state.isPreviewing) {
        await this.tooglePreview();
      }
      await this.recording.startAsync();
      this.setState({ isRecording: true });
    }
  }

  async changePosition(position) {
    let isLoaded = await (await this.playing.getStatusAsync()).isLoaded;
    if (!isLoaded) return;
    let millis = Math.floor(position * 1000);
    await this.playing.setPositionAsync(millis);
  }

  async unLoadPlayer() {
    try {
      await this.recording.stopAndUnloadAsync();
      this.recording = null;
    } catch (err) {}

    let isLoaded = await (await this.playing.getStatusAsync()).isLoaded;
    if (!isLoaded) return;
    return new Promise(async (resolve, reject) => {
      await this.playing.stopAsync();
      await this.playing.unloadAsync();
      clearInterval(this.interval);
      resolve();
    });
  }

  async send() {
    if (!this.state.uri) return;
    let data = new FormData();
    let filename = this.state.uri.split("\\").pop().split("/").pop();
    data.append("recording", {
      uri: this.state.uri,
      name: filename,
      type: "audio/mp4",
    });
    let request = await fetch(`${ip}/recording`, {
      method: "POST",
      body: data,
    });
    let status = await request.status;
    if (status === 200) {
      this.props.navigation.navigate("Volumio");
    }
  }

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
              value={this.state.currentPosition / 1000}
              minimumValue={0}
              maximumValue={this.state.totalLength / 1000}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              thumbTintColor={"white"}
              onValueChange={this.changePosition.bind(this)}
            />
          </View>
          <Text style={this.style.playerText}>
            {this.parseMilis(this.state.currentPosition)}/
            {this.parseMilis(this.state.totalLength)}
          </Text>
        </View>
        <View style={this.style.record}>
          <TouchableOpacity onPress={this.toogleRecord.bind(this)}>
            <FontAwesome
              name={this.state.isRecording ? "stop-circle" : "microphone"}
              size={90}
              color="white"
            />
          </TouchableOpacity>
        </View>
        <View style={this.style.button}>
          <FloatingActionButton
            size={60}
            text="Zapisz"
            iconName="md-save"
            iconType="Ionicons"
            iconColor="#3bad95"
            textColor="#3bad95"
            shadowColor="#3bad95"
            rippleColor="#3bad95"
            textDisable={true}
            onPress={this.send.bind(this)}
          />
        </View>
      </View>
    );
  }
}
