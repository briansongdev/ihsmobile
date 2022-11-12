import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  KeyboardAvoidingView,
  AppState,
} from "react-native";
import { WebView } from "react-native-webview";
import { Buffer } from "buffer";
import * as Haptics from "expo-haptics";
import { VibrantLinearGradient, VibrantLinearGradient2 } from "./GradientText";
import {
  IconButton,
  Text,
  Card,
  Title,
  Paragraph,
  Portal,
  Dialog,
  Button,
  ActivityIndicator,
  Switch,
  Divider,
} from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { SCHEDULEINTERP } from "../importedURI";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import greetingTime from "greeting-time";
import CalendarScreen from "./CalendarScreen.js";
import ChatScreen from "./BookmarkScreen.js";
import LocationScreen from "./FlexTimeScreen.js";
import ClubScreen from "./ClubScreen.js";
import InteractiveTextInput from "react-native-text-input-interactive";
import AnimatedLottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";

function HomeScreen({ navigation }) {
  const [account, setAccount] = useState({});
  const [calendar, setCalendar] = useState([]);
  const [idVisible, setIDvisible] = useState(false);
  const [refreshVisible, setRefreshVisible] = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [areGradesShowed, switchGradesShowed] = useState(false);
  const [tempName, setTempName] = useState("");
  const [userObj, setUserObj] = useState("");
  const [fullName, setFullName] = useState("");
  const [grade, setGrade] = useState();
  const [relevantURI, setURI] = useState("");
  const [firstLoad, setFirstLoad] = useState(true);
  const [uid, setUID] = useState("");
  const [trueName, setTrueName] = useState("");
  const [wetData, setWetData] = useState({});
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  // fadeAnim will be used as the value for opacity. Initial Value: 0
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };
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
  const colors = [
    "#e6fef9",
    "#ffffff",
    "#ffe6ee",
    "#e5f6df",
    "#cae9f5",
    "#e6d1f2",
  ];

  const ColorCard = ({ color, onPress }) => {
    return (
      <TouchableOpacity
        style={{
          width: "33%",
          height: 150,
          padding: 5,
        }}
        onPress={async () => {
          await SecureStore.setItemAsync("bgColor", color);
          setBGColor(color);
          navigation.setOptions({ headerStyle: { backgroundColor: color } });
          setIDvisible(false);
        }}
      >
        <View
          style={{
            padding: 5,
            backgroundColor: "#FFF",
            borderRadius: 15,
            height: "100%",
          }}
        >
          <Animated.View
            style={{
              backgroundColor: color,
              padding: 10,
              borderRadius: 10,
              flex: 1,
            }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const [bgColor, setBGColor] = useState("");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: bgColor,
    },
    topContainer: {
      flex: 1,
      backgroundColor: bgColor,
      alignItems: "center",
      justifyContent: "center",
    },
    tinyLogo: {
      width: 338.7 / 3,
      height: 142.5 / 3,
      marginBottom: 10,
    },
  });

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          await axios
            .get(
              "https://api.openweathermap.org/data/2.5/weather?lat=33.6846&lon=-117.8265&appid=7f88733c44e171b82e02d7bac8213ade"
            )
            .then((res) => {
              setWetData(res.data);
            });
        }

        appState.current = nextAppState;
        setAppStateVisible(appState.current);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const hi = async () => {
      if ((await SecureStore.getItemAsync("newUser")) == "true") {
        navigation.navigate("Welcome, Vaquero.");
      }
      if (Object.keys(account).length == 0 || calendar.length == 0) {
        await axios
          .get(
            "https://api.openweathermap.org/data/2.5/weather?lat=33.6846&lon=-117.8265&appid=7f88733c44e171b82e02d7bac8213ade"
          )
          .then((res) => {
            setWetData(res.data);
          });
        await axios
          .get("https://ihsbackend.vercel.app/api/accounts/account", {
            headers: {
              bearer: await SecureStore.getItemAsync("bearer"),
            },
          })
          .then(async (res) => {
            if (res.data.success) {
              let newRes = res.data.account;
              newRes.classes = JSON.parse(
                await SecureStore.getItemAsync("classes")
              ).sort(
                ({ PeriodTitle: a }, { PeriodTitle: b }) =>
                  Number(a) - Number(b)
              );
              setAccount(newRes);
              setURI(
                "https://barcode.tec-it.com/barcode.ashx?data=" +
                  (await SecureStore.getItemAsync("uid")) +
                  "&code=Code39"
              );
              setTrueName(await SecureStore.getItemAsync("trueName"));
            } else {
              console.log(res.data.message);
            }
          })
          .catch(async (err) => {
            await SecureStore.deleteItemAsync("isLocal");
            await SecureStore.deleteItemAsync("bearer");
            await SecureStore.deleteItemAsync("classes");
            alert(
              "We have run into an error. Please force-quit the app and restart."
            );
          });
        const bearr = await SecureStore.getItemAsync("bearer");
        setUID(await SecureStore.getItemAsync("uid"));
        if (firstLoad) {
          if ((await SecureStore.getItemAsync("gradesShowed")) == "true")
            switchGradesShowed(true);
          else switchGradesShowed(false);
          setFirstLoad(false);
        }
        await axios
          .post("https://ihsbackend.vercel.app/api/accounts/getCalendar", {
            bearer: bearr,
          })
          .then((res) => {
            setTimeout(() => setCalendar(res.data.calendar), 1500);
          })
          .catch((err) => {
            if (err.response) {
              // Request made and server responded
              console.log(err.response.data);
              console.log(err.response.status);
              console.log(err.response.headers);
            } else if (err.request) {
              // The request was made but no response was received
              console.log(err.request);
            } else {
              // Something happened in setting up the request that triggered an Error
              console.log("Error", err.message);
            }
          });
      }
      navigation.setOptions({
        headerLeft: () => (
          <IconButton
            icon="palette-outline"
            iconColor="teal"
            size={30}
            onPress={async () => {
              setIDvisible(true);
            }}
          />
        ),
        headerRight: () => (
          <IconButton
            icon="refresh"
            iconColor="teal"
            size={30}
            onPress={() => {
              if (refreshVisible) {
                setRefreshVisible(false);
              } else {
                Alert.alert(
                  "Re-sync with Aeries and refresh your grades?",
                  "You'll be asked to sign-in with Google again.",
                  [
                    {
                      text: "No",
                      style: "cancel",
                    },
                    {
                      text: "Yes",
                      onPress: async () => {
                        Haptics.notificationAsync(
                          Haptics.NotificationFeedbackType.Warning
                        );
                        setRefreshVisible(true);
                      },
                    },
                  ]
                );
              }
            }}
          />
        ),
      });
    };
    hi();
  }, [areGradesShowed, tempName, refreshVisible]);
  useEffect(() => {
    const hi = async () =>
      setBGColor(await SecureStore.getItemAsync("bgColor"));
    hi();
  }, []);
  if (
    Object.keys(account).length == 0 ||
    calendar.length == 0 ||
    Object.keys(wetData).length == 0
  ) {
    navigation.setOptions({
      headerShown: false,
      tabBarStyle: { display: "none" },
    });
    return (
      <View
        style={{
          backgroundColor: "white",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AnimatedLottieView
          autoPlay
          source={{
            uri: "https://assets10.lottiefiles.com/private_files/lf30_c3gZyd.json",
          }}
        />
      </View>
    );
  } else {
    navigation.setOptions({
      headerShown: true,
      tabBarStyle: {
        display: "flex",
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        paddingTop: 7,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderLeftWidth: 0.2,
        borderRightWidth: 0.2,
        position: "absolute",
        overflow: "hidden",
      },
    });
    if (refreshVisible) {
      return (
        <>
          <Portal>
            <Dialog visible={loadingVisible} dismissable={false}>
              <Dialog.Title>Loading...</Dialog.Title>
              <Dialog.Content>
                <Paragraph>You'll be back in just a sec.</Paragraph>
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <ActivityIndicator animating={true} color="teal" />
                </View>
              </Dialog.Content>
            </Dialog>
          </Portal>
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
                    await SecureStore.setItemAsync(
                      "uid",
                      event.nativeEvent.data
                        .match(/"\d\d\d\d\d\d\d\d\d"/)[0]
                        .split('"')
                        .join("")
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
                    setLoadingVisible(true);
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
                          } else {
                            setLoadingVisible(false);
                            setRefreshVisible(false);
                            let newRes = res.data.account;
                            newRes.classes = JSON.parse(
                              await SecureStore.getItemAsync("classes")
                            ).sort(
                              ({ PeriodTitle: a }, { PeriodTitle: b }) =>
                                Number(a) - Number(b)
                            );
                            setAccount(newRes);
                          }
                        });
                    }, 1000);
                  } catch (e) {}
                } else {
                  alert(
                    "Error. You have logged in using a non-IUSD email (your parents' account?). Reload the app and try again."
                  );
                }
              }
            }}
          />
        </>
      );
    } else {
      fadeIn();
      return (
        <>
          <Portal>
            <Dialog visible={idVisible} dismissable={false}>
              <Dialog.Title>
                <Text style={{ fontWeight: "bold" }} variant="displayMedium">
                  Personalization
                </Text>
              </Dialog.Title>
              <Dialog.Content>
                <KeyboardAvoidingView behavior="padding">
                  <ScrollView keyboardShouldPersistTaps="handled">
                    <Text>Display name</Text>
                    <InteractiveTextInput
                      placeholder="Set preferred first name here (if different from legal name)"
                      autoComplete="none"
                      autoCorrect="none"
                      onChangeText={async (e) => {
                        setTrueName(e.split(" ")[0].substring(0, 12));
                        await SecureStore.setItemAsync(
                          "trueName",
                          e.split(" ")[0].substring(0, 12)
                        );
                      }}
                      value={trueName}
                      textInputStyle={{ width: "90%", margin: 10 }}
                    ></InteractiveTextInput>
                    <Paragraph>
                      Choose a nice background for yourself.
                    </Paragraph>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                      }}
                    >
                      {colors.map((color, index) => {
                        return <ColorCard key={index} color={color} />;
                      })}
                    </View>
                  </ScrollView>
                </KeyboardAvoidingView>
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  textColor="teal"
                  onPress={async () => {
                    if (trueName != account.name)
                      await SecureStore.setItemAsync("trueName", trueName);
                    setIDvisible(false);
                  }}
                >
                  Done
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
          <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
            <Animated.View
              style={{ backgroundColor: bgColor, opacity: fadeAnim }}
            >
              <View style={{ backgroundColor: bgColor }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      marginLeft: 10,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                    variant="displaySmall"
                  >
                    {greetingTime(new Date())},
                  </Text>
                  <VibrantLinearGradient variant="displaySmall">
                    {" "}
                    {trueName.split(" ")[0]}!
                  </VibrantLinearGradient>
                </View>
                <Text
                  style={{
                    marginLeft: 10,
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                  variant="labelMedium"
                >
                  {" "}
                  <Text style={{ fontWeight: "bold", color: "teal" }}>
                    {new Date().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    //{" "}
                    {
                      SCHEDULEINTERP[
                        calendar[new Date().getMonth() - 8][
                          new Date().getDate() - 1
                        ]
                      ]
                    }
                  </Text>
                </Text>
                <LinearGradient
                  style={{
                    marginBottom: 20,
                    marginLeft: 20,
                    marginRight: 20,
                    marginTop: 0,
                    borderRadius: 10,
                    height: 130,
                  }}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 1 }}
                  colors={["skyblue", "#FFB6C1"]}
                >
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexDirection: "row",
                      height: 130,
                    }}
                  >
                    <View
                      style={{
                        alignItems: "left",
                        width: "50%",
                      }}
                    >
                      <Image
                        style={{ width: 120, height: 120, marginLeft: 10 }}
                        source={{
                          uri: "https://cdn-icons-png.flaticon.com/512/4052/4052984.png",
                        }}
                      />
                    </View>
                    <View style={{ padding: 10, width: "50%" }}>
                      <Text
                        style={{
                          textAlign: "right",
                          color: "white",
                          fontFamily: "PlexMed",
                        }}
                      >
                        {wetData.weather[0].main}
                      </Text>
                      <Text
                        style={{
                          textAlign: "right",
                          color: "white",
                          fontSize: 36,
                          fontWeight: "600",
                          fontFamily: "PlexSans",
                        }}
                      >
                        {Math.round((wetData.main.temp - 273.15) * 1.8 + 32)}°
                      </Text>
                      <Text
                        style={{
                          textAlign: "right",
                          color: "white",
                          fontFamily: "PlexReg",
                        }}
                      >
                        Feels like{" "}
                        {Math.round(
                          (wetData.main.feels_like - 273.15) * 1.8 + 32
                        )}
                        {""}°
                      </Text>
                      <Text
                        style={{
                          textAlign: "right",
                          color: "white",
                          fontFamily: "PlexReg",
                        }}
                      >
                        Lo:{" "}
                        {Math.round(
                          (wetData.main.temp_min - 273.15) * 1.8 + 32
                        )}
                        {"° "}// Hi:{" "}
                        {Math.round(
                          (wetData.main.temp_max - 273.15) * 1.8 + 32
                        )}
                        {""}°
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
                <VibrantLinearGradient2 variant="displaySmall">
                  Coming up:
                </VibrantLinearGradient2>
              </View>
            </Animated.View>
            <ScrollView style={styles.container}>
              {account.classes.map((d, index) => {
                switch (
                  calendar[new Date().getMonth() - 8][new Date().getDate() - 1]
                ) {
                  case 0: {
                    if (index == 0) {
                      return (
                        <Card
                          style={{
                            marginLeft: 15,
                            marginRight: 15,
                            marginTop: 10,
                            borderRadius: 10,
                          }}
                          key={index + 30}
                        >
                          <Card.Content>
                            <Title
                              style={{ fontWeight: "bold", color: "teal" }}
                            >
                              Break!
                            </Title>
                            <Paragraph>
                              Enjoy your day off!{"\n\n"}(Check the IHS website
                              for "special" days, like the finals schedule.
                              These won't reflect on this app.)
                            </Paragraph>
                          </Card.Content>
                        </Card>
                      );
                    } else {
                      return <></>;
                    }
                  }
                  case 1: {
                    const times = [
                      "",
                      "",
                      "8:30 AM - 9:55 AM",
                      "",
                      "10:10 AM - 12:25 PM (Rally)",
                      "",
                      "1:05 PM - 2:20 PM",
                      "",
                      "2:25 PM - 3:40 PM",
                    ];
                    const hr = new Date().getHours(),
                      min = new Date().getMinutes();
                    const chokepoints = [
                      [0, 0],
                      [0, 0],
                      [9, 55],
                      [10, 5],
                      [12, 25],
                      [13, 0],
                      [14, 20],
                      [0, 0],
                      [15, 40],
                    ];
                    if (Number(d.PeriodTitle) % 2 == 0) {
                      if (Number(d.PeriodTitle) == 2) {
                        return (
                          <>
                            {hr < chokepoints[2][0] ||
                            (hr == chokepoints[2][0] &&
                              min < chokepoints[2][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 60}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle)]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[3][0] ||
                            (hr == chokepoints[3][0] &&
                              min < chokepoints[3][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={
                                  d.CourseName +
                                  d.CurrentMarkAndScore +
                                  d.LastUpdated
                                }
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Break -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      9:55 AM - 10:05 AM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 4) {
                        return (
                          <>
                            {hr < chokepoints[4][0] ||
                            (hr == chokepoints[4][0] &&
                              min < chokepoints[4][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 19990}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle)]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[5][0] ||
                            (hr == chokepoints[5][0] &&
                              min < chokepoints[5][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 120}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Lunch -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      12:25 PM - 1:00 PM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else {
                        if (
                          hr < chokepoints[Number(d.PeriodTitle)][0] ||
                          (hr == chokepoints[Number(d.PeriodTitle)][0] &&
                            min < chokepoints[Number(d.PeriodTitle)][1])
                        ) {
                          return (
                            <Card
                              style={{
                                marginLeft: 15,
                                marginRight: 15,
                                marginTop: 10,
                                borderRadius: 10,
                              }}
                              key={index + 150}
                            >
                              <Card.Content>
                                <Title
                                  style={{
                                    fontWeight: "bold",
                                    color: "teal",
                                  }}
                                >
                                  {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                  {d.PeriodTitle}
                                  {"\n"}
                                  <Title style={{ fontWeight: "normal" }}>
                                    {times[Number(d.PeriodTitle)]}
                                  </Title>
                                </Title>
                                {areGradesShowed ? (
                                  <>
                                    {d.CurrentMarkAndScore != "" ? (
                                      <Paragraph>
                                        {d.CurrentMarkAndScore}
                                        {"\n"}
                                        Last updated: {d.LastUpdated}
                                      </Paragraph>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Card.Content>
                            </Card>
                          );
                        }
                      }
                    }
                    break;
                  }
                  case 11: {
                    const times = [
                      "",
                      "",
                      "8:30 AM - 9:55 AM",
                      "",
                      "10:10 AM - 12:25 PM (Rally)",
                      "",
                      "1:05 PM - 2:20 PM",
                      "",
                      "2:25 PM - 3:40 PM",
                    ];
                    const hr = new Date().getHours(),
                      min = new Date().getMinutes();
                    const chokepoints = [
                      [0, 0],
                      [9, 55],
                      [10, 5],
                      [12, 25],
                      [13, 0],
                      [14, 20],
                      [0, 0],
                      [15, 40],
                    ];
                    if (Number(d.PeriodTitle) % 2 == 1) {
                      if (Number(d.PeriodTitle) == 1) {
                        return (
                          <>
                            {hr < chokepoints[1][0] ||
                            (hr == chokepoints[1][0] &&
                              min < chokepoints[1][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 180}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle) + 1]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[2][0] ||
                            (hr == chokepoints[2][0] &&
                              min < chokepoints[2][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 210}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Break -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      9:55 AM - 10:05 AM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 3) {
                        return (
                          <>
                            {hr < chokepoints[3][0] ||
                            (hr == chokepoints[3][0] &&
                              min < chokepoints[3][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 240}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle) + 1]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[4][0] ||
                            (hr == chokepoints[4][0] &&
                              min < chokepoints[4][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 270}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Lunch -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      12:25 PM - 1:00 PM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else {
                        if (
                          hr < chokepoints[Number(d.PeriodTitle)][0] ||
                          (hr == chokepoints[Number(d.PeriodTitle)][0] &&
                            min < chokepoints[Number(d.PeriodTitle)][1])
                        ) {
                          return (
                            <Card
                              style={{
                                marginLeft: 15,
                                marginRight: 15,
                                marginTop: 10,
                                borderRadius: 10,
                              }}
                              key={index + 300}
                            >
                              <Card.Content>
                                <Title
                                  style={{
                                    fontWeight: "bold",
                                    color: "teal",
                                  }}
                                >
                                  {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                  {d.PeriodTitle}
                                  {"\n"}
                                  <Title style={{ fontWeight: "normal" }}>
                                    {times[Number(d.PeriodTitle) + 1]}
                                  </Title>
                                </Title>
                                {areGradesShowed ? (
                                  <>
                                    {d.CurrentMarkAndScore != "" ? (
                                      <Paragraph>
                                        {d.CurrentMarkAndScore}
                                        {"\n"}
                                        Last updated: {d.LastUpdated}
                                      </Paragraph>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Card.Content>
                            </Card>
                          );
                        }
                      }
                    }
                    break;
                  }
                  case 2: {
                    const times = [
                      "8:30 AM - 8:55 AM",
                      "9:00 AM - 9:25 AM",
                      "9:30 AM - 9:55 AM",
                      "10:00 AM - 10:25 AM",
                      "10:40 AM - 11:05 AM",
                      "11:10 AM - 11:35 AM",
                      "11:40 AM - 12:05 PM",
                      "12:10 PM - 12:35 PM",
                    ];
                    const hr = new Date().getHours(),
                      min = new Date().getMinutes();
                    const chokepoints = [
                      [10, 35],
                      [8, 55],
                      [9, 25],
                      [9, 55],
                      [10, 25],
                      [11, 5],
                      [11, 35],
                      [12, 5],
                      [12, 35],
                    ];
                    if (
                      Number(d.PeriodTitle) > 0 &&
                      Number(d.PeriodTitle) < 9
                    ) {
                      if (Number(d.PeriodTitle) == 4) {
                        return (
                          <>
                            {hr < chokepoints[4][0] ||
                            (hr == chokepoints[4][0] &&
                              min < chokepoints[4][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 330}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle) - 1]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[0][0] ||
                            (hr == chokepoints[0][0] &&
                              min < chokepoints[0][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 360}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Break -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      10:25 AM - 10:35 AM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else {
                        if (
                          hr < chokepoints[Number(d.PeriodTitle)][0] ||
                          (hr == chokepoints[Number(d.PeriodTitle)][0] &&
                            min < chokepoints[Number(d.PeriodTitle)][1])
                        ) {
                          return (
                            <Card
                              style={{
                                marginLeft: 15,
                                marginRight: 15,
                                marginTop: 10,
                                borderRadius: 10,
                              }}
                              key={index + 390}
                            >
                              <Card.Content>
                                <Title
                                  style={{
                                    fontWeight: "bold",
                                    color: "teal",
                                  }}
                                >
                                  {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                  {d.PeriodTitle}
                                  {"\n"}
                                  <Title style={{ fontWeight: "normal" }}>
                                    {times[Number(d.PeriodTitle) - 1]}
                                  </Title>
                                </Title>
                                {areGradesShowed ? (
                                  <>
                                    {d.CurrentMarkAndScore != "" ? (
                                      <Paragraph>
                                        {d.CurrentMarkAndScore}
                                        {"\n"}
                                        Last updated: {d.LastUpdated}
                                      </Paragraph>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Card.Content>
                            </Card>
                          );
                        }
                      }
                    }
                    break;
                  }
                  case 3: {
                    const times = [
                      "",
                      "",
                      "8:30 AM - 9:55 AM",
                      "",
                      "10:40 AM - 12:05 PM",
                      "",
                      "12:45 PM - 2:10 PM",
                      "",
                      "2:15 PM - 3:40 PM",
                    ];
                    // const hr = new Date().getHours(),
                    //   min = new Date().getMinutes();
                    const hr = 4,
                      min = 30;
                    const chokepoints = [
                      [10, 25],
                      [0, 0],
                      [9, 55],
                      [10, 35],
                      [12, 5],
                      [12, 40],
                      [14, 10],
                      [0, 0],
                      [15, 40],
                    ];
                    if (Number(d.PeriodTitle) % 2 == 0) {
                      if (Number(d.PeriodTitle) == 2) {
                        return (
                          <>
                            {hr < chokepoints[2][0] ||
                            (hr == chokepoints[2][0] &&
                              min < chokepoints[2][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 420}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle)]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[0][0] ||
                            (hr == chokepoints[0][0] &&
                              min < chokepoints[0][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 450}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Flex Time -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      10:00 AM - 10:25 AM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[3][0] ||
                            (hr == chokepoints[3][0] &&
                              min < chokepoints[3][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 480}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Break -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      10:25 AM - 10:35 AM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 4) {
                        return (
                          <>
                            {hr < chokepoints[4][0] ||
                            (hr == chokepoints[4][0] &&
                              min < chokepoints[4][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 510}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle)]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[5][0] ||
                            (hr == chokepoints[5][0] &&
                              min < chokepoints[5][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 540}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Lunch -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      12:05 PM - 12:40 PM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else {
                        if (
                          hr < chokepoints[Number(d.PeriodTitle)][0] ||
                          (hr == chokepoints[Number(d.PeriodTitle)][0] &&
                            min < chokepoints[Number(d.PeriodTitle)][1])
                        ) {
                          return (
                            <Card
                              style={{
                                marginLeft: 15,
                                marginRight: 15,
                                marginTop: 10,
                                borderRadius: 10,
                              }}
                              key={index + 570}
                            >
                              <Card.Content>
                                <Title
                                  style={{
                                    fontWeight: "bold",
                                    color: "teal",
                                  }}
                                >
                                  {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                  {d.PeriodTitle}
                                  {"\n"}
                                  <Title style={{ fontWeight: "normal" }}>
                                    {times[Number(d.PeriodTitle)]}
                                  </Title>
                                </Title>
                                {areGradesShowed ? (
                                  <>
                                    {d.CurrentMarkAndScore != "" ? (
                                      <Paragraph>
                                        {d.CurrentMarkAndScore}
                                        {"\n"}
                                        Last updated: {d.LastUpdated}
                                      </Paragraph>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Card.Content>
                            </Card>
                          );
                        }
                      }
                    }
                    break;
                  }
                  case 4: {
                    const times = [
                      "",
                      "",
                      "8:30 AM - 9:55 AM",
                      "",
                      "10:40 AM - 12:05 PM",
                      "",
                      "12:45 PM - 2:10 PM",
                      "",
                      "2:15 PM - 3:40 PM",
                    ];
                    const hr = new Date().getHours(),
                      min = new Date().getMinutes();
                    const chokepoints = [
                      [10, 25],
                      [9, 55],
                      [10, 35],
                      [12, 5],
                      [12, 40],
                      [14, 10],
                      [0, 0],
                      [15, 40],
                    ];
                    if (Number(d.PeriodTitle) % 2 == 1) {
                      if (Number(d.PeriodTitle) == 1) {
                        return (
                          <>
                            {hr < chokepoints[1][0] ||
                            (hr == chokepoints[1][0] &&
                              min < chokepoints[1][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 600}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle) + 1]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[0][0] ||
                            (hr == chokepoints[0][0] &&
                              min < chokepoints[0][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 630}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Flex Time -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      10:00 AM - 10:25 AM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[3][0] ||
                            (hr == chokepoints[3][0] &&
                              min < chokepoints[3][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 660}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Break -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      10:25 AM - 10:35 AM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 3) {
                        return (
                          <>
                            {hr < chokepoints[3][0] ||
                            (hr == chokepoints[3][0] &&
                              min < chokepoints[3][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 690}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle) + 1]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[5][0] ||
                            (hr == chokepoints[5][0] &&
                              min < chokepoints[5][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 720}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Lunch -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      12:05 PM - 12:40 PM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else {
                        if (
                          hr < chokepoints[Number(d.PeriodTitle)][0] ||
                          (hr == chokepoints[Number(d.PeriodTitle)][0] &&
                            min < chokepoints[Number(d.PeriodTitle)][1])
                        ) {
                          return (
                            <Card
                              style={{
                                marginLeft: 15,
                                marginRight: 15,
                                marginTop: 10,
                                borderRadius: 10,
                              }}
                              key={index + 750}
                            >
                              <Card.Content>
                                <Title
                                  style={{
                                    fontWeight: "bold",
                                    color: "teal",
                                  }}
                                >
                                  {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                  {d.PeriodTitle}
                                  {"\n"}
                                  <Title style={{ fontWeight: "normal" }}>
                                    {times[Number(d.PeriodTitle) + 1]}
                                  </Title>
                                </Title>
                                {areGradesShowed ? (
                                  <>
                                    {d.CurrentMarkAndScore != "" ? (
                                      <Paragraph>
                                        {d.CurrentMarkAndScore}
                                        {"\n"}
                                        Last updated: {d.LastUpdated}
                                      </Paragraph>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Card.Content>
                            </Card>
                          );
                        }
                      }
                    }
                    break;
                  }
                  case 7: {
                    const times = [
                      "",
                      "",
                      "8:30 AM - 9:55 AM",
                      "",
                      "10:40 AM - 12:05 PM",
                      "",
                      "12:45 PM - 2:10 PM",
                      "",
                      "2:15 PM - 3:40 PM",
                    ];
                    const hr = new Date().getHours(),
                      min = new Date().getMinutes();
                    const chokepoints = [
                      [10, 25],
                      [9, 55],
                      [10, 35],
                      [12, 5],
                      [12, 40],
                      [14, 10],
                      [0, 0],
                      [15, 40],
                    ];
                    if (Number(d.PeriodTitle) % 2 == 1) {
                      if (Number(d.PeriodTitle) == 1) {
                        return (
                          <>
                            {hr < chokepoints[1][0] ||
                            (hr == chokepoints[1][0] &&
                              min < chokepoints[1][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 780}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle) + 1]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[0][0] ||
                            (hr == chokepoints[0][0] &&
                              min < chokepoints[0][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 810}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                      fontSize: 16,
                                    }}
                                  >
                                    Advisement -{" "}
                                    {
                                      account.classes.find(
                                        (de) => de.PeriodTitle == "TA"
                                      ).RoomNumber
                                    }{" "}
                                    - 10:00 AM - 10:25 AM
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[3][0] ||
                            (hr == chokepoints[3][0] &&
                              min < chokepoints[3][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 840}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Break -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      10:25 AM - 10:35 AM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 3) {
                        return (
                          <>
                            {hr < chokepoints[3][0] ||
                            (hr == chokepoints[3][0] &&
                              min < chokepoints[3][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 870}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle) + 1]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[5][0] ||
                            (hr == chokepoints[5][0] &&
                              min < chokepoints[5][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 900}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Lunch -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      12:05 PM - 12:40 PM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else {
                        if (
                          hr < chokepoints[Number(d.PeriodTitle)][0] ||
                          (hr == chokepoints[Number(d.PeriodTitle)][0] &&
                            min < chokepoints[Number(d.PeriodTitle)][1])
                        ) {
                          return (
                            <Card
                              style={{
                                marginLeft: 15,
                                marginRight: 15,
                                marginTop: 10,
                                borderRadius: 10,
                              }}
                              key={index + 930}
                            >
                              <Card.Content>
                                <Title
                                  style={{
                                    fontWeight: "bold",
                                    color: "teal",
                                  }}
                                >
                                  {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                  {d.PeriodTitle}
                                  {"\n"}
                                  <Title style={{ fontWeight: "normal" }}>
                                    {times[Number(d.PeriodTitle) + 1]}
                                  </Title>
                                </Title>
                                {areGradesShowed ? (
                                  <>
                                    {d.CurrentMarkAndScore != "" ? (
                                      <Paragraph>
                                        {d.CurrentMarkAndScore}
                                        {"\n"}
                                        Last updated: {d.LastUpdated}
                                      </Paragraph>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Card.Content>
                            </Card>
                          );
                        }
                      }
                    }
                    break;
                  }
                  case 8: {
                    const times = [
                      "",
                      "",
                      "8:30 AM - 9:55 AM",
                      "",
                      "10:40 AM - 12:05 PM",
                      "",
                      "12:45 PM - 2:10 PM",
                      "",
                      "2:15 PM - 3:40 PM",
                    ];
                    const hr = new Date().getHours(),
                      min = new Date().getMinutes();
                    const chokepoints = [
                      [10, 25],
                      [0, 0],
                      [9, 55],
                      [10, 35],
                      [12, 5],
                      [12, 40],
                      [14, 10],
                      [0, 0],
                      [15, 40],
                    ];
                    if (Number(d.PeriodTitle) % 2 == 0) {
                      if (Number(d.PeriodTitle) == 2) {
                        return (
                          <>
                            {hr < chokepoints[2][0] ||
                            (hr == chokepoints[2][0] &&
                              min < chokepoints[2][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 960}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle)]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[0][0] ||
                            (hr == chokepoints[0][0] &&
                              min < chokepoints[0][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 990}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                      fontSize: 16,
                                    }}
                                  >
                                    Advisement -{" "}
                                    {
                                      account.classes.find(
                                        (de) => de.PeriodTitle == "TA"
                                      ).RoomNumber
                                    }{" "}
                                    - 10:00 AM - 10:25 AM
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[3][0] ||
                            (hr == chokepoints[3][0] &&
                              min < chokepoints[3][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1020}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Break -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      10:25 AM - 10:35 AM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 4) {
                        return (
                          <>
                            {hr < chokepoints[4][0] ||
                            (hr == chokepoints[4][0] &&
                              min < chokepoints[4][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1050}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle)]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[5][0] ||
                            (hr == chokepoints[5][0] &&
                              min < chokepoints[5][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1080}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Lunch -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      12:05 PM - 12:40 PM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else {
                        if (
                          hr < chokepoints[Number(d.PeriodTitle)][0] ||
                          (hr == chokepoints[Number(d.PeriodTitle)][0] &&
                            min < chokepoints[Number(d.PeriodTitle)][1])
                        ) {
                          return (
                            <Card
                              style={{
                                marginLeft: 15,
                                marginRight: 15,
                                marginTop: 10,
                                borderRadius: 10,
                              }}
                              key={index + 1110}
                            >
                              <Card.Content>
                                <Title
                                  style={{
                                    fontWeight: "bold",
                                    color: "teal",
                                  }}
                                >
                                  {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                  {d.PeriodTitle}
                                  {"\n"}
                                  <Title style={{ fontWeight: "normal" }}>
                                    {times[Number(d.PeriodTitle)]}
                                  </Title>
                                </Title>
                                {areGradesShowed ? (
                                  <>
                                    {d.CurrentMarkAndScore != "" ? (
                                      <Paragraph>
                                        {d.CurrentMarkAndScore}
                                        {"\n"}
                                        Last updated: {d.LastUpdated}
                                      </Paragraph>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Card.Content>
                            </Card>
                          );
                        }
                      }
                    }
                    break;
                  }
                  case 5: {
                    const times = [
                      "",
                      "",
                      "9:00 AM - 10:25 AM",
                      "",
                      "10:40 AM - 12:05 PM",
                      "",
                      "12:45 PM - 2:10 PM",
                      "",
                      "2:15 PM - 3:40 PM",
                    ];
                    const hr = new Date().getHours(),
                      min = new Date().getMinutes();
                    const chokepoints = [
                      [0, 0],
                      [0, 0],
                      [10, 25],
                      [10, 35],
                      [12, 5],
                      [12, 40],
                      [14, 10],
                      [0, 0],
                      [15, 40],
                    ];
                    if (Number(d.PeriodTitle) % 2 == 0) {
                      if (Number(d.PeriodTitle) == 2) {
                        return (
                          <>
                            {hr < chokepoints[2][0] ||
                            (hr == chokepoints[2][0] &&
                              min < chokepoints[2][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1140}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle)]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[3][0] ||
                            (hr == chokepoints[3][0] &&
                              min < chokepoints[3][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1170}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Break -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      10:25 AM - 10:35 AM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 4) {
                        return (
                          <>
                            {hr < chokepoints[4][0] ||
                            (hr == chokepoints[4][0] &&
                              min < chokepoints[4][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1200}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle)]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[5][0] ||
                            (hr == chokepoints[5][0] &&
                              min < chokepoints[5][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1230}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Lunch -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      12:05 PM - 12:40 PM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else {
                        if (
                          hr < chokepoints[Number(d.PeriodTitle)][0] ||
                          (hr == chokepoints[Number(d.PeriodTitle)][0] &&
                            min < chokepoints[Number(d.PeriodTitle)][1])
                        ) {
                          return (
                            <Card
                              style={{
                                marginLeft: 15,
                                marginRight: 15,
                                marginTop: 10,
                                borderRadius: 10,
                              }}
                              key={index + 1260}
                            >
                              <Card.Content>
                                <Title
                                  style={{
                                    fontWeight: "bold",
                                    color: "teal",
                                  }}
                                >
                                  {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                  {d.PeriodTitle}
                                  {"\n"}
                                  <Title style={{ fontWeight: "normal" }}>
                                    {times[Number(d.PeriodTitle)]}
                                  </Title>
                                </Title>
                                {areGradesShowed ? (
                                  <>
                                    {d.CurrentMarkAndScore != "" ? (
                                      <Paragraph>
                                        {d.CurrentMarkAndScore}
                                        {"\n"}
                                        Last updated: {d.LastUpdated}
                                      </Paragraph>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Card.Content>
                            </Card>
                          );
                        }
                      }
                    }
                    break;
                  }
                  case 6: {
                    const times = [
                      "",
                      "",
                      "9:00 AM - 10:25 AM",
                      "",
                      "10:40 AM - 12:05 PM",
                      "",
                      "12:45 PM - 2:10 PM",
                      "",
                      "2:15 PM - 3:40 PM",
                    ];
                    const hr = new Date().getHours(),
                      min = new Date().getMinutes();
                    const chokepoints = [
                      [0, 0],
                      [10, 25],
                      [10, 35],
                      [12, 5],
                      [12, 40],
                      [14, 10],
                      [0, 0],
                      [15, 40],
                    ];
                    if (Number(d.PeriodTitle) % 2 == 1) {
                      if (Number(d.PeriodTitle) == 1) {
                        return (
                          <>
                            {hr < chokepoints[1][0] ||
                            (hr == chokepoints[1][0] &&
                              min < chokepoints[1][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1290}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle) + 1]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[2][0] ||
                            (hr == chokepoints[2][0] &&
                              min < chokepoints[2][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1320}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Break -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      10:25 AM - 10:35 AM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 3) {
                        return (
                          <>
                            {hr < chokepoints[3][0] ||
                            (hr == chokepoints[3][0] &&
                              min < chokepoints[3][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1350}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle) + 1]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[4][0] ||
                            (hr == chokepoints[4][0] &&
                              min < chokepoints[4][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1380}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Lunch -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      12:05 PM - 12:40 PM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else {
                        if (
                          hr < chokepoints[Number(d.PeriodTitle)][0] ||
                          (hr == chokepoints[Number(d.PeriodTitle)][0] &&
                            min < chokepoints[Number(d.PeriodTitle)][1])
                        ) {
                          return (
                            <Card
                              style={{
                                marginLeft: 15,
                                marginRight: 15,
                                marginTop: 10,
                                borderRadius: 10,
                              }}
                              key={index + 1410}
                            >
                              <Card.Content>
                                <Title
                                  style={{
                                    fontWeight: "bold",
                                    color: "teal",
                                  }}
                                >
                                  {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                  {d.PeriodTitle}
                                  {"\n"}
                                  <Title style={{ fontWeight: "normal" }}>
                                    {times[Number(d.PeriodTitle) + 1]}
                                  </Title>
                                </Title>
                                {areGradesShowed ? (
                                  <>
                                    {d.CurrentMarkAndScore != "" ? (
                                      <Paragraph>
                                        {d.CurrentMarkAndScore}
                                        {"\n"}
                                        Last updated: {d.LastUpdated}
                                      </Paragraph>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Card.Content>
                            </Card>
                          );
                        }
                      }
                    }
                    break;
                  }
                  case 9: {
                    const times = [
                      "",
                      "",
                      "8:30 AM - 9:30 AM",
                      "",
                      "9:35 AM - 10:35 AM",
                      "",
                      "10:50 AM - 11:50 AM",
                      "",
                      "11:55 AM - 12:55 PM",
                    ];
                    const hr = new Date().getHours(),
                      min = new Date().getMinutes();
                    const chokepoints = [
                      [0, 0],
                      [0, 0],
                      [9, 30],
                      [10, 5],
                      [10, 35],
                      [10, 45],
                      [11, 50],
                      [0, 0],
                      [12, 55],
                    ];
                    if (
                      Number(d.PeriodTitle) > 0 &&
                      Number(d.PeriodTitle) < 9 &&
                      Number(d.PeriodTitle) % 2 == 0
                    ) {
                      if (Number(d.PeriodTitle) == 4) {
                        return (
                          <>
                            {hr < chokepoints[4][0] ||
                            (hr == chokepoints[4][0] &&
                              min < chokepoints[4][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1440}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle)]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[5][0] ||
                            (hr == chokepoints[5][0] &&
                              min < chokepoints[5][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1470}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Break -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      10:35 AM - 10:45 AM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else {
                        if (
                          hr < chokepoints[Number(d.PeriodTitle)][0] ||
                          (hr == chokepoints[Number(d.PeriodTitle)][0] &&
                            min < chokepoints[Number(d.PeriodTitle)][1])
                        ) {
                          return (
                            <Card
                              style={{
                                marginLeft: 15,
                                marginRight: 15,
                                marginTop: 10,
                                borderRadius: 10,
                              }}
                              key={index + 1500}
                            >
                              <Card.Content>
                                <Title
                                  style={{
                                    fontWeight: "bold",
                                    color: "teal",
                                  }}
                                >
                                  {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                  {d.PeriodTitle}
                                  {"\n"}
                                  <Title style={{ fontWeight: "normal" }}>
                                    {times[Number(d.PeriodTitle)]}
                                  </Title>
                                </Title>
                                {areGradesShowed ? (
                                  <>
                                    {d.CurrentMarkAndScore != "" ? (
                                      <Paragraph>
                                        {d.CurrentMarkAndScore}
                                        {"\n"}
                                        Last updated: {d.LastUpdated}
                                      </Paragraph>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Card.Content>
                            </Card>
                          );
                        }
                      }
                    }
                    break;
                  }
                  case 10: {
                    const times = [
                      "",
                      "",
                      "8:30 AM - 9:30 AM",
                      "",
                      "9:35 AM - 10:35 AM",
                      "",
                      "10:50 AM - 11:50 AM",
                      "",
                      "11:55 AM - 12:55 PM",
                    ];
                    const hr = new Date().getHours(),
                      min = new Date().getMinutes();
                    const chokepoints = [
                      [0, 0],
                      [0, 0],
                      [9, 30],
                      [10, 5],
                      [10, 35],
                      [10, 45],
                      [11, 50],
                      [0, 0],
                      [12, 55],
                    ];
                    if (
                      Number(d.PeriodTitle) > 0 &&
                      Number(d.PeriodTitle) < 9 &&
                      Number(d.PeriodTitle) % 2 == 1
                    ) {
                      if (Number(d.PeriodTitle) == 3) {
                        return (
                          <>
                            {hr < chokepoints[4][0] ||
                            (hr == chokepoints[4][0] &&
                              min < chokepoints[4][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1530}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      fontWeight: "bold",
                                      color: "teal",
                                    }}
                                  >
                                    {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                    {d.PeriodTitle}
                                    {"\n"}
                                    <Title style={{ fontWeight: "normal" }}>
                                      {times[Number(d.PeriodTitle) + 1]}
                                    </Title>
                                  </Title>
                                  {areGradesShowed ? (
                                    <>
                                      {d.CurrentMarkAndScore != "" ? (
                                        <Paragraph>
                                          {d.CurrentMarkAndScore}
                                          {"\n"}
                                          Last updated: {d.LastUpdated}
                                        </Paragraph>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                            {hr < chokepoints[5][0] ||
                            (hr == chokepoints[5][0] &&
                              min < chokepoints[5][1]) ? (
                              <Card
                                style={{
                                  marginLeft: 15,
                                  marginRight: 15,
                                  marginTop: 10,
                                  borderRadius: 10,
                                }}
                                key={index + 1560}
                              >
                                <Card.Content>
                                  <Title
                                    style={{
                                      textAlign: "center",
                                    }}
                                  >
                                    Break -{" "}
                                    <Title
                                      style={{
                                        fontWeight: "normal",
                                      }}
                                    >
                                      10:35 AM - 10:45 AM
                                    </Title>
                                  </Title>
                                </Card.Content>
                              </Card>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      } else {
                        if (
                          hr < chokepoints[Number(d.PeriodTitle)][0] ||
                          (hr == chokepoints[Number(d.PeriodTitle)][0] &&
                            min < chokepoints[Number(d.PeriodTitle)][1])
                        ) {
                          return (
                            <Card
                              style={{
                                marginLeft: 15,
                                marginRight: 15,
                                marginTop: 10,
                                borderRadius: 10,
                              }}
                              key={index + 1590}
                            >
                              <Card.Content>
                                <Title
                                  style={{
                                    fontWeight: "bold",
                                    color: "teal",
                                  }}
                                >
                                  {d.CourseName} - Room {d.RoomNumber} - Per{" "}
                                  {d.PeriodTitle}
                                  {"\n"}
                                  <Title style={{ fontWeight: "normal" }}>
                                    {times[Number(d.PeriodTitle) + 1]}
                                  </Title>
                                </Title>
                                {areGradesShowed ? (
                                  <>
                                    {d.CurrentMarkAndScore != "" ? (
                                      <Paragraph>
                                        {d.CurrentMarkAndScore}
                                        {"\n"}
                                        Last updated: {d.LastUpdated}
                                      </Paragraph>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                ) : (
                                  <></>
                                )}
                              </Card.Content>
                            </Card>
                          );
                        }
                      }
                    }
                    break;
                  }
                }
              })}
              <Card
                style={{
                  marginLeft: 15,
                  marginRight: 15,
                  marginTop: 10,
                  marginBottom: 10,
                  borderRadius: 10,
                }}
              >
                <Card.Content>
                  <Title style={{ fontWeight: "bold", color: "teal" }}>
                    End of day!
                  </Title>
                  <Paragraph>
                    Take a rest...you've earned it! See you tomorrow.
                  </Paragraph>
                </Card.Content>
              </Card>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "begin",
                  marginLeft: "5%",
                  marginTop: 10,
                  marginBottom: 50,
                }}
              >
                <Switch
                  value={areGradesShowed}
                  onValueChange={async () => {
                    if (areGradesShowed) {
                      await SecureStore.setItemAsync("gradesShowed", "false");
                    } else {
                      await SecureStore.setItemAsync("gradesShowed", "true");
                    }
                    switchGradesShowed(!areGradesShowed);
                  }}
                />
                <Text
                  style={{
                    alignSelf: "center",
                    marginLeft: 10,
                    color: "teal",
                  }}
                >
                  Turn grades on/off
                  {areGradesShowed ? (
                    <Text
                      style={{
                        marginBottom: 10,
                        fontWeight: "bold",
                        color: "teal",
                      }}
                    >
                      {"\n"}Grades updated{" "}
                      {new Date(account.lastUpdatedGrades).toLocaleDateString(
                        "en-us",
                        {
                          day: "numeric",
                          month: "2-digit",
                        }
                      )}
                      .
                    </Text>
                  ) : (
                    <></>
                  )}
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </>
      );
    }
  }
}

const Tab = createBottomTabNavigator();

export default function OnlineHomePage({ navigation }) {
  const [bgColor, setBGColor] = useState("");
  useEffect(() => {
    const hi = async () =>
      setBGColor(await SecureStore.getItemAsync("bgColor"));
    hi();
  }, []);
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: bgColor,
    },
    topContainer: {
      flex: 1,
      backgroundColor: bgColor,
      alignItems: "center",
      justifyContent: "center",
    },
    tinyLogo: {
      width: 338.7 / 3,
      height: 142.5 / 3,
      marginBottom: 10,
    },
  });

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            paddingTop: 7,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderLeftWidth: 0.2,
            borderRightWidth: 0.2,
            position: "absolute",
            overflow: "hidden",
          },
        }}
        initialRouteName="Home"
      >
        <Tab.Screen
          name="Sporting Events"
          options={{
            tabBarShowLabel: false,
            headerShadowVisible: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="trophy" color={color} size={size} />
            ),
            lazy: false,
          }}
          component={ClubScreen}
        />
        <Tab.Screen
          name="Calendar"
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="calendar-account"
                color={color}
                size={size}
              />
            ),
            lazy: false,
          }}
          component={CalendarScreen}
        />
        <Tab.Screen
          options={{
            headerTitle: (props) => (
              <Image
                style={styles.tinyLogo}
                source={require("../assets/Man.png")}
              />
            ),
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: bgColor,
            },
            tabBarShowLabel: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="school" color={color} size={size} />
            ),
            lazy: false,
          }}
          name="Home"
          component={HomeScreen}
        />
        <Tab.Screen
          name="Flextime"
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="clipboard-text-clock-outline"
                color={color}
                size={size}
              />
            ),
          }}
          component={LocationScreen}
        />
        <Tab.Screen
          name="My Bookmarks"
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="bookmark-multiple"
                color={color}
                size={size}
              />
            ),
            lazy: false,
          }}
          component={ChatScreen}
        />
      </Tab.Navigator>
    </>
  );
}
