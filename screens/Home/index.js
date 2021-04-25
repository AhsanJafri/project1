import React, {useEffect, useLayoutEffect, useState} from "react";
import {Text, View} from "react-native";
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import * as firebase from "firebase";
import Header from "../../components/Header";
import Posts from "../../components/Posts";
import {db} from "../../firebase";
import moment from "moment";
import {FlatList} from "react-native";
import BottomSheet from "reanimated-bottom-sheet";
import {useSelector} from "react-redux";
import {TouchableOpacity} from "react-native-gesture-handler";
import {selectUser} from "../../redux/features/userSlice";
import * as Updates from "expo-updates";
import {styles} from "../Home/styles";

const Home = ({navigation}) => {
  const [posts, setPosts] = useState([]);
  const sheetRef = React.useRef(null);
  const user = useSelector(selectUser);
  const firebaseUser = firebase?.auth().currentUser;
  const [userID, setUserID] = useState(null);
  const [postID, setPostID] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);

  const [newPosts, setNewPosts] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user || firebaseUser) {
      db.collection("users")
        .doc(user?.uid || firebaseUser?.uid)
        .collection("friends")
        .onSnapshot((snapshot) =>
          snapshot.docs.map((doc) => {
            var uid = doc.id;
            db.collection("posts")
              .doc(uid)
              .collection("userPosts")
              .orderBy("timestamp", "desc")
              .onSnapshot((snapshot) =>
                snapshot.docs.map((doc) =>
                  setNewPosts((prev) => [
                    ...prev,
                    {
                      id: doc.id,
                      data: doc.data(),
                      uid: uid,
                    },
                  ])
                )
              );
          })
        );
      db.collection("posts")
        .doc(user?.uid || firebaseUser?.uid)
        .collection("userPosts")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) =>
          snapshot.docs.map((doc) =>
            setNewPosts((prev) => [
              ...prev,
              {
                id: doc.id,
                data: doc.data(),
                uid: user?.uid || firebaseUser?.uid,
              },
            ])
          )
        );
    }
  }, []);

  function getUnique(arr, index) {
    const unique = arr
      .map((e) => e[index])
      .map((e, i, final) => final.indexOf(e) === i && i)
      .filter((e) => arr[e])
      .map((e) => arr[e]);

    return unique;
  }

  useEffect(() => {
    setPosts(getUnique(newPosts, "id"));
  }, [newPosts]);

  useEffect(() => {
    if (open) {
      sheetRef.current.snapTo(0);
    }
  }, [open]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Socially",
    });
  }, []);

  useEffect(() => {
    if (postID) {
      db.collection("users")
        .doc(user?.uid)
        .collection("bookmarks")
        .doc(postID)
        .get()
        .then((doc) => {
          if (doc.exists) {
            console.log("exists");
            setBookmarked(true);
          } else {
            console.log("not exists");
          }
        });
    }
  }, [postID]);

  const handleAddToBookmarks = () => {
    if (postID && userID) {
      if (!bookmarked && postID) {
        db.collection("users")
          .doc(user?.uid)
          .collection("bookmarks")
          .doc(postID)
          .set({
            postId: postID,
            userId: userID,
          });
        setBookmarked(true);
      } else {
        db.collection("users")
          .doc(user?.uid)
          .collection("bookmarks")
          .doc(postID)
          .delete()
          .then(() => {
            setBookmarked(false);
          });
      }
    } else {
      console.log("no");
    }
  };

  const handleDelete = async () => {
    if (postID && userID) {
      if (userID === user?.uid) {
        db.collection("posts")
          .doc(userID)
          .collection("userPosts")
          .doc(postID)
          .collection("comments")
          .onSnapshot((snapshot) =>
            snapshot.docs.map((doc) => {
              var uid = doc.id;
              db.collection("posts")
                .doc(userID)
                .collection("userPosts")
                .doc(postID)
                .collection("comments")
                .doc(uid)
                .delete()
                .then(() => {
                  console.log("deleted");
                })
                .catch((err) => console.log("err", err));
            })
          );
        db.collection("posts")
          .doc(userID)
          .collection("userPosts")
          .doc(postID)
          .delete()
          .then(() => {
            console.log("delted");
          })
          .catch((err) => console.log("err", err));
      } else {
        console.log("no match");
      }
      await Updates.reloadAsync();
      sheetRef.current.snapTo(2);
    }
  };

  const renderContent = () => {
    return (
      <View style={{backgroundColor: "#ECECEC", padding: 16, height: "100%"}}>
        <View
          style={{
            width: 30,
            alignSelf: "center",
            backgroundColor: "#49cbe9",
            margin: 10,
            height: 7,
            borderRadius: 10,
          }}
        />
        <TouchableOpacity
          onPress={() => handleAddToBookmarks()}
          style={{flexDirection: "row", margin: 10}}
        >
          {bookmarked ? (
            <FontAwesome
              color="#49cbe9"
              style={{marginHorizontal: 10, fontWeight: "bold"}}
              name="bookmark"
              size={24}
            />
          ) : (
            <FontAwesome
              color="#49cbe9"
              style={{marginHorizontal: 10, fontWeight: "bold"}}
              name="bookmark-o"
              size={24}
            />
          )}
          <Text
            style={{
              color: "#49cbe9",
              fontSize: 18,
              flex: 1,
              fontWeight: "bold",
            }}
          >
            {!bookmarked ? "Add to" : "Remove from"} bookmarks
          </Text>
        </TouchableOpacity>
        {userID === user?.uid ? (
          <TouchableOpacity
            onPress={() => handleDelete()}
            style={{flexDirection: "row", margin: 10}}
          >
            <AntDesign
              style={{marginHorizontal: 10, fontWeight: "bold"}}
              name="delete"
              size={24}
              color="#49cbe9"
            />
            <Text
              style={{
                color: "#49cbe9",
                fontSize: 18,
                flex: 1,
                fontWeight: "bold",
              }}
            >
              Delete
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <Posts
            postId={item.id}
            key={item.id}
            open={open}
            setUserID={setUserID}
            setPostID={setPostID}
            setOpen={setOpen}
            uid={item.uid}
            image={item.data?.image}
            video={item?.data?.videos || ""}
            text={item.data?.text}
            timestamp={moment(
              new Date(item.data?.timestamp?.seconds * 1000).toUTCString()
            ).fromNow()}
            resharedBy={item.data?.resharedBy || []}
            likedBy={item?.data?.likedBy || []}
          />
        )}
        ListHeaderComponent={() => <Header />}
      />
      <BottomSheet
        ref={sheetRef}
        snapPoints={[450, 300, 0]}
        borderRadius={10}
        initialSnap={2}
        renderContent={renderContent}
      />
    </View>
  );
};

export default Home;
