import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Button,
  Text,
  Card,
  Title,
  Paragraph,
  Searchbar,
  Dialog,
  Portal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  IconButton,
  Divider,
  ActivityIndicator,
} from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Hyperlink from "react-native-hyperlink";

export default function ClubScreen({ navigation }) {
  const [clubs, setClubs] = useState([]);
  const [favoritedClubs, setFavoritedClubs] = useState([]);
  const [infoVisible, setInfoVisible] = useState(false);
  const [bgColor, setBGColor] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const hi = async () =>
      setBGColor(await SecureStore.getItemAsync("bgColor"));
    hi();
  }, []);
  useEffect(() => {
    async function fetchClubs() {
      await axios
        .post("https://ihsbackend.vercel.app/api/accounts/getClubs")
        .then((res) => {
          setClubs(res.data.clubs);
        });
      await axios
        .get("https://ihsbackend.vercel.app/api/accounts/account", {
          headers: {
            bearer: await SecureStore.getItemAsync("bearer"),
          },
        })
        .then(async (res) => {
          if (res.data.success) {
            setFavoritedClubs(res.data.account.favoritedClubs);
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
        await axios
          .post("https://ihsbackend.vercel.app/api/accounts/getClubs")
          .then((res) => {
            setClubs(res.data.clubs);
          });
        await axios
          .get("https://ihsbackend.vercel.app/api/accounts/account", {
            headers: {
              bearer: await SecureStore.getItemAsync("bearer"),
            },
          })
          .then(async (res) => {
            if (res.data.success) {
              setFavoritedClubs(res.data.account.favoritedClubs);
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

  if (!clubs) {
    return (
      <View style={styles.topContainer}>
        <ActivityIndicator animating={true} color="green" />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
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
        <Card mode="contained" style={{ backgroundColor: "#ffffff" }}>
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
        </Card>
        <Portal>
          <Dialog visible={infoVisible} dismissable={false}>
            <Dialog.Title>Clubs</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                Check out Irvine High School clubs!{"\n\n"}If you would like to
                display your club on this app, click "Submit your club." To
                moderate spam, your request will be manually approved (and take
                a couple days to show up). Thank you!
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button textColor="blue" onPress={() => setInfoVisible(false)}>
                Done
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <ScrollView>
          <View style={{ marginTop: 10, marginBottom: 10 }}>
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
            {favoritedClubs
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
                return (
                  <Card
                    style={{
                      borderRadius: 15,
                      marginLeft: 15,
                      marginRight: 15,
                      marginTop: 5,
                    }}
                  >
                    <Card.Title
                      title={
                        d.clubName + " // Meetings in " + d.clubMeetingRoom
                      }
                      right={(props) => (
                        <IconButton {...props} icon="heart" iconColor="red" />
                      )}
                    ></Card.Title>
                    <Card.Content>
                      <Paragraph style={{ marginTop: -20 }}>
                        Description: {d.description}
                        {"\n\n"}
                        Register at:{" "}
                        <Hyperlink
                          linkStyle={{ color: "#CBC3E3" }}
                          linkDefault={true}
                        >
                          <Text>{d.registerLink}</Text>
                        </Hyperlink>
                        {"\n"}
                        President: {d.presidentName}
                      </Paragraph>
                    </Card.Content>
                  </Card>
                );
              })}
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                margin: 5,
                color: "teal",
              }}
              variant="titleLarge"
            >
              Other Clubs
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
                for (let al = 0; al < favoritedClubs.length; al++) {
                  if (JSON.stringify(favoritedClubs[al]) == JSON.stringify(d)) {
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
                      }}
                    >
                      <Card.Title
                        title={
                          d.clubName + " // Meetings in " + d.clubMeetingRoom
                        }
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
                                .then((res) => {
                                  if (res.data.success) {
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
                          Description: {d.description}
                          {"\n\n"}
                          Register at:{" "}
                          <Hyperlink
                            linkStyle={{ color: "#CBC3E3" }}
                            linkDefault={true}
                          >
                            <Text>{d.registerLink}</Text>
                          </Hyperlink>
                          {"\n"}
                          President: {d.presidentName}
                        </Paragraph>
                      </Card.Content>
                    </Card>
                  );
                }
              })}
          </View>
        </ScrollView>
      </View>
    );
  }
}
