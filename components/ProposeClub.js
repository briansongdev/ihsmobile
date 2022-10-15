import { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Button, Text } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import InteractiveTextInput from "react-native-text-input-interactive";
import { StatusBar } from "expo-status-bar";

export default function ClubScreen({ navigation }) {
  const [clubObject, setClubObj] = useState({
    clubName: "",
    description: "",
    registerLink: "",
    clubMeetingRoom: "",
    members: 0,
  });
  return (
    <View style={styles.topContainer}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ alignItems: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="titleMedium" style={{ margin: 10 }}>
          If your club is in the IHS online catalog, it will be verified and
          added shortly after submission.
        </Text>
        <Text style={{ margin: 10 }}>What's your club's name?</Text>
        <InteractiveTextInput
          autoCapitalize="none"
          autoComplete="none"
          autoCorrect="none"
          placeholder="Club Name"
          onChangeText={(e) => {
            setClubObj((clubObject) => ({
              ...clubObject,
              clubName: e,
            }));
          }}
        />
        <Text style={{ margin: 10 }}>Short description of your club.</Text>
        <InteractiveTextInput
          autoCapitalize="none"
          autoComplete="none"
          autoCorrect="none"
          placeholder="Include your meeting datetime."
          style={{ margin: 10 }}
          onChangeText={(e) => {
            setClubObj((clubObject) => ({
              ...clubObject,
              description: e,
            }));
          }}
        ></InteractiveTextInput>
        <Text style={{ margin: 10 }}>
          Link to your club's registration form/website.
        </Text>
        <InteractiveTextInput
          autoCapitalize="none"
          autoComplete="none"
          autoCorrect="none"
          placeholder="Member Registration"
          keyboardType="url"
          style={{ margin: 10 }}
          onChangeText={(e) => {
            setClubObj((clubObject) => ({
              ...clubObject,
              registerLink: e,
            }));
          }}
        ></InteractiveTextInput>
        <Text style={{ margin: 10 }}>Which room does your club meet?</Text>
        <InteractiveTextInput
          autoCapitalize="none"
          autoComplete="none"
          autoCorrect="none"
          placeholder="Meeting Room"
          style={{ margin: 10 }}
          onChangeText={(e) => {
            setClubObj((clubObject) => ({
              ...clubObject,
              clubMeetingRoom: e,
            }));
          }}
        ></InteractiveTextInput>
        <Button
          mode="contained"
          buttonColor="#1cb2f5"
          style={{ margin: 20 }}
          contentStyle={{ minWidth: 200, minHeight: 60 }}
          onPress={async () => {
            const { clubName, clubMeetingRoom, description, registerLink } =
              clubObject;
            await axios
              .post("https://ihsbackend.vercel.app/api/accounts/proposeClub", {
                clubName: clubName,
                clubMeetingRoom: clubMeetingRoom,
                description: description,
                registerLink: registerLink,
                bearer: await SecureStore.getItemAsync("bearer"),
              })
              .then((res) => {
                if (res.data.success) {
                  alert("Success! Thank you.");
                  navigation.navigate("Home");
                  setClubObj({});
                } else {
                  navigation.navigate("Home");
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
