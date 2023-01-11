import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { Text } from "react-native-paper";

export default function LocationScreen() {
  return (
    <>
      <WebView
        style={{ marginBottom: 60 }}
        userAgent="Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
        source={{
          uri: "http://spyvstyle.com/irvinehigh/shop/home",
        }}
      />
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
    backgroundColor: "#e6fef9",
    alignItems: "center",
    justifyContent: "center",
  },
  tinyLogo: {
    width: 338.7 / 2,
    height: 142.5 / 2,
  },
});
