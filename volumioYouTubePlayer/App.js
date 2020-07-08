import React from "react";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

import Home from "./components/Home";
import YouTube from "./components/YouTube";
import Download from "./components/Download";
import Volumio from "./components/Volumio";
import Volume from "./components/Volume";
import Microphone from "./components/Microphone";

const AppNavigator = createStackNavigator(
  {
    Home: Home,
    YouTube: YouTube,
    Download: Download,
    Volumio: Volumio,
    Volume: Volume,
    Microphone: Microphone,
  },
  {
    initialRouteName: "Home",
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
