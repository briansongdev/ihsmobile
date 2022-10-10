import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { StyleSheet, View, Image, Alert, Linking } from "react-native";
import { WebView } from "react-native-webview";
import * as Updates from "expo-updates";
import * as SplashScreen from "expo-splash-screen";
import {
  Button,
  Text,
  TextInput,
  Portal,
  Dialog,
  Paragraph,
  ActivityIndicator,
} from "react-native-paper";
import {
  MD3LightTheme as DefaultTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { Buffer } from "buffer";
import OnlineHomePage from "./OnlineHomePage.js";

function Account({ route, navigation }) {
  const { isLocal } = route.params;
  const [localName, setLocalName] = useState("");
  const [userObj, setUserObj] = useState("");
  const [tempName, setTempName] = useState("");
  const [fullName, setFullName] = useState("");
  const [grade, setGrade] = useState();
  const [visible, setVisible] = useState(false);
  const INJECTED_JAVASCRIPT = `(
    function() {
      window.ReactNativeWebView.postMessage(document.documentElement.innerHTML);
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener("load", function() {
            if (this.responseURL.match("GetClassSummary")) {
            var message = this.response;
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
            }
        });
        open.apply(this, arguments);
    };})();`;
  if (!isLocal) {
    return (
      <>
        <Portal>
          <Dialog visible={visible} dismissable={false}>
            <Dialog.Title>Loading...</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Customizing the perfect experience for you!</Paragraph>
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator animating={true} color="green" />
              </View>
            </Dialog.Content>
          </Dialog>
        </Portal>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#e5f6df",
          }}
        >
          <Text style={{ margin: 10 }}>
            Welcome. To get started, sign in with your IUSD email (login with
            Google).{" "}
            <Text
              onPress={() => {
                Linking.openURL("https://ihsmobile.webflow.io");
              }}
              style={{ fontWeight: "bold", color: "red" }}
            >
              Click here to read on what data this app stores and how your data
              is privately processed.
            </Text>{" "}
            By continuing to sign in, you affirm that you agree to the above.
          </Text>
        </View>
        <WebView
          source={{ uri: "https://my.iusd.org" }}
          userAgent="Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
          injectedJavaScript={INJECTED_JAVASCRIPT}
          onMessage={async (event) => {
            if (tempName == "") {
              if (
                event.nativeEvent.data.match(/"\d\d\d\d\d\d\d\d\d"/) != null
              ) {
                if (event.nativeEvent.data.match("Irvine High School")) {
                  setTempName(
                    Buffer.from(
                      event.nativeEvent.data
                        .match(/"\d\d\d\d\d\d\d\d\d"/)[0]
                        .split('"')
                        .join("") +
                        ":" +
                        event.nativeEvent.data
                          .match(/"\d\d\d\d\d"/)[0]
                          .split('"')
                          .join("")
                    ).toString("base64")
                  );
                  let arrayOfNames = event.nativeEvent.data
                    .match(/2\d.*@IUSD\.org/g)[0]
                    .split('"')
                    .join("")
                    .slice(2)
                    .slice(0, -9)
                    .match(/[A-Z][a-z]+/g);
                  arrayOfNames.push(arrayOfNames.shift());
                  setFullName(arrayOfNames.join(" "));
                  let gradeString = event.nativeEvent.data
                    .match(/- Grd \d* - /g)[0]
                    .replace(/\D/g, "")
                    .trim();
                  setGrade(Number(gradeString));
                  setUserObj(
                    Number(
                      event.nativeEvent.data
                        .match(/"\d\d\d\d\d\d\d\d\d"/)[0]
                        .split('"')
                        .join("")
                    )
                  );
                } else {
                  alert("You are not a part of Irvine High School.");
                  navigation.navigate("Home");
                }
              }
            } else {
              let result;
              try {
                setVisible(true);
                result = JSON.parse(JSON.parse(event.nativeEvent.data));
                let newClassObject = [];
                for (let i = 0; i < result.length; i++) {
                  newClassObject.push({
                    RoomNumber: result[i].RoomNumber,
                    CourseName: result[i].CourseName,
                    CurrentMarkAndScore: result[i].CurrentMarkAndScore,
                    LastUpdated: result[i].LastUpdated,
                    NumMissingAssignments: result[i].NumMissingAssignments,
                    PeriodTitle: result[i].PeriodTitle,
                  });
                }
                await SecureStore.setItemAsync(
                  "classes",
                  JSON.stringify(newClassObject)
                );
                setTimeout(async () => {
                  await axios
                    .post(
                      "https://ihsbackend.vercel.app/api/accounts/account",
                      {
                        studentID: userObj,
                        name: fullName,
                        currentGrade: grade,
                        bearer: tempName,
                        barcode: "https://barcodeapi.org/api/39/" + userObj,
                      }
                    )
                    .then(async (res) => {
                      if (!res.data.success) {
                        alert("Error: " + res.data.message);
                        navigation.navigate("Home");
                      } else {
                        await SecureStore.setItemAsync("isLocal", "false");
                        await SecureStore.setItemAsync("bearer", tempName);
                        await SecureStore.setItemAsync(
                          "notifications",
                          "false"
                        );
                      }
                    });
                }, 1000);
              } catch (e) {
                alert(
                  "Error. Go back to the home screen and try loading this page again."
                );
              }
            }
          }}
        />
      </>
    );
  } else {
    return (
      <View style={styles.container}>
        <Text variant="titleLarge" style={{ fontWeight: "bold", margin: 10 }}>
          Set up IHS mobile locally
        </Text>
        <Text style={{ fontWeight: "bold" }}>
          Your data will only be stored on this device.
        </Text>
        <Text style={{ margin: 10 }}>
          All we need is your name. You'll add your classes later.
        </Text>
        <TextInput
          label="Full name"
          autoCorrect="false"
          value={localName}
          style={{ width: 300, margin: 10 }}
          onChangeText={(localName) => setLocalName(localName)}
        />
        <Button
          mode="elevated"
          disabled={localName == ""}
          style={{ margin: 10 }}
          contentStyle={{ minWidth: 300 }}
          onPress={async () => {
            try {
              await SecureStore.setItemAsync("isLocal", "true");
              await SecureStore.setItemAsync("name", localName);
            } catch (e) {
              alert(e);
            }
          }}
        >
          Let's go!
        </Button>
      </View>
    );
  }
}
function Landing({ navigation }) {
  const showConfirmDialog = () => {
    return Alert.alert(
      "Set up locally?",
      "Convenient features like device-to-device data transfer will be lost. Continue?",
      [
        {
          text: "Yes",
          onPress: () => {
            navigation.navigate("Account", {
              isLocal: true,
            });
          },
        },
        {
          text: "No",
        },
      ]
    );
  };
  return (
    <View style={styles.container}>
      <Image
        style={styles.tinyLogo}
        source={{
          uri: "https://irvinehigh.iusd.org/sites/irvinehigh/files/images/footer2x_0.png",
        }}
      />
      <Text variant="titleMedium">Welcome to Irvine High Mobile!</Text>
      <Text variant="titleMedium">
        {"\n"}With IHS mobile:{"\n"}
      </Text>
      <Text variant="bodyMedium">
        - Check classes and grades{"\n"}- Plan your schedule{"\n"}- Discover IHS
        clubs{"\n"}- Access important bookmarks{"\n"}- Sign up for flextime
        easily{"\n\n"}...and so much more!
      </Text>
      <Text variant="titleMedium">{"\n"}Let's get started, Vaqueros.</Text>
      <Button
        icon="account-plus"
        mode="elevated"
        style={{ margin: 10 }}
        contentStyle={{ minWidth: 300 }}
        onPress={() =>
          navigation.navigate("Account", {
            isLocal: false,
          })
        }
      >
        Sign in with Aeries
      </Button>
      <Button
        mode="text"
        onPress={() => {
          showConfirmDialog();
        }}
        disabled={true}
      >
        Set up a local account (coming soon)
      </Button>
    </View>
  );
}
const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isSignedIn, setSignedIn] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isDone, setIsDone] = useState(false);
  useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    var loginCheck = setInterval(async () => {
      let userToken;
      try {
        userToken = await SecureStore.getItemAsync("isLocal");
        if (
          userToken != null &&
          (userToken == "true" || userToken == "false")
        ) {
          // valid authentication
          if (!isSignedIn) {
            setSignedIn(true);
          }
        } else {
          if (isSignedIn) {
            setSignedIn(false);
          }
        }
        setLoading(false);
        await SplashScreen.hideAsync();
      } catch (e) {
        alert(e);
      }
    }, 1000);
  }, []);
  useEffect(() => {
    if (Updates.checkForUpdateAsync().isAvailable) {
      Alert.alert(
        "Update",
        "There is a new update. Please go to the App Store to install.",
        [{ text: "Ok", onPress: () => setIsDone(true) }],
        { cancelable: false }
      );
    }
  }, []);
  if (!isDone) {
    if (isLoading) {
      return (
        <View style={styles.topContainer}>
          <ActivityIndicator animating={true} color="green" />
        </View>
      );
    } else {
      return (
        <>
          <PaperProvider theme={theme}>
            <NavigationContainer>
              <Stack.Navigator>
                {!isSignedIn ? (
                  <>
                    <Stack.Screen
                      name="Home"
                      options={{
                        headerShown: false,
                      }}
                      component={Landing}
                    />
                    <Stack.Screen
                      name="Account"
                      options={{
                        animation: "fade_from_bottom",
                      }}
                      component={Account}
                    />
                  </>
                ) : (
                  <Stack.Screen
                    name="HomePage"
                    options={{ headerShown: false }}
                    component={OnlineHomePage}
                  />
                )}
              </Stack.Navigator>
            </NavigationContainer>
          </PaperProvider>
          <StatusBar style="auto" />
        </>
      );
    }
  } else {
    return (
      <View style={styles.container}>
        <Text>There is an update available. Please check the App Store.</Text>
      </View>
    );
  }
}

const theme = {
  ...DefaultTheme,
  roundness: 2,
  version: 3,
  colors: {
    ...DefaultTheme.colors,
    primary: "#329C2D",
    secondary: "#00cccc",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e5f6df",
    alignItems: "center",
    justifyContent: "center",
  },
  topContainer: {
    flex: 1,
    backgroundColor: "#e5f6df",
    alignItems: "center",
    padding: 10,
  },
  tinyLogo: {
    width: 276,
    height: 228,
  },
});
