import { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Dimensions } from "react-native";
import { Button, Card, Paragraph } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import WebView from "react-native-webview";

export default function PrivacyPolicy({ navigation }) {
  return (
    <>
      <View style={styles.topContainer}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ alignItems: "center" }}
        >
          <Button
            mode="text"
            textColor="teal"
            icon="chevron-left-circle"
            style={{ margin: 5 }}
            onPress={() => {
              alert(
                "By continuing to login, you affirm that you have read and agree to this Privacy Policy."
              );
              navigation.goBack();
            }}
          >
            Return and login
          </Button>
          <WebView
            automaticallyAdjustContentInsets={false}
            style={{
              flex: 0,
              height: Dimensions.get("window").height - 250,
              width: Dimensions.get("window").width - 30,
            }}
            userAgent="Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
            source={{
              uri: "https://briansongdev.github.io/ihsmobileprivacypolicy/",
            }}
          />
        </ScrollView>
        <StatusBar style="light" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6fef9",
  },
  topContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  tinyLogo: {
    width: 338.7 / 2,
    height: 142.5 / 2,
  },
});
