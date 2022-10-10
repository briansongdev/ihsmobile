import {
  setStatusBarNetworkActivityIndicatorVisible,
  StatusBar,
} from "expo-status-bar";
import { useState, useEffect } from "react";
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
import axios from "axios";
import { Calendar } from "react-native-calendars";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import ConfettiCannon from "react-native-confetti-cannon";

const workout = { key: "workout", color: "green" };
const vacation = { key: "vacation", color: "red", selectedDotColor: "blue" };

export default function CalendarScreen() {
  const [schedule, setSchedule] = useState();
  const [currSelectedDate, setCurrSelectedDate] = useState(new Date());
  const [currYear, setCurrYear] = useState();
  const [markedDates, setMarkedDates] = useState({});
  const [firstTime, setFirst] = useState(true);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [shoot, setShoot] = useState(false);
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
    };
    hi();
  }, [currSelectedDate]);
  if (!schedule) {
    return (
      <View style={styles.topContainer}>
        <ActivityIndicator animating={true} color="green" />
      </View>
    );
  } else {
    return (
      <>
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
                <ActivityIndicator animating={true} color="blue" />
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
            <Text variant="headlineLarge">
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
              {schedule.map((d) => {
                const time1 = new Date(d.datetime),
                  time2 = new Date(currSelectedDate);
                time2.setHours(time2.getHours() + 7);
                if (
                  time1.getDate() === time2.getDate() &&
                  Math.abs(
                    Date.parse(d.datetime) - Date.parse(currSelectedDate)
                  ) <
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
              <Text variant="labelLarge">...end of events</Text>
              <Text
                style={{
                  textAlign: "center",
                  marginLeft: 50,
                  marginRight: 50,
                  marginTop: 10,
                  textDecorationLine: "underline",
                }}
              >
                Long-press a date to add an event on that day. Click the "check"
                to finish an event. Click it again to reactivate.
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
