import React from "react";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native-paper";

function TextLinearGradient(props) {
  return (
    <MaskedView
      maskElement={
        <Text
          variant="headlineMedium"
          style={{ fontWeight: "bold" }}
          {...props}
        />
      }
    >
      <LinearGradient
        locations={[0, 1]}
        colors={["#20BF55", "#01BAEF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text
          style={{ opacity: 0, fontWeight: "bold" }}
          variant="headlineMedium"
        >
          {props.children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

function VibrantLinearGradient(props) {
  return (
    <MaskedView
      maskElement={<Text style={{ fontWeight: "bold" }} {...props} />}
    >
      <LinearGradient
        locations={[0, 1]}
        colors={["#B58ECC", "#5DE6DE"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={{ opacity: 0, fontWeight: "bold" }} {...props}>
          {props.children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

function VibrantLinearGradient2(props) {
  return (
    <MaskedView
      maskElement={
        <Text
          style={{ marginLeft: "5%", marginBottom: 10, fontWeight: "bold" }}
          {...props}
        />
      }
    >
      <LinearGradient
        locations={[0, 1]}
        colors={["#ffd580", "#e000ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text
          style={{
            marginLeft: "5%",
            marginBottom: 10,
            opacity: 0,
            fontWeight: "bold",
          }}
          {...props}
        >
          {props.children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

export { TextLinearGradient, VibrantLinearGradient, VibrantLinearGradient2 };
