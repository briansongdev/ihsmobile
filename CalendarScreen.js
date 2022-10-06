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
import { dates, IMPORTEDB64 } from "./importedURI";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Calendar, Agenda } from "react-native-calendars";

export default function CalendarScreen() {
  const datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();
  const [schedule, setSchedule] = useState();
  const [currSelectedDate, setCurrSelectedDate] = useState();
  const [currYear, setCurrYear] = useState();
  const [markedDates, setMarkedDates] = useState({});
  const [firstTime, setFirst] = useState(true);
  useEffect(() => {
    const hi = async () => {
      if (!(await SecureStore.getItemAsync("selectedDate"))) {
        await SecureStore.setItemAsync(
          "selectedDate",
          new Date().toLocaleDateString("en-CA")
        );
      }
      if (firstTime) {
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
      }
      let newBigObject = {};
      for (let i = 0; i < schedule.length; i++) {
        if (schedule[i].active) {
          newBigObject[
            new Date(schedule[i].datetime).toLocaleDateString("en-CA")
          ] = {
            marked: true,
          };
        }
      }
      newBigObject[currSelectedDate] = {
        selected: true,
      };
      setMarkedDates(newBigObject);
    };
    hi();
  }, [currSelectedDate]);
  if (!schedule) {
    return (
      <View style={styles.topContainer}>
        <Text>Loading, please wait...</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <Calendar
          style={{
            borderRadius: 20,
            margin: 15,
          }}
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
            console.log("selected day", day);
          }}
          monthFormat={"MMMM yyyy"}
          onMonthChange={(month) => {
            console.log("month changed", month);
          }}
          firstDay={1}
          enableSwipeMonths={true}
        />
        <View style={{ alignItems: "center" }}>
          {schedule.map((d) => {
            const time1 = new Date(d.datetime),
              time2 = new Date(currSelectedDate);
            time2.setHours(time2.getHours() + 7);
            if (
              time1.getDate() === time2.getDate() &&
              Math.abs(Date.parse(d.datetime) - Date.parse(currSelectedDate)) <
                24 * 60 * 60 * 1000 &&
              d.active
            ) {
              // if date > dateFinished (done event)
              if (Date.parse(new Date()) > Date.parse(d.dateFinished)) {
                return (
                  <Card
                    right={(props) => (
                      <IconButton
                        {...props}
                        icon="history"
                        onPress={async () => {
                          await axios
                            .post(
                              "https://ihsbackend.vercel.app/api/accounts/favoriteClub",
                              {
                                bearer: await SecureStore.getItemAsync(
                                  "bearer"
                                ),
                                prospectiveClub: d,
                              }
                            )
                            .then((res) => {
                              if (res.data.success) {
                                alert("Success!");
                                setFavoritedClubs(res.data.clubs);
                              } else {
                                alert(res.data.message);
                              }
                            });
                        }}
                      />
                    )}
                    style={{ borderRadius: 15, margin: 15, width: 300 }}
                  >
                    <Card.Title title={d.eventTitle}></Card.Title>
                    <Card.Content>
                      <Paragraph style={{ marginTop: -20 }}>
                        {new Date(d.datetime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Paragraph>
                      <Paragraph>{d.description}</Paragraph>
                    </Card.Content>
                  </Card>
                );
              } else {
                return (
                  <Card
                    right={(props) => (
                      <IconButton
                        {...props}
                        icon="check-outline"
                        onPress={async () => {
                          await axios
                            .post(
                              "https://ihsbackend.vercel.app/api/accounts/favoriteClub",
                              {
                                bearer: await SecureStore.getItemAsync(
                                  "bearer"
                                ),
                                prospectiveClub: d,
                              }
                            )
                            .then((res) => {
                              if (res.data.success) {
                                alert("Success!");
                                setFavoritedClubs(res.data.clubs);
                              } else {
                                alert(res.data.message);
                              }
                            });
                        }}
                      />
                    )}
                    style={{ borderRadius: 15, margin: 15, width: 300 }}
                  >
                    <Card.Title title={d.eventTitle}></Card.Title>
                    <Card.Content>
                      <Paragraph style={{ marginTop: -20 }}>
                        {new Date(d.datetime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Paragraph>
                      <Paragraph>{d.description}</Paragraph>
                    </Card.Content>
                  </Card>
                );
              }
            }
          })}
        </View>
      </View>
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
