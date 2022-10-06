import {
  setStatusBarNetworkActivityIndicatorVisible,
  StatusBar,
} from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";
import { Button, Text, Card, Title, Paragraph } from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { IMPORTEDB64 } from "./importedURI";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import greetingTime from "greeting-time";
import CalendarScreen from "./CalendarScreen.js";
import ChatScreen from "./ChatScreen.js";
import LocationScreen from "./LocationScreen.js";
import ClubScreen from "./ClubScreen.js";

function HomeScreen() {
  const [account, setAccount] = useState({});
  const [calendar, setCalendar] = useState([]);
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
    };
    hi();
  }, [account || calendar]);
  if (Object.keys(account).length == 0 || calendar.length == 0) {
    return (
      <View style={styles.topContainer}>
        <Text>Loading, please wait...</Text>
      </View>
    );
  } else {
    return (
      <>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#e6fef9" }}>
          <View style={{ backgroundColor: "#e6fef9" }}>
            <View style={{ alignItems: "center", margin: 15 }}>
              <Image
                style={styles.tinyLogo}
                source={{
                  uri: "data:image/png;base64," + IMPORTEDB64,
                }}
              />
            </View>
            <Text style={{ marginLeft: 10 }} variant="headlineLarge">
              {greetingTime(new Date())},{" "}
              <Text style={{ fontWeight: "bold" }}>
                {account.name.split(" ")[0]}
              </Text>
              !
            </Text>
            <Text style={{ marginLeft: 10, marginBottom: 10 }}>
              Take a look at your schedule for today.
            </Text>
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
                          <Title style={{ fontWeight: "bold" }}>Break!</Title>
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
                    "10:10 AM - 12:05 PM (Rally)",
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
                            key={index + 60}
                          >
                            <Card.Content>
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle)]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                            key={index + 90}
                          >
                            <Card.Content>
                              <Title>
                                Break -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                            key={index + 90}
                          >
                            <Card.Content>
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle)]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Lunch -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                          key={index + 150}
                        >
                          <Card.Content>
                            <Title style={{ fontWeight: "bold" }}>
                              {d.CourseName} - Room {d.RoomNumber} - P
                              {d.PeriodTitle}
                              {"\n"}
                              <Title style={{ fontWeight: "normal" }}>
                                {times[Number(d.PeriodTitle)]}
                              </Title>
                            </Title>
                            {d.CurrentMarkAndScore != "" ? (
                              <Paragraph>
                                {d.CurrentMarkAndScore}
                                {"\n"}
                                Last updated: {d.LastUpdated}
                              </Paragraph>
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
                    "10:10 AM - 12:05 PM (Rally)",
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
                            key={index + 180}
                          >
                            <Card.Content>
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle) + 1]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Break -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle) + 1]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Lunch -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                          key={index + 300}
                        >
                          <Card.Content>
                            <Title style={{ fontWeight: "bold" }}>
                              {d.CourseName} - Room {d.RoomNumber} - P
                              {d.PeriodTitle}
                              {"\n"}
                              <Title style={{ fontWeight: "normal" }}>
                                {times[Number(d.PeriodTitle) + 1]}
                              </Title>
                            </Title>
                            {d.CurrentMarkAndScore != "" ? (
                              <Paragraph>
                                {d.CurrentMarkAndScore}
                                {"\n"}
                                Last updated: {d.LastUpdated}
                              </Paragraph>
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
                  if (Number(d.PeriodTitle) > 0 && Number(d.PeriodTitle) < 9) {
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle) - 1]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Break -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                            <Title style={{ fontWeight: "bold" }}>
                              {d.CourseName} - Room {d.RoomNumber} - P
                              {d.PeriodTitle}
                              {"\n"}
                              <Title style={{ fontWeight: "normal" }}>
                                {times[Number(d.PeriodTitle) - 1]}
                              </Title>
                            </Title>
                            {d.CurrentMarkAndScore != "" ? (
                              <Paragraph>
                                {d.CurrentMarkAndScore}
                                {"\n"}
                                Last updated: {d.LastUpdated}
                              </Paragraph>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle)]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Flex Time -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                              <Title>
                                Break -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle)]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Lunch -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                            <Title style={{ fontWeight: "bold" }}>
                              {d.CourseName} - Room {d.RoomNumber} - P
                              {d.PeriodTitle}
                              {"\n"}
                              <Title style={{ fontWeight: "normal" }}>
                                {times[Number(d.PeriodTitle)]}
                              </Title>
                            </Title>
                            {d.CurrentMarkAndScore != "" ? (
                              <Paragraph>
                                {d.CurrentMarkAndScore}
                                {"\n"}
                                Last updated: {d.LastUpdated}
                              </Paragraph>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle) + 1]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Flex Time -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                              <Title>
                                Break -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle) + 1]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Lunch -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                            <Title style={{ fontWeight: "bold" }}>
                              {d.CourseName} - Room {d.RoomNumber} - P
                              {d.PeriodTitle}
                              {"\n"}
                              <Title style={{ fontWeight: "normal" }}>
                                {times[Number(d.PeriodTitle) + 1]}
                              </Title>
                            </Title>
                            {d.CurrentMarkAndScore != "" ? (
                              <Paragraph>
                                {d.CurrentMarkAndScore}
                                {"\n"}
                                Last updated: {d.LastUpdated}
                              </Paragraph>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle) + 1]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Advisement -{" "}
                                {
                                  account.classes.find(
                                    (de) => de.PeriodTitle == "TA"
                                  ).RoomNumber
                                }
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
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
                            key={index + 840}
                          >
                            <Card.Content>
                              <Title>
                                Break -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle) + 1]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Lunch -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                            <Title style={{ fontWeight: "bold" }}>
                              {d.CourseName} - Room {d.RoomNumber} - P
                              {d.PeriodTitle}
                              {"\n"}
                              <Title style={{ fontWeight: "normal" }}>
                                {times[Number(d.PeriodTitle) + 1]}
                              </Title>
                            </Title>
                            {d.CurrentMarkAndScore != "" ? (
                              <Paragraph>
                                {d.CurrentMarkAndScore}
                                {"\n"}
                                Last updated: {d.LastUpdated}
                              </Paragraph>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle)]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Advisement -{" "}
                                {
                                  account.classes.find(
                                    (de) => de.PeriodTitle == "TA"
                                  ).RoomNumber
                                }
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
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
                            key={index + 1020}
                          >
                            <Card.Content>
                              <Title>
                                Break -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle)]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Lunch -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                            <Title style={{ fontWeight: "bold" }}>
                              {d.CourseName} - Room {d.RoomNumber} - P
                              {d.PeriodTitle}
                              {"\n"}
                              <Title style={{ fontWeight: "normal" }}>
                                {times[Number(d.PeriodTitle)]}
                              </Title>
                            </Title>
                            {d.CurrentMarkAndScore != "" ? (
                              <Paragraph>
                                {d.CurrentMarkAndScore}
                                {"\n"}
                                Last updated: {d.LastUpdated}
                              </Paragraph>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle)]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Break -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle)]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Lunch -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                            <Title style={{ fontWeight: "bold" }}>
                              {d.CourseName} - Room {d.RoomNumber} - P
                              {d.PeriodTitle}
                              {"\n"}
                              <Title style={{ fontWeight: "normal" }}>
                                {times[Number(d.PeriodTitle)]}
                              </Title>
                            </Title>
                            {d.CurrentMarkAndScore != "" ? (
                              <Paragraph>
                                {d.CurrentMarkAndScore}
                                {"\n"}
                                Last updated: {d.LastUpdated}
                              </Paragraph>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle) + 1]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Break -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle) + 1]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Lunch -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                            <Title style={{ fontWeight: "bold" }}>
                              {d.CourseName} - Room {d.RoomNumber} - P
                              {d.PeriodTitle}
                              {"\n"}
                              <Title style={{ fontWeight: "normal" }}>
                                {times[Number(d.PeriodTitle) + 1]}
                              </Title>
                            </Title>
                            {d.CurrentMarkAndScore != "" ? (
                              <Paragraph>
                                {d.CurrentMarkAndScore}
                                {"\n"}
                                Last updated: {d.LastUpdated}
                              </Paragraph>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle)]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Break -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                            <Title style={{ fontWeight: "bold" }}>
                              {d.CourseName} - Room {d.RoomNumber} - P
                              {d.PeriodTitle}
                              {"\n"}
                              <Title style={{ fontWeight: "normal" }}>
                                {times[Number(d.PeriodTitle)]}
                              </Title>
                            </Title>
                            {d.CurrentMarkAndScore != "" ? (
                              <Paragraph>
                                {d.CurrentMarkAndScore}
                                {"\n"}
                                Last updated: {d.LastUpdated}
                              </Paragraph>
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
                              <Title style={{ fontWeight: "bold" }}>
                                {d.CourseName} - Room {d.RoomNumber} - P
                                {d.PeriodTitle}
                                {"\n"}
                                <Title style={{ fontWeight: "normal" }}>
                                  {times[Number(d.PeriodTitle) + 1]}
                                </Title>
                              </Title>
                              {d.CurrentMarkAndScore != "" ? (
                                <Paragraph>
                                  {d.CurrentMarkAndScore}
                                  {"\n"}
                                  Last updated: {d.LastUpdated}
                                </Paragraph>
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
                              <Title>
                                Break -{" "}
                                <Title style={{ fontWeight: "normal" }}>
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
                            <Title style={{ fontWeight: "bold" }}>
                              {d.CourseName} - Room {d.RoomNumber} - P
                              {d.PeriodTitle}
                              {"\n"}
                              <Title style={{ fontWeight: "normal" }}>
                                {times[Number(d.PeriodTitle) + 1]}
                              </Title>
                            </Title>
                            {d.CurrentMarkAndScore != "" ? (
                              <Paragraph>
                                {d.CurrentMarkAndScore}
                                {"\n"}
                                Last updated: {d.LastUpdated}
                              </Paragraph>
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
              style={{ textAlign: "center", marginTop: 10, marginBottom: 10 }}
            >
              No more classes today!
            </Text>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}

const Tab = createBottomTabNavigator();

export default function OnlineHomePage({ navigation }) {
  return (
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
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="bookmark-box-multiple"
              color={color}
              size={size}
            />
          ),
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
          headerShown: false,
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
        name="Location"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="map-marker"
              color={color}
              size={size}
            />
          ),
          lazy: false,
        }}
        component={LocationScreen}
      />
      <Tab.Screen
        name="Global Chat"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="forum" color={color} size={size} />
          ),
          lazy: false,
        }}
        component={ChatScreen}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6fef9",
  },
  topContainer: {
    flex: 1,
    backgroundColor: "#e5f6df",
    alignItems: "center",
    justifyContent: "center",
  },
  tinyLogo: {
    width: 338.7 / 2,
    height: 142.5 / 2,
  },
});
