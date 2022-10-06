import {
  setStatusBarNetworkActivityIndicatorVisible,
  StatusBar,
} from "expo-status-bar";
import { useState, useEffect } from "react";
import { StyleSheet, View, Image, Alert, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
import { Button, Text, Card, Title, Paragraph } from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { IMPORTEDB64 } from "./importedURI";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import greetingTime from "greeting-time";

export default function LocationScreen() {
  return (
    <View>
      <Text>hi!</Text>
    </View>
  );
}
