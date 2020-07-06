import React from "react";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

import Home from "./components/Home";
import YouTube from "./components/YouTube";

const AppNavigator = createStackNavigator(
  {
    Home: Home,
    YouTube: YouTube,
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
