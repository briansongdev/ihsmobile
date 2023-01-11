import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Text } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import Carousel, { Pagination } from "react-native-snap-carousel";
import { MaterialCommunityIcons } from "@expo/vector-icons";
export const AppButton = ({ onPress, title, icon, disabled }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={!disabled ? styles.appButtonContainer : styles.appButtonContainer1}
    disabled={disabled}
  >
    {icon ? (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons
          name="account-plus-outline"
          size={24}
          color="white"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.appButtonText}>{title}</Text>
      </View>
    ) : (
      <Text style={styles.appButtonText}>{title}</Text>
    )}
  </TouchableOpacity>
);

export const SLIDER_WIDTH = Dimensions.get("window").width - 20;
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.7);

export default function WelcomeGuide({ navigation }) {
  const data = [
    {
      title: "Shop.",
      body: "Get the latest Vaquero wear effortlessly and conveniently.",
      imgUrl: "https://i.imgur.com/XzH5s6x.png",
    },
    {
      title: "Vaquero Events.",
      body: "Get caught up on the great work our athletes are involved in!",
      imgUrl: "https://i.imgur.com/1YQRF5E.png",
    },
    {
      title: "Schedule.",
      body: "Your classes for the day, dynamically updating as you finish periods. Never miss a class (literally!)",
      imgUrl: "https://i.imgur.com/Xc0c5xc.png",
    },
    {
      title: "Calendar.",
      body: "Plan events and receive notifications when it's time. Easy and effortless.",
      imgUrl: "https://i.imgur.com/gmG5k2e.png",
    },
    {
      title: "Bookmarks.",
      body: "Stash your passions and your necessities as bookmarks you can always travel to instantly.",
      imgUrl: "https://i.imgur.com/2ro4dQe.png",
    },
  ];

  const CarouselCardItem = ({ item, index }) => {
    return (
      <View style={styles.container} key={index}>
        <Image source={{ uri: item.imgUrl }} style={styles.image} />
        <Text style={styles.header}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
      </View>
    );
  };
  const [index, setIndex] = useState(2);
  const isCarousel = useRef(null);
  useEffect(() => {
    const hi = async () => {
      navigation.setOptions({
        title: "Welcome, " + (await SecureStore.getItemAsync("trueName")) + ".",
      });
    };
    hi();
  }, []);
  return (
    <View style={styles.topContainer}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ alignItems: "center" }}
      >
        <Text
          variant="labelLarge"
          style={{ marginRight: 20, marginLeft: "3%", marginBottom: 20 }}
        >
          Welcome to IHS Students! Check out our diverse features.
        </Text>
        <View style={{ paddingVertical: 20 }}>
          <Pagination
            dotsLength={data.length}
            carouselRef={isCarousel}
            activeDotIndex={index}
            dotStyle={{
              width: 10,
              height: 10,
              borderRadius: 5,
              marginHorizontal: 0,
              backgroundColor: "rgba(0, 0, 0, 0.92)",
            }}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
            tappableDots={true}
          />
          <Carousel
            firstItem={2}
            layout="default"
            data={data}
            renderItem={CarouselCardItem}
            sliderWidth={SLIDER_WIDTH}
            itemWidth={ITEM_WIDTH}
            inactiveSlideShift={0}
            ref={isCarousel}
            onSnapToItem={(index) => setIndex(index)}
            useScrollView={true}
          />
        </View>
      </ScrollView>
      <Text variant="labelLarge" style={{ margin: 10 }}>
        Let's get started!
      </Text>
      <AppButton
        onPress={async () => {
          await SecureStore.setItemAsync("newUser", "false");
          navigation.navigate("HomePage");
        }}
        title="Continue"
      />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 8,
    width: ITEM_WIDTH,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
  },
  image: {
    width: ITEM_WIDTH,
    height: 215,
  },
  header: {
    color: "#222",
    fontSize: 28,
    fontWeight: "bold",
    paddingLeft: 20,
    paddingTop: 20,
  },
  body: {
    color: "#222",
    fontSize: 18,
    paddingLeft: 20,
    paddingRight: 20,
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
  appButtonContainer: {
    elevation: 8,
    backgroundColor: "teal",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 50,
    width: 330,
    height: 55,
    justifyContent: "center",
  },
  appButtonContainer1: {
    elevation: 8,
    backgroundColor: "gray",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 50,
    width: 330,
    height: 55,
    justifyContent: "center",
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
  },
});
