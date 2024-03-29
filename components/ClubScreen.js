import { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Button,
  Text,
  Card,
  Title,
  Paragraph,
  Dialog,
  Portal,
  IconButton,
  ActivityIndicator,
  Avatar,
} from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Hyperlink from "react-native-hyperlink";
import { TextLinearGradient } from "./GradientText";
import { Agenda } from "react-native-calendars";
import { Image } from "react-native";
import ReactLinkify from "react-linkify";

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

export default function ClubScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  // const [favoritedClubs, setFavoritedClubs] = useState([]);
  const [infoVisible, setInfoVisible] = useState(false);
  const [bgColor, setBGColor] = useState("");
  // const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await axios
      .post("https://ihsbackend.vercel.app/api/accounts/getSportEvents")
      .then((res) => {
        setEvents(
          res.data.events.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
          })
        );
      });
    wait(200).then(() => setRefreshing(false));
  }, []);
  useEffect(() => {
    const hi = async () =>
      setBGColor(await SecureStore.getItemAsync("bgColor"));
    hi();
  }, []);
  useEffect(() => {
    async function fetchClubs() {
      await axios
        .post("https://ihsbackend.vercel.app/api/accounts/getSportEvents")
        .then((res) => {
          setEvents(
            res.data.events.sort(function (a, b) {
              return new Date(a.date) - new Date(b.date);
            })
          );
        });
      navigation.setOptions({
        headerLeft: () => (
          <IconButton
            icon="information-outline"
            iconColor="teal"
            size={30}
            onPress={() => setInfoVisible(true)}
          />
        ),
      });
    }
    fetchClubs();
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
      width: 338.7 / 2,
      height: 142.5 / 2,
    },
  });

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        setBGColor(await SecureStore.getItemAsync("bgColor"));
        navigation.setOptions({
          headerLeft: () => (
            <IconButton
              icon="information-outline"
              iconColor="teal"
              size={30}
              onPress={() => setInfoVisible(true)}
            />
          ),
        });
      };

      fetchUser();

      return () => {};
    }, [])
  );

  if (!events) {
    return (
      <View style={styles.topContainer}>
        <ActivityIndicator animating={true} color="teal" />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        {/* <Portal>
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
        </Portal> */}
        {/* <Card mode="contained" style={{ backgroundColor: "#ffffff" }}>
          <Card.Content>
            <Title>President of an existing club?</Title>
            <Paragraph>Add your club to the app here.</Paragraph>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              buttonColor="#00b7eb"
              onPress={() => {
                // setVisible(true);
                navigation.navigate("Add your club");
              }}
            >
              Submit your club
            </Button>
          </Card.Actions>
        </Card> */}
        <Portal>
          <Dialog visible={infoVisible} dismissable={false}>
            <Dialog.Title>Sport Events</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Check out upcoming sporting events for IHS.</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button textColor="blue" onPress={() => setInfoVisible(false)}>
                Done
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <ScrollView
          style={{ marginBottom: 75 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.container}>
            <Text
              style={{ marginTop: 10, textAlign: "center" }}
              variant="labelLarge"
            >
              Cheer your fellow Vaqueros on to victory!
            </Text>
            {events.map((d) => {
              let stringPNG = "",
                ftColor = "";
              if (new Date(d.date) - new Date() > -86400000) {
                if (d.team.includes("Football")) {
                  stringPNG = "fb.png";
                } else if (d.team.includes("Water Polo")) {
                  stringPNG = "waterpolo.png";
                } else if (d.team.includes("Basketball")) {
                  stringPNG = "bask.png";
                } else if (d.team.includes("Soccer")) {
                  stringPNG = "soc.png";
                } else if (d.team.includes("Wrestling")) {
                  stringPNG = "wrest.png";
                } else if (d.team.includes("Baseball")) {
                  stringPNG = "base.png";
                } else if (d.team.includes("Tennis")) {
                  stringPNG = "ten.png";
                } else if (d.team.includes("Cross Country")) {
                  stringPNG = "xc.png";
                } else if (d.team.includes("Volleyball")) {
                  stringPNG = "volleyball.png";
                } else if (d.team.includes("Lacrosse")) {
                  stringPNG = "lacrosse.png";
                } else {
                  stringPNG = "xc.png";
                }
                if (d.team.includes("Boys")) {
                  ftColor = "teal";
                } else {
                  ftColor = "#fc46aa";
                }
                return (
                  <Card
                    style={{
                      borderRadius: 15,
                      marginLeft: 35,
                      marginRight: 35,
                      marginTop: 15,
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <Card.Title
                      titleNumberOfLines={1}
                      titleStyle={{ fontWeight: "bold", color: ftColor }}
                      title={d.team}
                    />
                    <Card.Content style={{ marginTop: -15 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <View style={{ maxWidth: "75%" }}>
                          <Text
                            style={{
                              color: ftColor,
                              fontWeight: "bold",
                            }}
                          >
                            {d.date}
                          </Text>
                          <Text>Location: {d.description}</Text>
                          <Text>{d.homeAway}</Text>
                        </View>
                        <View>
                          <Image
                            style={{ width: 50, height: 50 }}
                            source={{
                              uri:
                                "https://res.cloudinary.com/dfy4tal1p/image/upload/v1668273151/" +
                                stringPNG,
                            }}
                          />
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                );
              }
            })}
          </View>
          {/* <View style={{ marginTop: 10, marginBottom: 10 }}>
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                margin: 5,
                color: "teal",
              }}
              variant="titleLarge"
            >
              Favorited Clubs
            </Text>
            {clubs
              .sort(function (a, b) {
                var nameA = a.clubName.toLowerCase(),
                  nameB = b.clubName.toLowerCase();
                if (nameA < nameB)
                  //sort string ascending
                  return -1;
                if (nameA > nameB) return 1;
                return 0; //default return value (no sorting)
              })
              .map((d) => {
                let inFavorite = false;
                let newClubObj = Object.assign({}, d);
                delete newClubObj.members;
                for (let al = 0; al < favoritedClubs.length; al++) {
                  if (
                    JSON.stringify(favoritedClubs[al]) ==
                    JSON.stringify(newClubObj)
                  ) {
                    inFavorite = true;
                  }
                }
                if (inFavorite) {
                  return (
                    <Card
                      style={{
                        borderRadius: 15,
                        marginLeft: 15,
                        marginRight: 15,
                        marginTop: 5,
                        marginBottom: 10,
                      }}
                    >
                      <Card.Title
                        title={d.clubName}
                        right={(props) => (
                          <IconButton {...props} icon="heart" iconColor="red" />
                        )}
                      ></Card.Title>
                      <Card.Content>
                        <Paragraph style={{ marginTop: -20 }}>
                          <Text style={{ fontWeight: "bold" }}>
                            {d.clubMeetingRoom}
                          </Text>
                          {"\n\n"}
                          {d.description}
                          {"\n\n"}
                          Contact:{" "}
                          <Hyperlink
                            linkStyle={{ color: "#CBC3E3" }}
                            linkDefault={true}
                          >
                            <Text>{d.registerLink}</Text>
                          </Hyperlink>
                          {"\n"}
                          <Paragraph style={{ fontWeight: "bold" }}>
                            {d.members} people favorited this club.
                          </Paragraph>
                        </Paragraph>
                      </Card.Content>
                    </Card>
                  );
                }
              })}
            <Text style={{ textAlign: "center" }}>End of favorited clubs.</Text>
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                margin: 10,
                color: "teal",
              }}
              variant="titleLarge"
            >
              Other Clubs (Alphabetical)
            </Text>
            {clubs
              .sort(function (a, b) {
                var nameA = a.clubName.toLowerCase(),
                  nameB = b.clubName.toLowerCase();
                if (nameA < nameB)
                  //sort string ascending
                  return -1;
                if (nameA > nameB) return 1;
                return 0; //default return value (no sorting)
              })
              .map((d) => {
                let inFavorite = false;
                let newClubObj = Object.assign({}, d);
                delete newClubObj.members;
                for (let al = 0; al < favoritedClubs.length; al++) {
                  if (
                    JSON.stringify(favoritedClubs[al]) ==
                    JSON.stringify(newClubObj)
                  ) {
                    inFavorite = true;
                  }
                }
                if (!inFavorite) {
                  return (
                    <Card
                      style={{
                        borderRadius: 15,
                        marginLeft: 15,
                        marginRight: 15,
                        marginTop: 5,
                        marginBottom: 10,
                      }}
                    >
                      <Card.Title
                        title={d.clubName}
                        right={(props) => (
                          <IconButton
                            {...props}
                            icon="heart-outline"
                            onPress={async () => {
                              setLoading(true);
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
                                .then(async (res) => {
                                  if (res.data.success) {
                                    await axios
                                      .post(
                                        "https://ihsbackend.vercel.app/api/accounts/getClubs"
                                      )
                                      .then((res) => {
                                        setClubs(res.data.clubs);
                                      });
                                    setFavoritedClubs(res.data.favoritedClubs);
                                    setLoading(false);
                                  } else {
                                    alert(res.data.message);
                                  }
                                });
                            }}
                          />
                        )}
                      ></Card.Title>
                      <Card.Content>
                        <Paragraph style={{ marginTop: -20 }}>
                          <Text style={{ fontWeight: "bold" }}>
                            {d.clubMeetingRoom}
                          </Text>
                          {"\n\n"}
                          {d.description}
                          {"\n\n"}
                          Contact:{" "}
                          <Hyperlink
                            linkStyle={{ color: "#CBC3E3" }}
                            linkDefault={true}
                          >
                            <Text>{d.registerLink}</Text>
                          </Hyperlink>
                          {"\n"}
                          <Paragraph style={{ fontWeight: "bold" }}>
                            {d.members} people favorited this club.
                          </Paragraph>
                        </Paragraph>
                      </Card.Content>
                    </Card>
                  );
                }
              })}
          </View> */}

          <Text style={{ textAlign: "center", margin: 10 }}>
            Pull down to refresh upcoming events.
          </Text>
        </ScrollView>
      </View>
    );
  }
}
