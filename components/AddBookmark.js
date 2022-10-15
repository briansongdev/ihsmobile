import { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Button, Text } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import * as Haptics from "expo-haptics";
import axios from "axios";
import InteractiveTextInput from "react-native-text-input-interactive";
import { StatusBar } from "expo-status-bar";

export default function AddBookmark({ navigation }) {
  const [eventDraft, setEventDraft] = useState({
    eventTitle: "",
    url: "",
  });

  return (
    <View style={styles.topContainer}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ alignItems: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="titleMedium" style={{ margin: 10 }}>
          To add a bookmark, assign a name that'll help you remember the website
          best and link the URL below. Then you're all set!
        </Text>
        <Text style={{ margin: 10 }}>Name of website</Text>
        <InteractiveTextInput
          placeholder="A name you'll remember."
          autoCapitalize="none"
          autoComplete="none"
          autoCorrect="none"
          onChangeText={(e) => {
            setEventDraft((eventDraft) => ({
              ...eventDraft,
              eventTitle: e,
            }));
          }}
          style={{ margin: 10 }}
        ></InteractiveTextInput>
        <Text style={{ margin: 10 }}>URL of website (with http or https)</Text>
        <InteractiveTextInput
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
        ></InteractiveTextInput>
        <Button
          mode="contained"
          buttonColor="#1cb2f5"
          style={{ margin: 20 }}
          contentStyle={{ minWidth: 200, minHeight: 60 }}
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
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  );
                  navigation.navigate("Home");
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
        <Button
          mode="text"
          textColor="teal"
          icon="chevron-left-circle"
          onPress={() => navigation.goBack()}
        >
          Return
        </Button>
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6fef9",
  },
  topContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  tinyLogo: {
    width: 338.7 / 2,
    height: 142.5 / 2,
  },
});
