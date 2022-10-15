import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Updates from "expo-updates";
import {
  Button,
  Text,
  Portal,
  Dialog,
  Paragraph,
  ActivityIndicator,
  Modal,
  Card,
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
import OnlineHomePage from "./components/OnlineHomePage.js";
import ProposeClub from "./components/ProposeClub.js";
import AddBookmark from "./components/AddBookmark.js";
import { LogBox } from "react-native";
import PrivacyPolicy from "./components/PrivacyPolicy.js";

function Account({ route, navigation }) {
  const { isLocal } = route.params;
  const [userObj, setUserObj] = useState("");
  const [tempName, setTempName] = useState("");
  const [fullName, setFullName] = useState("");
  const [grade, setGrade] = useState();
  const [visible, setVisible] = useState(false);
  const [viewedPP, setPP] = useState(false);
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
            <Dialog.Content style={{ height: 300 }}>
              <Paragraph>
                Please wait. We're customizing the perfect experience for you!
              </Paragraph>
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 100,
                }}
              >
                <ActivityIndicator animating={true} color="green" />
              </View>
            </Dialog.Content>
          </Dialog>
        </Portal>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#e6fef9",
          }}
        >
          <Text style={{ marginTop: 10, marginLeft: 10, marginRight: 10 }}>
            Welcome. To get started, read our privacy policy first. Then, sign
            in with your{" "}
            <Text style={{ fontWeight: "bold" }}>
              IUSD email (thru Google).
            </Text>
          </Text>
          <Button
            mode="text"
            textColor="teal"
            icon="chevron-right-circle"
            style={{ margin: 10 }}
            onPress={() => {
              setPP(true);
              navigation.navigate("Privacy Policy");
            }}
          >
            Our Privacy Policy
          </Button>
        </View>
        {viewedPP ? (
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
                if (tempName != "") {
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
                            studentID: "",
                            name: fullName,
                            currentGrade: grade,
                            bearer: tempName,
                            barcode: "",
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
                            await SecureStore.setItemAsync(
                              "gradesShowed",
                              "true"
                            );
                            await SecureStore.setItemAsync("uid", userObj);
                          }
                        });
                    }, 1000);
                  } catch (e) {
                    alert(
                      "Error. Go back to the home screen and try loading this page again."
                    );
                  }
                } else {
                  alert(
                    "Error. You have logged in using a non-IUSD email (your parents' account?). Reload the app and try again."
                  );
                }
              }
            }}
          />
        ) : (
          <View style={styles.container}>
            <Card style={{ margin: 15, borderRadius: 15 }}>
              <Card.Content>
                <Paragraph>
                  Please review the Privacy Policy (above) and return to this
                  screen when you have finished reading. By continuing to sign
                  in, you affirm that you agree to our Privacy Policy.{" "}
                  <Text style={{ fontWeight: "bold" }}>Thank you.</Text>
                </Paragraph>
              </Card.Content>
            </Card>
          </View>
        )}
      </>
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
    </View>
  );
}
const Stack = createNativeStackNavigator();

export default function App() {
  const [isSignedIn, setSignedIn] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isDone, setIsDone] = useState(false);
  useEffect(() => {
    LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
    LogBox.ignoreAllLogs(); //Ignore all log notifications
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
                    <Stack.Group>
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
                    </Stack.Group>
                    <Stack.Group screenOptions={{ presentation: "modal" }}>
                      <Stack.Screen
                        name="Privacy Policy"
                        options={{
                          headerLargeTitle: true,
                          headerShadowVisible: false,
                        }}
                        component={PrivacyPolicy}
                      />
                    </Stack.Group>
                  </>
                ) : (
                  <>
                    <Stack.Group>
                      <Stack.Screen
                        name="HomePage"
                        options={{ headerShown: false }}
                        component={OnlineHomePage}
                      />
                    </Stack.Group>
                    <Stack.Group screenOptions={{ presentation: "modal" }}>
                      <Stack.Screen
                        name="Add your club"
                        options={{
                          headerLargeTitle: true,
                          headerShadowVisible: false,
                        }}
                        component={ProposeClub}
                      />
                      <Stack.Screen
                        name="Add a bookmark"
                        options={{
                          headerLargeTitle: true,
                          headerShadowVisible: false,
                        }}
                        component={AddBookmark}
                      />
                    </Stack.Group>
                  </>
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
    primary: "teal",
    secondary: "#00cccc",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6fef9",
    alignItems: "center",
    justifyContent: "center",
  },
  topContainer: {
    flex: 1,
    backgroundColor: "#e6fef9",
    alignItems: "center",
    padding: 10,
  },
  tinyLogo: {
    width: 276,
    height: 228,
  },
});
