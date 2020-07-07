import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ip } from "./ipConfig";

import NumericInput from "react-native-numeric-input";
import VerticalSlider from "rn-vertical-slider";

export default class Volume extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      volume: 0,
      isSelected: false,
      isLoaded: false,
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
    input: {
      marginRight: 30,
      marginBottom: 20,
    },
    btn: {
      backgroundColor: "#3a6ed6",
      width: "70%",
      height: "10%",
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      marginBottom: 20,
      marginRight: 30,
      borderRadius: 10,
    },
    btnText: {
      color: "#ffffff",
      textAlign: "center",
      fontSize: 30,
    },
    slider: {
      position: "absolute",
      right: 20,
    },
  });
  static navigationOptions = {
    title: "Głośność",
    headerStyle: {
      backgroundColor: "#75a3ff",
    },
    headerTintColor: "#ffffff",
  };

  async componentDidMount() {
    let request = await fetch(`${ip}/getVolume`);
    let volume = await request.json();
    this.setState({ isLoaded: true, volume: volume.volume });
  }

  async handleChange(newValue) {
    if (newValue !== this.state.volume) {
      await this.setState({ volume: newValue });
      this.forceUpdate();
    }
  }

  stopSlider(newValue) {
    this.handleChange(newValue);
    this.setState({
      isSelected: false,
    });
  }

  async setVolume() {
    let request = await fetch(`${ip}/setVolume?volume=${this.state.volume}`);
    let status = await request.status;
    if (status === 200) {
      this.props.navigation.navigate("Home");
    }
  }

  render() {
    if (this.state.isLoaded) {
      return (
        <View style={this.style.container}>
          <View style={this.style.input}>
            <NumericInput
              onChange={this.handleChange.bind(this)}
              value={this.state.volume}
              key={this.state.volume + "input"}
              minValue={0}
              maxValue={100}
              step={5}
              textColor={"white"}
              leftButtonBackgroundColor={"#ed5847"}
              rightButtonBackgroundColor={"#32c96c"}
              rounded={true}
              borderColor={"#75a3ff"}
              iconStyle={{ color: "white" }}
              totalWidth={250}
              inputStyle={{
                fontSize: 50,
              }}
            />
          </View>
          <TouchableOpacity
            style={this.style.btn}
            onPress={this.setVolume.bind(this)}
          >
            <Text style={this.style.btnText}>Zapisz</Text>
          </TouchableOpacity>
          <View style={this.style.slider}>
            <VerticalSlider
              value={this.state.volume}
              key={this.state.volume + "slider"}
              onChange={() => {
                this.setState({ isSelected: true });
              }}
              onComplete={this.stopSlider.bind(this)}
              disabled={false}
              min={0}
              max={100}
              width={45}
              height={500}
              step={5}
              borderRadius={5}
              showBallIndicator={this.state.isSelected}
              minimumTrackTintColor={"#0bd681"}
              maximumTrackTintColor={"tomato"}
            />
          </View>
        </View>
      );
    } else {
      return (
        <View style={this.style.container}>
          <ActivityIndicator size={100} color="#ffffff" />
        </View>
      );
    }
  }
}
