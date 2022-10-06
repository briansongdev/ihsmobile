import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
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
} from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Hyperlink from "react-native-hyperlink";

export default function ClubScreen() {
  const [clubs, setClubs] = useState([]);
  const [favoritedClubs, setFavoritedClubs] = useState([]);
  const [visible, setVisible] = useState(false);
  const [clubObject, setClubObj] = useState({
    clubName: "",
    description: "",
    registerLink: "",
    clubMeetingRoom: "",
    members: 0,
  });

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
    }
    fetchClubs();
  }, []);
  if (!clubs || !favoritedClubs) {
    return (
      <View style={styles.topContainer}>
        <Text>Loading, please wait...</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <View style={{ margin: 10 }}>
          <Card mode="contained" style={{ backgroundColor: "#e5f6df" }}>
            <Card.Content>
              <Title>Have a club?</Title>
              <Paragraph>Add your club to the app here.</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                buttonColor="#00b7eb"
                onPress={() => {
                  setVisible(true);
                }}
              >
                Submit your club
              </Button>
            </Card.Actions>
          </Card>
          <Portal>
            <Dialog visible={visible} dismissable={false}>
              <KeyboardAvoidingView behavior="padding">
                <ScrollView keyboardShouldPersistTaps="handled">
                  <Dialog.Title>Submit your club</Dialog.Title>
                  <Dialog.Content>
                    <Paragraph>
                      If your club is in the online catalog, it will be added
                      shortly after submission.{"\n\n"}What's your club's name?
                    </Paragraph>
                    <TextInput
                      placeholder="Club Name"
                      onChangeText={(e) => {
                        setClubObj((clubObject) => ({
                          ...clubObject,
                          clubName: e,
                        }));
                      }}
                      style={{ margin: 10 }}
                    ></TextInput>
                    <Paragraph>Short description of your club.</Paragraph>
                    <TextInput
                      placeholder="Include your meeting datetime."
                      multiline
                      style={{ margin: 10 }}
                      onChangeText={(e) => {
                        setClubObj((clubObject) => ({
                          ...clubObject,
                          description: e,
                        }));
                      }}
                    ></TextInput>
                    <Paragraph>
                      Link to your club's registration form/website.
                    </Paragraph>
                    <TextInput
                      placeholder="Member Registration"
                      keyboardType="url"
                      style={{ margin: 10 }}
                      onChangeText={(e) => {
                        setClubObj((clubObject) => ({
                          ...clubObject,
                          registerLink: e,
                        }));
                      }}
                    ></TextInput>
                    <Paragraph>Which room does your club meet?</Paragraph>
                    <TextInput
                      placeholder="Meeting Room"
                      multiline
                      style={{ margin: 10 }}
                      onChangeText={(e) => {
                        setClubObj((clubObject) => ({
                          ...clubObject,
                          clubMeetingRoom: e,
                        }));
                      }}
                    ></TextInput>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button textColor="red" onPress={() => setVisible(false)}>
                      Cancel
                    </Button>
                    <Button
                      onPress={async () => {
                        const {
                          clubName,
                          clubMeetingRoom,
                          description,
                          registerLink,
                        } = clubObject;
                        await axios
                          .post(
                            "https://ihsbackend.vercel.app/api/accounts/proposeClub",
                            {
                              clubName: clubName,
                              clubMeetingRoom: clubMeetingRoom,
                              description: description,
                              registerLink: registerLink,
                              bearer: await SecureStore.getItemAsync("bearer"),
                            }
                          )
                          .then((res) => {
                            if (res.data.success) {
                              alert("Success! Thank you.");
                              setVisible(false);
                              setClubObj({});
                            } else {
                              alert(res.data.message);
                              setVisible(false);
                              setClubObj({});
                            }
                          });
                      }}
                      disabled={
                        clubObject.clubName == "" ||
                        clubObject.clubMeetingRoom == "" ||
                        clubObject.description == "" ||
                        clubObject.registerLink == ""
                      }
                    >
                      Submit
                    </Button>
                  </Dialog.Actions>
                </ScrollView>
              </KeyboardAvoidingView>
            </Dialog>
          </Portal>
        </View>
        <ScrollView>
          <View style={{ marginBottom: 10 }}>
            <Text style={{ textAlign: "center" }} variant="titleLarge">
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
                  <Card style={{ borderRadius: 15, margin: 15 }}>
                    <Card.Title
                      title={
                        d.clubName + " // Meetings in " + d.clubMeetingRoom
                      }
                      right={(props) => <IconButton {...props} icon="heart" />}
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
            <Text style={{ textAlign: "center" }} variant="titleLarge">
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
                    <Card style={{ borderRadius: 15, margin: 15 }}>
                      <Card.Title
                        title={
                          d.clubName + " // Meetings in " + d.clubMeetingRoom
                        }
                        right={(props) => (
                          <IconButton
                            {...props}
                            icon="heart-outline"
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
