import React, {useState, useEffect, useRef, useLayoutEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Animated,
  PanResponder,
  Platform,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image
} from 'react-native';
import {TabView, TabBar} from 'react-native-tab-view';
import { Octicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import HeaderComp from '../../components/HeaderComp';
import { db } from '../../firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { selectUser } from '../../redux/features/userSlice';
 
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const TabBarHeight = 48;
const HeaderHeight = 300;
const SafeStatusBar = Platform.select({
  ios: 44,
  android: StatusBar.currentHeight,
});
const tab1ItemSize = (windowWidth - 30) / 2;
const tab2ItemSize = (windowWidth - 40) / 3;

const UserProfile = ({navigation, route}) => {
  /**
   * stats
   */
	const user = route?.params?.user;
	const currentUser =useSelector(selectUser);
// 
 
  const [tabIndex, setIndex] = useState(0);
const [routes] = useState([
    {key: 'tab1', title:'Posts'},
    {key: 'tab2', title: 'Mentions'},
    {key: 'tab3', title: 'Compliments'}
  ]);
  const [canScroll, setCanScroll] = useState(true);
 
  const [posts, setPosts] = useState([]);
  const [mentionedPosts, setMentionedPosts] = useState([]);
  const [compliments, setCompliments] = useState([]);
  useEffect(() =>{
	db.collection("posts").doc(user?.uid).collection("userPosts").onSnapshot((snapshot) =>{
		setPosts(snapshot.docs.map((doc) =>({
			id: doc.id,
			data: doc.data()
		})))
	})
},[]);


useEffect(() =>{
  db.collection("users").doc(user?.uid).collection("compliments").onSnapshot((snapshot) =>
    setCompliments(snapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data()
    })))
  )
},[])



useEffect(() =>{
	db.collection("users").doc(user?.uid).collection("mentions").onSnapshot((snapshot) =>
		snapshot.docs.map((doc) =>{
			db.collection("posts").doc(doc.data().userId).collection("userPosts").doc(doc.data().postId).get().then((doc) =>
				setMentionedPosts(prev => [...prev,{
					id: doc.id,
					data: doc.data()
				}])	
			)
		})
	
	)
},[])

// console.log('mentioned posts-->',mentionedPosts);

const handlePress =(posts,index) => {
	navigation.navigate("PostList", {userId: user?.uid, posts: posts, index:index})
}

  useLayoutEffect(() =>{
	navigation.setOptions({
		headerTitle: "User Followers",

	})
},[navigation]);

  /**
   * ref
   */
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerScrollY = useRef(new Animated.Value(0)).current;
  const listRefArr = useRef([]);
  const listOffset = useRef({});
  const isListGliding = useRef(false);
  const headerScrollStart = useRef(0);
  const _tabIndex = useRef(0);

  /**
   * PanResponder for header
   */
  const headerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,
      onStartShouldSetPanResponder: (evt, gestureState) => {
        headerScrollY.stopAnimation();
        syncScrollOffset();
        return false;
      },

      onMoveShouldSetPanResponder: (evt, gestureState) => {
        headerScrollY.stopAnimation();
        return Math.abs(gestureState.dy) > 5;
      },

      onPanResponderRelease: (evt, gestureState) => {
        syncScrollOffset();
        if (Math.abs(gestureState.vy) < 0.2) {
          return;
        }
        headerScrollY.setValue(scrollY._value);
        Animated.decay(headerScrollY, {
          velocity: -gestureState.vy,
          useNativeDriver: true,
        }).start(() => {
          syncScrollOffset();
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        listRefArr.current.forEach((item) => {
          if (item.key !== routes[_tabIndex.current].key) {
            return;
          }
          if (item.value) {
            item.value.scrollToOffset({
              offset: -gestureState.dy + headerScrollStart.current,
              animated: false,
            });
          }
        });
      },
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        headerScrollStart.current = scrollY._value;
      },
    }),
  ).current;

  /**
   * PanResponder for list in tab scene
   */
  const listPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,
      onStartShouldSetPanResponder: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        headerScrollY.stopAnimation();
        return false;
      },
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        headerScrollY.stopAnimation();
      },
    }),
  ).current;

  /**
   * effect
   */
  useEffect(() => {
    scrollY.addListener(({value}) => {
      const curRoute = routes[tabIndex].key;
      listOffset.current[curRoute] = value;
    });

    headerScrollY.addListener(({value}) => {
      listRefArr.current.forEach((item) => {
        if (item.key !== routes[tabIndex].key) {
          return;
        }
        if (value > HeaderHeight || value < 0) {
          headerScrollY.stopAnimation();
          syncScrollOffset();
        }
        if (item.value && value <= HeaderHeight) {
          item.value.scrollToOffset({
            offset: value,
            animated: false,
          });
        }
      });
    });
    return () => {
      scrollY.removeAllListeners();
      headerScrollY.removeAllListeners();
    };
  }, [routes, tabIndex]);

  /**
   *  helper functions
   */
  const syncScrollOffset = () => {
    const curRouteKey = routes[_tabIndex.current].key;

    listRefArr.current.forEach((item) => {
      if (item.key !== curRouteKey) {
        if (scrollY._value < HeaderHeight && scrollY._value >= 0) {
          if (item.value) {
            item.value.scrollToOffset({
              offset: scrollY._value,
              animated: false,
            });
            listOffset.current[item.key] = scrollY._value;
          }
        } else if (scrollY._value >= HeaderHeight) {
          if (listOffset.current[item.key] < HeaderHeight || listOffset.current[item.key] == null) {
            if (item.value) {
              item.value.scrollToOffset({
                offset: HeaderHeight,
                animated: false,
              });
              listOffset.current[item.key] = HeaderHeight;
            }
          }
        }
      }
    });
  };

  const onMomentumScrollBegin = () => {
    isListGliding.current = true;
  };

  const onMomentumScrollEnd = () => {
    isListGliding.current = false;
    syncScrollOffset();
  };

  const onScrollEndDrag = () => {
    syncScrollOffset();
  };

  /**
   * render Helper
   */
  const renderHeader = () => {
    const y = scrollY.interpolate({
      inputRange: [0, HeaderHeight],
      outputRange: [0, -HeaderHeight],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View
        {...headerPanResponder.panHandlers}
        style={[styles.header, {transform: [{translateY: y}]}]}>
        {/* <TouchableOpacity
          style={{flex: 1, justifyContent: 'center'}}
          activeOpacity={1}
          onPress={() => Alert.alert('header Clicked!')}>
          <Text>Scrollable Header</Text> */}
		   <HeaderComp user={user} />
        {/* </TouchableOpacity> */}
      </Animated.View>
    );
  };

  const rednerTab1Item = ({item, index}) => {
    return (
		<View>
			{item?.data?.image?.length > 0 ? (
				// console.log('postid00>',item),
				<TouchableOpacity onPress={() =>handlePress(posts,index)} activeOpacity={0.7} style={{ marginLeft: index % 2 === 0 ? 0 : 10,marginBottom: 10,marginRight: 7}}>
					<Image
						source={{ uri: item?.data?.image?.[0] }}
						style={{ height: tab1ItemSize, width: tab1ItemSize, borderRadius: 16 }}
					/>
				</TouchableOpacity>
			) : null}
		</View>
    );
  };

  const rednerTab2Item = ({item, index}) => {
    return (
		<View>
		{item?.data?.image?.length > 0 ? (
			// console.log('postid00>',item),
			<TouchableOpacity activeOpacity={0.7} style={{ marginLeft: index % 2 === 0 ? 0 : 10,marginBottom: 10,marginRight: 7}}>
				<Image
					source={{ uri: item?.data?.image?.[0] }}
					style={{ height: tab1ItemSize, width: tab1ItemSize, borderRadius: 16 }}
				/>
			</TouchableOpacity>
		) : null}
	</View>
    );
  };

  const renderTab3Item = ({item,index}) =>{
    return (
        <View>
            <TouchableOpacity activeOpacity={0.7} style={{ marginLeft: index % 2 === 0 ? 0 : 10,marginBottom: 10,marginRight: 7, flexDirection: "column", alignItems:"center"}}>
                <Text style={{alignSelf:"flex-start", fontWeight:"bold", fontSize: 18}}>{item?.data?.sentBy?.displayName} :</Text>
                <Image
                    source={{uri: item?.data?.emoji?.url}}
                    style={{ height: tab1ItemSize, width: tab1ItemSize, borderRadius: 16 }}
                />
                <Text style={{fontSize: 18}}>{item?.data?.message}</Text>
            </TouchableOpacity>
        </View>
    )
}

const If = ({ condition, children }) => {
  if (condition) {
    return children;
  }else{
      return(
          <View>
          </View>
      )
  }
};
  const renderLabel = ({route, focused}) => {
    return (
    //   <Text style={[styles.label, {opacity: focused ? 1 : 0.5}]}>
    //     {route.title}{' '}
		// {route.title === 'Posts' ? <MaterialCommunityIcons name="collage" size={24} color="black" /> : <Octicons name="mention" size={24} color="black" />}
    //   </Text>
    <>
    <If condition={route.title === "Posts"}>
      <Text style={[styles.label, {opacity: focused ? 1 : 0.5}]}>
          <MaterialCommunityIcons name="collage" size={24} color="black" />
      </Text>
    </If>
    <If condition={route.title === "Mentions"}>
      <Text style={[styles.label, {opacity: focused ? 1 : 0.5}]}>
          <Octicons name="mention" size={24} color="black" />
      </Text>
    </If>
    <If condition={route.title === "Compliments"}>
        <Text style={[styles.label, {opacity: focused ? 1 : 0.5}]}>
            <MaterialCommunityIcons name="human-greeting" size={24} color="black" />
        </Text>
    </If>
  </>
    );
  };

  const renderScene = ({route}) => {
    const focused = route.key === routes[tabIndex].key;
    let numCols;
    let data;
    let renderItem;
    switch (route.key) {
      case 'tab1':
        numCols = 2;
        data = posts;
        renderItem = rednerTab1Item;
        break;
      case 'tab2':
        numCols = 3;
        data = mentionedPosts;
        renderItem = rednerTab2Item;
        break;
        case 'tab3':
          numCols = 3;
          data = compliments;
          renderItem = renderTab3Item;
          break;
      default:
        return null;
    }
    return (
      <Animated.FlatList
        // scrollEnabled={canScroll}
        {...listPanResponder.panHandlers}
        numColumns={numCols}
        ref={(ref) => {
          if (ref) {
            const found = listRefArr.current.find((e) => e.key === route.key);
            if (!found) {
              listRefArr.current.push({
                key: route.key,
                value: ref,
              });
            }
          }
        }}
        scrollEventThrottle={16}
        onScroll={
          focused
            ? Animated.event(
                [
                  {
                    nativeEvent: {contentOffset: {y: scrollY}},
                  },
                ],
                {useNativeDriver: true},
              )
            : null
        }
        onMomentumScrollBegin={onMomentumScrollBegin}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        ItemSeparatorComponent={() => <View style={{height: 10}} />}
        ListHeaderComponent={() => <View style={{height: 10}} />}
        contentContainerStyle={{
          paddingTop: HeaderHeight + TabBarHeight,
          paddingHorizontal: 10,
          minHeight: windowHeight - SafeStatusBar + HeaderHeight,
        }}
        showsHorizontalScrollIndicator={false}
        data={data}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  };

  const renderTabBar = (props) => {
    const y = scrollY.interpolate({
      inputRange: [0, HeaderHeight],
      outputRange: [HeaderHeight, 0],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View
        style={{
          top: 0,
          zIndex: 1,
          position: 'absolute',
          transform: [{translateY: y}],
          width: '100%',
        }}>
        <TabBar
          {...props}
          onTabPress={({route, preventDefault}) => {
            if (isListGliding.current) {
              preventDefault();
            }
          }}
          style={styles.tab}
          renderLabel={renderLabel}
          indicatorStyle={styles.indicator}
        />
      </Animated.View>
    );
  };

  const renderTabView = () => {
    return (
      <TabView
        onSwipeStart={() => setCanScroll(false)}
        onSwipeEnd={() => setCanScroll(true)}
        onIndexChange={(id) => {
          _tabIndex.current = id;
          setIndex(id);
        }}
        navigationState={{index: tabIndex, routes}}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        initialLayout={{
          height: 0,
          width: windowWidth,
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderTabView()}
      {renderHeader()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HeaderHeight,
    width: '100%',
    // alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: '#ffffff',
  },
  label: {
	  fontSize: 16, 
	  color: '#222', 
	  alignItems:"center", 
	  flexDirection:"row"
},
  tab: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: '#FFCC80',
    height: TabBarHeight,
  },
  indicator: {backgroundColor: '#222'},
 
});

export default UserProfile;

 