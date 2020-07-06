import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import FloatingActionButton from "react-native-floating-action-button";

import ip from "./ipConfig";

export default class YouTube extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: true,
      url: "",
    };
  }
  style = StyleSheet.create({
    container: {
      flex: 1,
      display: "flex",
    },
    webView: {
      flex: 1,
      marginTop: 0,
      height: "100%",
    },
    saveBtn: {
      position: "absolute",
      bottom: 20,
      right: 20,
    },
  });

  static navigationOptions = {
    title: "YouTube",
    headerStyle: {
      backgroundColor: "#75a3ff",
    },
    headerTintColor: "#ffffff",
  };
  render() {
    return (
      <View style={this.style.container}>
        <WebView
          source={{ uri: "https://youtube.com" }}
          style={this.style.webView}
          injectedJavaScript={`
    (function() {
      function wrap(fn) {
        return function wrapper() {
          var res = fn.apply(this, arguments);
          window.ReactNativeWebView.postMessage('navigationStateChange');
          return res;
        }
      }
      history.pushState = wrap(history.pushState);
      history.replaceState = wrap(history.replaceState);
      window.addEventListener('popstate', function() {
        window.ReactNativeWebView.postMessage('navigationStateChange');
      });
    })();
    true;
  `}
          onMessage={({ nativeEvent: state }) => {
            if (state.data === "navigationStateChange") {
              this.handleUrlChange(state.url);
            }
          }}
        />
        <View style={this.style.saveBtn}>
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
            disabled={this.state.isDisabled}
            onPress={this.play.bind(this)}
          />
        </View>
      </View>
    );
  }

  handleUrlChange(url) {
    if (url.includes("watch?v=")) {
      this.setState({ url: url, isDisabled: false });
    } else {
      this.setState({ url: url, isDisabled: true });
    }
  }

  play() {
    if (this.state.isDisabled !== false) return;
    //.log(`${ip}/download?url=${encodeURI(this.state.url)}`);
  }
}
