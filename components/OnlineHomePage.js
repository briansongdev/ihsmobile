import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { Buffer } from "buffer";
import * as Haptics from "expo-haptics";
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
} from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { IMPORTEDB64 } from "../importedURI";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import greetingTime from "greeting-time";
import CalendarScreen from "./CalendarScreen.js";
import ChatScreen from "./BookmarkScreen.js";
import LocationScreen from "./FlexTimeScreen.js";
import ClubScreen from "./ClubScreen.js";
import * as LocalAuthentication from "expo-local-authentication";

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

  useEffect(() => {
    const hi = async () => {
      if (Object.keys(account).length == 0 || calendar.length == 0) {
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
                "https://barcodeapi.org/api/39/" +
                  (await SecureStore.getItemAsync("uid"))
              );
            } else {
              await SecureStore.deleteItemAsync("isLocal");
              await SecureStore.deleteItemAsync("bearer");
              await SecureStore.deleteItemAsync("classes");
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
            setCalendar(res.data.calendar);
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
            icon="card-account-details-outline"
            iconColor="teal"
            size={30}
            onPress={async () => {
              if (
                (
                  await LocalAuthentication.authenticateAsync({
                    promptMessage:
                      "Authentication is required for you to conveniently and privately access sensitive information.",
                  })
                ).success == true
              ) {
                setIDvisible(true);
              }
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
  }, [account, calendar, areGradesShowed]);
  if (Object.keys(account).length == 0 || calendar.length == 0) {
    return (
      <View style={styles.topContainer}>
        <ActivityIndicator animating={true} color="green" />
      </View>
    );
  } else {
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
                  <ActivityIndicator animating={true} color="green" />
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
        </>
      );
    } else {
      return (
        <>
          <Portal>
            <Dialog visible={idVisible} dismissable={false}>
              <Dialog.Title>
                <Text style={{ fontWeight: "bold" }} variant="displayMedium">
                  {account.name}
                </Text>
              </Dialog.Title>
              <Dialog.Content>
                <Text variant="headlineMedium" style={{ marginTop: -20 }}>
                  Grade {account.currentGrade}
                </Text>

                <Text>
                  <Text style={{ fontWeight: "bold" }}>{"\n"}Personal ID:</Text>{" "}
                  {uid} {"\n"}
                  <Text style={{ fontWeight: "bold" }}>ID Card:</Text>
                </Text>

                <View style={{ alignItems: "center" }}>
                  <Image
                    style={{ height: 130, width: 400, margin: 10 }}
                    source={{
                      uri: relevantURI,
                    }}
                  />
                  <Paragraph>
                    Please note, the QR code is only another form of
                    identification, and it cannot be scanned with a physical
                    scanner (i.e. for flextime check-ins).
                  </Paragraph>
                </View>
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  textColor="green"
                  onPress={async () => {
                    setIDvisible(false);
                  }}
                >
                  Done
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
          <SafeAreaView style={{ flex: 1, backgroundColor: "#e6fef9" }}>
            <View style={{ backgroundColor: "#e6fef9" }}>
              <Text
                style={{ marginLeft: 10, textAlign: "center" }}
                variant="headlineLarge"
              >
                {greetingTime(new Date())},{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {account.name.split(" ")[0]}
                </Text>
                !
              </Text>
              <Text
                style={{
                  marginLeft: 10,
                  marginBottom: 10,
                  textAlign: "center",
                }}
                variant="labelMedium"
              >
                Here's today's schedule,{" "}
                <Text style={{ fontWeight: "bold", color: "teal" }}>
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                .
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "begin",
                  marginLeft: "5%",
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
                  }}
                >
                  Show my class grades
                </Text>
              </View>
            </View>
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
                              Enjoy your day off!{"\n\n"}(Make sure to check the
                              website for "special" days, like PSAT testing and
                              the finals schedule. These may not accurately
                              reflect in your IHS Mobile schedule.)
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
                    if (Number(d.PeriodTitle) % 2 == 0) {
                      if (Number(d.PeriodTitle) == 2) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Break -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    9:55 AM - 10:05 AM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 4) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Lunch -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    12:25 PM - 1:00 PM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else {
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
                                style={{ fontWeight: "bold", color: "teal" }}
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
                    if (Number(d.PeriodTitle) % 2 == 1) {
                      if (Number(d.PeriodTitle) == 1) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Break -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    9:55 AM - 10:05 AM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 3) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Lunch -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    12:25 PM - 1:00 PM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else {
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
                                style={{ fontWeight: "bold", color: "teal" }}
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
                    if (
                      Number(d.PeriodTitle) > 0 &&
                      Number(d.PeriodTitle) < 9
                    ) {
                      if (Number(d.PeriodTitle) == 4) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Break -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    10:25 AM - 10:35 AM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else {
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
                                style={{ fontWeight: "bold", color: "teal" }}
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
                    if (Number(d.PeriodTitle) % 2 == 0) {
                      if (Number(d.PeriodTitle) == 2) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Flex Time -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    10:00 AM - 10:25 AM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Break -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    10:25 AM - 10:35 AM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 4) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Lunch -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    12:05 PM - 12:40 PM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else {
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
                                style={{ fontWeight: "bold", color: "teal" }}
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
                    if (Number(d.PeriodTitle) % 2 == 1) {
                      if (Number(d.PeriodTitle) == 1) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Flex Time -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    10:00 AM - 10:25 AM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Break -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    10:25 AM - 10:35 AM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 3) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Lunch -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    12:05 PM - 12:40 PM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else {
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
                                style={{ fontWeight: "bold", color: "teal" }}
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
                    if (Number(d.PeriodTitle) % 2 == 1) {
                      if (Number(d.PeriodTitle) == 1) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Break -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    10:25 AM - 10:35 AM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 3) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Lunch -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    12:05 PM - 12:40 PM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else {
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
                                style={{ fontWeight: "bold", color: "teal" }}
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
                    if (Number(d.PeriodTitle) % 2 == 0) {
                      if (Number(d.PeriodTitle) == 2) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Break -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    10:25 AM - 10:35 AM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 4) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Lunch -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    12:05 PM - 12:40 PM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else {
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
                                style={{ fontWeight: "bold", color: "teal" }}
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
                    if (Number(d.PeriodTitle) % 2 == 0) {
                      if (Number(d.PeriodTitle) == 2) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Break -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    10:25 AM - 10:35 AM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 4) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Lunch -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    12:05 PM - 12:40 PM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else {
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
                                style={{ fontWeight: "bold", color: "teal" }}
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
                    if (Number(d.PeriodTitle) % 2 == 1) {
                      if (Number(d.PeriodTitle) == 1) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Break -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    10:25 AM - 10:35 AM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else if (Number(d.PeriodTitle) == 3) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Lunch -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    12:05 PM - 12:40 PM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else {
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
                                style={{ fontWeight: "bold", color: "teal" }}
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
                    if (
                      Number(d.PeriodTitle) > 0 &&
                      Number(d.PeriodTitle) < 9 &&
                      Number(d.PeriodTitle) % 2 == 0
                    ) {
                      if (Number(d.PeriodTitle) == 4) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Break -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    10:35 AM - 10:45 AM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else {
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
                                style={{ fontWeight: "bold", color: "teal" }}
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
                    if (
                      Number(d.PeriodTitle) > 0 &&
                      Number(d.PeriodTitle) < 9 &&
                      Number(d.PeriodTitle) % 2 == 1
                    ) {
                      if (Number(d.PeriodTitle) == 3) {
                        return (
                          <>
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
                                  style={{ fontWeight: "bold", color: "teal" }}
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
                                  style={{ textAlign: "center", fontSize: 16 }}
                                >
                                  Break -{" "}
                                  <Title
                                    style={{
                                      fontWeight: "normal",
                                      fontSize: 16,
                                    }}
                                  >
                                    10:35 AM - 10:45 AM
                                  </Title>
                                </Title>
                              </Card.Content>
                            </Card>
                          </>
                        );
                      } else {
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
                                style={{ fontWeight: "bold", color: "teal" }}
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
                    break;
                  }
                }
              })}

              <Text
                style={{
                  textAlign: "center",
                  marginTop: 10,
                  marginBottom: 10,
                  fontWeight: "bold",
                  color: "teal",
                }}
              >
                Grades updated{" "}
                {new Date(account.lastUpdatedGrades).toLocaleDateString(
                  "en-us",
                  {
                    day: "numeric",
                    month: "2-digit",
                  }
                )}
                .
              </Text>
            </ScrollView>
          </SafeAreaView>
        </>
      );
    }
  }
}

const Tab = createBottomTabNavigator();

export default function OnlineHomePage({ navigation }) {
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
          name="Clubs"
          options={{
            tabBarShowLabel: false,
            headerShadowVisible: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account-group"
                color={color}
                size={size}
              />
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
                source={{
                  uri: "data:image/png;base64," + IMPORTEDB64,
                }}
              />
            ),
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: "#e6fef9",
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
            lazy: false,
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
    width: 338.7 / 3,
    height: 142.5 / 3,
    marginBottom: 10,
  },
});
