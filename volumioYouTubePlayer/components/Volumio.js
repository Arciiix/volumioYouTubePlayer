import React from "react";
import { WebView } from "react-native-webview";

import { volumioIp } from "./ipConfig";

export default class Volumio extends React.Component {
  static navigationOptions = {
    title: "Volumio",
    headerStyle: {
      backgroundColor: "#75a3ff",
    },
    headerTintColor: "#ffffff",
  };
  render() {
    return <WebView source={{ uri: volumioIp }} style={{ flex: 1 }} />;
  }
}
