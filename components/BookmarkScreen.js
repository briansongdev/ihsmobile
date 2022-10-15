import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Alert,
  Linking,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import * as Haptics from "expo-haptics";
import {
  Button,
  Text,
  Card,
  Paragraph,
  Dialog,
  Portal,
  IconButton,
  Avatar,
  ActivityIndicator,
} from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

export default function ClubScreen({ navigation }) {
  const [bmarks, setBmarks] = useState([]);
  const [visible, setVisible] = useState(false);
  const [shoot, setShoot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
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
      };

      fetchUser();

      return () => {};
    }, [])
  );
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
            onPress={() => setInfoVisible(true)}
          />
        ),
        headerRight: () => (
          <IconButton
            icon="plus"
            iconColor="teal"
            size={30}
            onPress={() => navigation.navigate("Add a bookmark")}
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
          <Dialog visible={infoVisible} dismissable={false}>
            <Dialog.Title>Bookmarks</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                Bookmarks are a convenient way to keep your most relevant
                websites just a tap away.{"\n\n"}You can add bookmarks by
                clicking the top left button.{"\n"}You can delete bookmarks by
                long-pressing a bookmark card.
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
          <ScrollView style={{ marginBottom: 50 }}>
            <View style={{ marginBottom: 10 }}>
              {bmarks.map((d) => {
                return (
                  <>
                    <Card
                      onPress={() => {
                        Linking.openURL(d.url);
                      }}
                      onLongPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        return Alert.alert(
                          "Are you sure you'd like to delete this bookmark?",
                          "You can add it back later.",
                          [
                            {
                              text: "No",
                              style: "cancel",
                            },
                            {
                              text: "Yes",
                              onPress: async () => {
                                setLoading(true);
                                await axios
                                  .post(
                                    "https://ihsbackend.vercel.app/api/accounts/bookmarks/deleteBookmark",
                                    {
                                      bearer: await SecureStore.getItemAsync(
                                        "bearer"
                                      ),
                                      title: d.title,
                                      url: d.url,
                                    }
                                  )
                                  .then((res) => {
                                    if (res.data.success) {
                                      setBmarks(res.data.bookmarks);
                                      setLoading(false);
                                    }
                                  });
                              },
                              style: "destructive",
                            },
                          ]
                        );
                      }}
                      style={{
                        borderRadius: 15,
                        marginLeft: 35,
                        marginRight: 35,
                        marginTop: 15,
                        backgroundColor: "#dedede",
                      }}
                      mode="contained"
                    >
                      <Card.Title
                        titleNumberOfLines={1}
                        titleStyle={{ fontWeight: "bold" }}
                        title={d.url}
                        left={() => (
                          <Avatar.Image
                            size={30}
                            style={{ backgroundColor: "white" }}
                            source={{ uri: d.url + "/favicon.ico" }}
                          />
                        )}
                      ></Card.Title>
                      <Card.Content>
                        <Text style={{ color: "#23395d", margin: 5 }}>
                          <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                            {d.title}
                          </Text>
                          {"\n"}
                          <Text style={{ fontWeight: "300" }}>
                            Added on{" "}
                            {new Date(d.addedDate).toLocaleDateString("en-us", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </Text>
                        </Text>
                      </Card.Content>
                    </Card>
                  </>
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
  previewContainer: {
    backgroundColor: "#e1e1e1",
    borderRadius: 15,
    overflow: "hidden",
    maxWidth: 350,
    marginTop: 20,
  },
  previewImage: {
    width: 350,
    height: 200,
    backgroundColor: "#d5d5d5",
  },
  previewTitle: {
    fontWeight: "700",
    padding: 10,
    paddingTop: 10,
    fontSize: 15,
  },
  previewDescription: {
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 20,
  },
  previewUrl: {
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 10,
    paddingRight: 40,
    color: "#777",
    fontWeight: "300",
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
