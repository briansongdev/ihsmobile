import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
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

export default function ClubScreen({ navigation }) {
  const [bmarks, setBmarks] = useState([]);
  const [visible, setVisible] = useState(false);
  const [shoot, setShoot] = useState(false);
  const [eventDraft, setEventDraft] = useState({
    eventTitle: "",
    url: "",
  });

  useEffect(() => {
    async function fetchBmarks() {
      await axios
        .get("https://ihsbackend.vercel.app/api/accounts/account", {
          headers: {
            bearer: await SecureStore.getItemAsync("bearer"),
          },
        })
        .then(async (res) => {
          if (res.data.success) {
            setBmarks(
              res.data.account.bookmarks.sort(function (x, y) {
                return x.title > y.title;
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
      navigation.setOptions({
        headerLeft: () => (
          <IconButton
            icon="information-outline"
            iconColor="teal"
            size={30}
            onPress={() => {}}
          />
        ),
        headerRight: () => (
          <IconButton
            icon="plus"
            iconColor="teal"
            size={30}
            onPress={() => setVisible(true)}
          />
        ),
      });
    }
    fetchBmarks();
  }, []);
  if (!bmarks) {
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
                <Dialog.Title>Add bookmark</Dialog.Title>
                <Dialog.Content>
                  <Paragraph>Name of website</Paragraph>
                  <TextInput
                    placeholder="A name you'll remember."
                    onChangeText={(e) => {
                      setEventDraft((eventDraft) => ({
                        ...eventDraft,
                        eventTitle: e,
                      }));
                    }}
                    style={{ margin: 10 }}
                  ></TextInput>
                  <Paragraph>URL of website (with http or https)</Paragraph>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="none"
                    autoCorrect="none"
                    placeholder="https://google.com"
                    style={{ margin: 10 }}
                    mode="outlined"
                    onChangeText={(e) => {
                      setEventDraft((eventDraft) => ({
                        ...eventDraft,
                        url: e,
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
                      let { eventTitle, url } = eventDraft;
                      await axios
                        .post(
                          "https://ihsbackend.vercel.app/api/accounts/bookmarks/addBookmark",
                          {
                            bearer: await SecureStore.getItemAsync("bearer"),
                            url: url,
                            title: eventTitle,
                          }
                        )
                        .then((e) => {
                          if (e.data.success) {
                            setShoot(false);
                            setShoot(true);
                            setBmarks(e.data.bookmarks);
                            setVisible(false);
                          } else {
                            alert(
                              "Unsuccessful. Check your internet connection and try again."
                            );
                          }
                        });
                    }}
                    disabled={
                      eventDraft.eventTitle == "" ||
                      !/^(ftp|http|https):\/\/[^ "]+$/.test(eventDraft.url)
                    }
                  >
                    Submit
                  </Button>
                </Dialog.Actions>
              </ScrollView>
            </KeyboardAvoidingView>
          </Dialog>
        </Portal>
        <View style={styles.container}>
          <ScrollView>
            <View style={{ marginBottom: 10 }}>
              {bmarks.map((d) => {
                return (
                  <Card
                    style={{
                      borderRadius: 15,
                      marginLeft: 35,
                      marginRight: 35,
                      marginTop: 20,
                    }}
                  >
                    <Card.Title
                      titleStyle={{ fontWeight: "bold", color: "#cbb458" }}
                      title={d.title}
                      right={(props) => (
                        <IconButton {...props} icon="delete-outline" />
                      )}
                    ></Card.Title>
                    <Card.Content>
                      <Paragraph style={{ marginTop: -20, color: "#23395d" }}>
                        <Hyperlink
                          linkStyle={{ color: "#CBC3E3" }}
                          linkDefault={true}
                        >
                          <Text>{d.url}</Text>
                        </Hyperlink>
                        {"\n"}
                        Added on{" "}
                        {new Date(d.addedDate).toLocaleDateString("en-us", {
                          day: "numeric",
                          month: "2-digit",
                        })}
                      </Paragraph>
                    </Card.Content>
                  </Card>
                );
              })}
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
