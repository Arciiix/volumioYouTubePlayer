import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import FloatingActionButton from "react-native-floating-action-button";

import { ip } from "./ipConfig";

export default class YouTube extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: true,
      url: "",
      webViewShowing: true,
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
  componentDidMount() {
    this.props.navigation.addListener("didFocus", () => {
      this.setState({ webViewShowing: true }, this.forceUpdate);
    });
  }
  render() {
    if (this.state.webViewShowing) {
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
    } else {
      return <Text></Text>;
    }
  }

  handleUrlChange(url) {
    if (url.includes("watch?v=")) {
      this.setState({ url: url, isDisabled: false });
    } else {
      this.setState({ url: url, isDisabled: true });
    }
  }

  async play() {
    if (this.state.isDisabled !== false) return;
    let request = await fetch(
      `${ip}/download?url=${encodeURI(this.state.url)}`
    );
    console.log(request.status);
    if (request.status === 200) {
      this.setState({ webViewShowing: false }, this.forceUpdate);
      this.props.navigation.navigate("Download");
    }
  }
}
