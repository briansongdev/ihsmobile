import { useState, useEffect, useRef, useCallback } from "react";
import * as Notifications from "expo-notifications";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  Button,
  Text,
  Card,
  IconButton,
  Paragraph,
  Portal,
  Dialog,
  ActivityIndicator,
  TextInput,
} from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import * as Haptics from "expo-haptics";
import axios from "axios";
import { Calendar } from "react-native-calendars";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import ConfettiCannon from "react-native-confetti-cannon";
import * as Device from "expo-device";
import { useFocusEffect } from "@react-navigation/native";

const workout = { key: "workout", color: "green" };
const vacation = { key: "vacation", color: "red", selectedDotColor: "blue" };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}
export default function CalendarScreen({ navigation }) {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const [schedule, setSchedule] = useState();
  const [currSelectedDate, setCurrSelectedDate] = useState(new Date());
  const [currYear, setCurrYear] = useState();
  const [markedDates, setMarkedDates] = useState({});
  const [firstTime, setFirst] = useState(true);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [shoot, setShoot] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [bell, setBell] = useState(false);
  const [notisOn, setNotis] = useState(false);
  const [datete, setDatete] = useState(
    new Date(
      new Date(currSelectedDate).setHours(
        new Date(currSelectedDate).getHours() + 7
      )
    )
  );
  const [eventDraft, setEventDraft] = useState({
    eventTitle: "",
    description: "",
  });
  const [bgColor, setBGColor] = useState("");
  useEffect(() => {
    const hi = async () =>
      setBGColor(await SecureStore.getItemAsync("bgColor"));
    hi();
  }, []);
  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  useEffect(() => {
    const hi = async () => {
      if (!(await SecureStore.getItemAsync("selectedDate"))) {
        await SecureStore.setItemAsync(
          "selectedDate",
          new Date().toLocaleDateString("en-CA")
        );
      }
      if (firstTime) {
        let tempSch;
        setCurrSelectedDate(await SecureStore.getItemAsync("selectedDate"));
        setCurrYear(new Date().getFullYear());
        setFirst(false);
        await axios
          .get("https://ihsbackend.vercel.app/api/accounts/account", {
            headers: {
              bearer: await SecureStore.getItemAsync("bearer"),
            },
          })
          .then(async (res) => {
            if (res.data.success) {
              setSchedule(
                res.data.account.schedule.sort(function (x, y) {
                  return Date.parse(x.datetime) - Date.parse(y.datetime);
                })
              );
              tempSch = res.data.account.schedule.sort(function (x, y) {
                return Date.parse(x.datetime) - Date.parse(y.datetime);
              });
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
        let newBigObject = {};
        for (let i = 0; i < tempSch.length; i++) {
          if (
            !tempSch[i].active &&
            !newBigObject[
              new Date(tempSch[i].datetime).toLocaleDateString("en-CA")
            ]
          ) {
            newBigObject[
              new Date(tempSch[i].datetime).toLocaleDateString("en-CA")
            ] = {
              marked: true,
              dots: [vacation],
            };
          } else {
            newBigObject[
              new Date(tempSch[i].datetime).toLocaleDateString("en-CA")
            ] = {
              marked: true,
              dots: [workout],
            };
          }
        }
        setMarkedDates(newBigObject);
      }
      if ((await SecureStore.getItemAsync("notifications")) == "true") {
        setNotis(true);
        navigation.setOptions({
          headerLeft: () => (
            <IconButton
              icon="information-outline"
              iconColor="teal"
              size={30}
              onPress={() => {
                setInfoVisible(true);
              }}
            />
          ),
          headerRight: () => (
            <IconButton
              icon="bell"
              iconColor="teal"
              size={30}
              onPress={() => setBell(true)}
            />
          ),
        });
      } else {
        setNotis(false);
        navigation.setOptions({
          headerLeft: () => (
            <IconButton
              icon="information-outline"
              iconColor="teal"
              size={30}
              onPress={() => {
                setInfoVisible(true);
              }}
            />
          ),
          headerRight: () => (
            <IconButton
              icon="bell-off"
              iconColor="teal"
              size={30}
              onPress={() => {
                setBell(true);
              }}
            />
          ),
        });
      }
    };
    hi();
  }, [schedule, currSelectedDate, bell, visible]);
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
      width: 338.7 / 2,
      height: 142.5 / 2,
    },
  });

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        setBGColor(await SecureStore.getItemAsync("bgColor"));
      };

      fetchUser();

      return () => {};
    }, [])
  );

  if (!schedule) {
    return (
      <View style={styles.topContainer}>
        <ActivityIndicator animating={true} color="teal" />
      </View>
    );
  } else {
    return (
      <>
        <Portal>
          <Dialog visible={bell} dismissable={false}>
            <Dialog.Title>Notifications</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                First-time users must grant access to allow notifications. You
                can only receive notifications on one device at a time under the
                same account.{"\n\n"}
                <Text style={{ fontWeight: "bold" }}>
                  Notifications are currently {notisOn ? "ON." : "OFF."}
                </Text>
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button textColor="red" onPress={() => setBell(false)}>
                Cancel
              </Button>
              {notisOn ? (
                <Button
                  textColor="red"
                  onPress={async () => {
                    setLoading(true);
                    await axios.post(
                      "https://ihsbackend.vercel.app/api/accounts/addNotification",
                      {
                        bearer: await SecureStore.getItemAsync("bearer"),
                        deviceUID: "",
                      }
                    );
                    await SecureStore.setItemAsync("notifications", "false");
                    setLoading(false);
                    setBell(false);
                  }}
                >
                  Turn off notifications
                </Button>
              ) : (
                <></>
              )}
              {!notisOn ? (
                <Button
                  textColor="blue"
                  onPress={async () => {
                    registerForPushNotificationsAsync().then((token) =>
                      setExpoPushToken(token)
                    );
                    await axios
                      .post(
                        "https://ihsbackend.vercel.app/api/accounts/addNotification",
                        {
                          bearer: await SecureStore.getItemAsync("bearer"),
                          deviceUID: await registerForPushNotificationsAsync(),
                        }
                      )
                      .then(async (res) => {
                        if (!res.data.success) {
                          alert(
                            "Your request to enable notifications was not received. Please try again."
                          );
                        } else {
                          await SecureStore.setItemAsync(
                            "notifications",
                            "true"
                          );
                          setBell(false);
                        }
                      });
                  }}
                >
                  Allow notifications
                </Button>
              ) : (
                <></>
              )}
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Portal>
          <Dialog visible={infoVisible} dismissable={false}>
            <Dialog.Title>Calendar</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                A seamless place to add and manage your schedule.{"\n\n"}
                Long-press a date to add an event on that day. Click the "check"
                to mark as done. You can reactivate or delete "finished" events.
                {"\n\n"}You can turn on event notifications with the bell.
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button textColor="blue" onPress={() => setInfoVisible(false)}>
                Done
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Portal>
          <Dialog visible={visible} dismissable={false}>
            <KeyboardAvoidingView behavior="padding">
              <ScrollView keyboardShouldPersistTaps="handled">
                <Dialog.Title>
                  Add event on{" "}
                  {new Date(
                    new Date(currSelectedDate).setHours(
                      new Date(currSelectedDate).getHours() + 7
                    )
                  ).toLocaleDateString("en-us", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Dialog.Title>
                <Dialog.Content>
                  <Paragraph>Event name</Paragraph>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="none"
                    autoCorrect="none"
                    placeholder="Name your event."
                    onChangeText={(e) => {
                      setEventDraft((eventDraft) => ({
                        ...eventDraft,
                        eventTitle: e,
                      }));
                    }}
                    style={{ margin: 10 }}
                  ></TextInput>
                  <Paragraph>Short description.</Paragraph>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="none"
                    autoCorrect="none"
                    placeholder="To give yourself more detail (optional)."
                    multiline
                    style={{ margin: 10 }}
                    onChangeText={(e) => {
                      setEventDraft((eventDraft) => ({
                        ...eventDraft,
                        description: e,
                      }));
                    }}
                  ></TextInput>
                  <RNDateTimePicker
                    mode="time"
                    value={datete}
                    onChange={(event, date) => {
                      if (event.type == "set") {
                        setDatete(date);
                      }
                    }}
                  />
                </Dialog.Content>
                <Dialog.Actions>
                  <Button textColor="red" onPress={() => setVisible(false)}>
                    Cancel
                  </Button>
                  <Button
                    onPress={async () => {
                      setLoading(true);
                      let { eventTitle, description } = eventDraft;
                      await axios
                        .post(
                          "https://ihsbackend.vercel.app/api/accounts/calendar/addEvent",
                          {
                            bearer: await SecureStore.getItemAsync("bearer"),
                            datetime: datete,
                            eventTitle: eventTitle,
                            description: description,
                          }
                        )
                        .then((e) => {
                          if (e.data.success) {
                            Haptics.notificationAsync(
                              Haptics.NotificationFeedbackType.Success
                            );
                            setShoot(false);
                            setShoot(true);
                            setSchedule(
                              e.data.schedule.sort(function (x, y) {
                                return (
                                  Date.parse(x.datetime) -
                                  Date.parse(y.datetime)
                                );
                              })
                            );
                            let newBigObject = {};
                            for (let i = 0; i < schedule.length; i++) {
                              if (schedule[i].active) {
                                newBigObject[
                                  new Date(
                                    schedule[i].datetime
                                  ).toLocaleDateString("en-CA")
                                ] = {
                                  marked: true,
                                  dots: [workout],
                                };
                              } else {
                                newBigObject[
                                  new Date(
                                    schedule[i].datetime
                                  ).toLocaleDateString("en-CA")
                                ] = {
                                  marked: true,
                                  dots: [vacation],
                                };
                              }
                            }
                            setMarkedDates(newBigObject);
                            setVisible(false);
                          } else {
                            alert("Error. Check your internet connection.");
                          }
                          setLoading(false);
                        });
                    }}
                    disabled={eventDraft.eventTitle == "" || datete == ""}
                  >
                    Submit
                  </Button>
                </Dialog.Actions>
              </ScrollView>
            </KeyboardAvoidingView>
          </Dialog>
        </Portal>
        <Portal>
          <Dialog visible={loading} dismissable={false}>
            <Dialog.Content>
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator animating={true} color="teal" />
              </View>
            </Dialog.Content>
          </Dialog>
        </Portal>
        <View style={styles.container}>
          <Calendar
            style={{
              borderRadius: 20,
              margin: 15,
            }}
            markingType={"multi-dot"}
            markedDates={markedDates}
            minDate={(currYear + "-06-03").toString()}
            maxDate={(currYear + 1 + "-06-02").toString()}
            onDayPress={async (day) => {
              // show selected, and display agenda for this day
              await SecureStore.setItemAsync("selectedDate", day.dateString);
              setCurrSelectedDate(day.dateString);
            }}
            onDayLongPress={(day) => {
              // add event on this day
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              if (
                Date.parse(new Date()) - Date.parse(day.dateString) <
                86400000
              ) {
                setDatete(
                  new Date(
                    new Date(day.dateString).setHours(
                      new Date(day.dateString).getHours() + 7
                    )
                  )
                );
                setCurrSelectedDate(day.dateString);
                setVisible(true);
              } else {
                alert("Cannot add event to days past.");
              }
            }}
            monthFormat={"MMMM yyyy"}
            firstDay={1}
            enableSwipeMonths={true}
          />
          <View style={{ alignItems: "center" }}>
            <Text
              variant="headlineLarge"
              style={{ marginBottom: 10, color: "teal", fontWeight: "bold" }}
            >
              {new Date(
                new Date(currSelectedDate).setHours(
                  new Date(currSelectedDate).getHours() + 7
                )
              ).toLocaleDateString("en-us", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <ScrollView style={{ marginBottom: 80 }}>
            <View style={{ alignItems: "center" }}>
              {schedule.length == 0 ? (
                <Text style={{ textAlign: "center" }}>
                  Add events by long-pressing a date.
                </Text>
              ) : (
                <></>
              )}
              {schedule.map((d) => {
                const time1 = new Date(d.datetime),
                  time2 = new Date(currSelectedDate);
                time2.setHours(time2.getHours() + 7);
                if (
                  time1.getDate() === time2.getDate() &&
                  Math.abs(Date.parse(time1) - Date.parse(time2)) <
                    24 * 60 * 60 * 1000
                ) {
                  if (!d.active) {
                    return (
                      <Card
                        style={{
                          borderRadius: 15,
                          margin: 10,
                          width: 300,
                        }}
                      >
                        <Card.Title
                          titleStyle={{
                            textDecorationLine: "line-through",
                            color: "#c8c8c8",
                          }}
                          right={(props) => (
                            <IconButton
                              {...props}
                              icon="refresh"
                              iconColor="#90ee90"
                              onPress={async () => {
                                setLoading(true);
                                await axios
                                  .post(
                                    "https://ihsbackend.vercel.app/api/accounts/calendar/resetEvent",
                                    {
                                      bearer: await SecureStore.getItemAsync(
                                        "bearer"
                                      ),
                                      datetime: d.datetime,
                                      eventTitle: d.eventTitle,
                                      description: d.description,
                                    }
                                  )
                                  .then(async (res) => {
                                    if (res.data.success) {
                                      setSchedule(
                                        res.data.schedule.sort(function (x, y) {
                                          return (
                                            Date.parse(x.datetime) -
                                            Date.parse(y.datetime)
                                          );
                                        })
                                      );
                                      let newBigObject = {};
                                      for (
                                        let i = 0;
                                        i < schedule.length;
                                        i++
                                      ) {
                                        if (schedule[i].active) {
                                          newBigObject[
                                            new Date(
                                              schedule[i].datetime
                                            ).toLocaleDateString("en-CA")
                                          ] = {
                                            marked: true,
                                            dots: [workout],
                                          };
                                        } else {
                                          newBigObject[
                                            new Date(
                                              schedule[i].datetime
                                            ).toLocaleDateString("en-CA")
                                          ] = {
                                            marked: true,
                                            dots: [vacation],
                                          };
                                        }
                                      }
                                      setMarkedDates(newBigObject);
                                      setLoading(false);
                                    } else {
                                      alert(
                                        "Error. Please check your internet connection and restart the app."
                                      );
                                    }
                                  });
                              }}
                            />
                          )}
                          title={d.eventTitle}
                        ></Card.Title>
                        <Card.Content>
                          <Paragraph
                            style={{
                              marginTop: -20,
                              textDecorationLine: "line-through",
                              color: "#c8c8c8",
                            }}
                          >
                            <Text style={{ fontWeight: "bold" }}>
                              {new Date(d.datetime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </Text>{" "}
                            - {d.description}
                          </Paragraph>
                        </Card.Content>
                        <Card.Actions>
                          <Button
                            textColor="brown"
                            mode="text"
                            onPress={async () => {
                              setLoading(true);
                              await axios
                                .post(
                                  "https://ihsbackend.vercel.app/api/accounts/calendar/deleteEvent",
                                  {
                                    bearer: await SecureStore.getItemAsync(
                                      "bearer"
                                    ),
                                    eventTitle: d.eventTitle,
                                    description: d.description,
                                  }
                                )
                                .then((res) => {
                                  if (res.data.success) {
                                    setSchedule(
                                      res.data.schedule.sort(function (x, y) {
                                        return (
                                          Date.parse(x.datetime) -
                                          Date.parse(y.datetime)
                                        );
                                      })
                                    );
                                    let newBigObject = {};
                                    for (let i = 0; i < schedule.length; i++) {
                                      if (schedule[i].active) {
                                        newBigObject[
                                          new Date(
                                            schedule[i].datetime
                                          ).toLocaleDateString("en-CA")
                                        ] = {
                                          marked: true,
                                          dots: [workout],
                                        };
                                      } else {
                                        newBigObject[
                                          new Date(
                                            schedule[i].datetime
                                          ).toLocaleDateString("en-CA")
                                        ] = {
                                          marked: true,
                                          dots: [vacation],
                                        };
                                      }
                                    }
                                    setMarkedDates(newBigObject);
                                    setLoading(false);
                                  } else {
                                    alert(
                                      "Error. Please check your internet connection and restart the app."
                                    );
                                    setLoading(false);
                                  }
                                });
                            }}
                          >
                            Delete event
                          </Button>
                        </Card.Actions>
                      </Card>
                    );
                  } else {
                    return (
                      <Card
                        style={{
                          borderRadius: 15,
                          margin: 10,
                          width: 300,
                        }}
                      >
                        <Card.Title
                          right={(props) => (
                            <IconButton
                              {...props}
                              icon="check"
                              iconColor="#90ee90"
                              onPress={async () => {
                                setLoading(true);
                                await axios
                                  .post(
                                    "https://ihsbackend.vercel.app/api/accounts/calendar/finishEvent",
                                    {
                                      bearer: await SecureStore.getItemAsync(
                                        "bearer"
                                      ),
                                      datetime: d.datetime,
                                      eventTitle: d.eventTitle,
                                      description: d.description,
                                    }
                                  )
                                  .then((res) => {
                                    if (res.data.success) {
                                      setSchedule(
                                        res.data.schedule.sort(function (x, y) {
                                          return (
                                            Date.parse(x.datetime) -
                                            Date.parse(y.datetime)
                                          );
                                        })
                                      );
                                      let newBigObject = {};
                                      for (
                                        let i = 0;
                                        i < schedule.length;
                                        i++
                                      ) {
                                        if (schedule[i].active) {
                                          newBigObject[
                                            new Date(
                                              schedule[i].datetime
                                            ).toLocaleDateString("en-CA")
                                          ] = {
                                            marked: true,
                                            dots: [workout],
                                          };
                                        } else {
                                          newBigObject[
                                            new Date(
                                              schedule[i].datetime
                                            ).toLocaleDateString("en-CA")
                                          ] = {
                                            marked: true,
                                            dots: [vacation],
                                          };
                                        }
                                      }
                                      setMarkedDates(newBigObject);
                                      setLoading(false);
                                      Haptics.notificationAsync(
                                        Haptics.NotificationFeedbackType.Success
                                      );
                                      setShoot(false);
                                      setShoot(true);
                                    } else {
                                      alert(
                                        "Error. Please check your internet connection and restart the app."
                                      );
                                    }
                                  });
                              }}
                            />
                          )}
                          title={d.eventTitle}
                        ></Card.Title>
                        <Card.Content>
                          <Paragraph style={{ marginTop: -20 }}>
                            <Text style={{ fontWeight: "bold" }}>
                              {new Date(d.datetime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </Text>{" "}
                            - {d.description}
                          </Paragraph>
                        </Card.Content>
                      </Card>
                    );
                  }
                }
              })}
              <Text variant="labelLarge">No more events on this day!</Text>
              <Text style={{ fontWeight: "bold" }}>
                {!notisOn
                  ? "For a better experience, turn on notifications."
                  : "Notifications are on."}
              </Text>
            </View>
          </ScrollView>
          {shoot ? (
            <ConfettiCannon
              count={200}
              fallSpeed={1500}
              fadeOut={true}
              origin={{ x: Dimensions.get("window").width / 2, y: 0 }}
            />
          ) : null}
        </View>
      </>
    );
  }
}
