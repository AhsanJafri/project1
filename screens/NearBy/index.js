import {FontAwesome5} from "@expo/vector-icons";
import React, {useLayoutEffect, useState, useEffect} from "react";
import {StyleSheet, Text, View, Dimensions, Image} from "react-native";
import {Button} from "react-native-elements";
import {Switch} from "react-native-gesture-handler";

import {selectUsers as SU} from "../../redux/features/usersSlice";
import {useDispatch, useSelector} from "react-redux";
import * as Location from "expo-location";
import {db} from "../../firebase";
import {
  selectUser,
  selectUserInfo,
  setUserInfo,
  selectUsers,
} from "../../redux/features/userSlice";
import MapView, {Marker} from "react-native-maps";
import {ActivityIndicator} from "react-native";

var img =
  "https://cdn.pixabay.com/photo/2013/07/13/10/07/man-156584_960_720.png";

const index = ({navigation}) => {
  const users = useSelector(selectUser);
  const [locationLat, setLocationLat] = useState(0);
  const [locationLong, setLocationLong] = useState(0);
  const userList = useSelector(SU);

  const [UserWithLocatio, setuserWithLocatio] = useState(
    userList.filter((item) => {
      if (item.lat && item.long) {
        return item;
      }
    })
  );

  console.log("UserList", UserWithLocatio);
  const [loading, setLoading] = useState(false);
  console.log("User", users);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Near By People",
      headerTitleAlign: "center",
    });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let {status} = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log("location", location);
      setLocationLat(location.coords.latitude);
      setLocationLong(location.coords.longitude);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {})();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color="red" size={33} />
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: locationLat,
            longitude: locationLong,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {UserWithLocatio.map((item) => {
            return (
              <Marker
                coordinate={{
                  latitude: parseFloat(item.lat),
                  longitude: parseFloat(item.long),
                }}
                onPress={() => navigation.navigate("UserProfile", {user: item})}
                title={item.displayName}
              >
                <Image
                  source={{uri: users.photoURL ? users.photoURL : img}}
                  style={{height: 50, width: 50}}
                />
              </Marker>
            );
          })}
          <Marker
            coordinate={{latitude: locationLat, longitude: locationLong}}
            title={"You"}
          >
            <Image
              source={{uri: users.photoURL ? users.photoURL : img}}
              style={{height: 50, width: 50}}
            />
          </Marker>
        </MapView>
      )}
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
