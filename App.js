import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Login from './screens/Login';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute, NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MobileVerification from './screens/MobileVerification';
import Home from './screens/Home';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Comment from './screens/Comment';
import Notifications from './screens/Notifications';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import * as firebase from 'firebase' 
import FlashMessage from "react-native-flash-message";
import _ from 'lodash';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import Search from './screens/Search';
import Profile from './screens/Profile';
import { Avatar } from 'react-native-elements'
import { auth, db } from './firebase';
import { useDispatch, useSelector } from 'react-redux';
import  {login ,logout, selectUser, setStats, setUserInfo} from './redux/features/userSlice';
import { Provider } from 'react-redux';
import store from './redux/app/store';
import AddPost from './screens/AddPost';
import { LogBox } from 'react-native';
import FilterImage from './screens/FilterImage';
import ImageBrowserScreen from './screens/ImageBrowser';
import Story from './screens/Story';
import { addUsers, selectUsers } from './redux/features/usersSlice';
import UserProfile from './screens/UserProfile';
import { Feather } from '@expo/vector-icons';
import ViewProfile from './screens/ViewProfile';
import ChatScreen from './screens/ChatScreen';
import ChatList from './screens/ChatList';
import UserFollowers from './screens/UserFollowers';
import ProfileSettings from './screens/ProfileSettings';
import CreateGroup from './screens/CreateGroup';
import GroupSettings from './screens/GroupSettings';
// import GroupImage from './screens/GroupImage';
import Invite from './screens/Invite';
import GroupProfile from './screens/GroupProfile';
import GroupProfileSettings from './screens/GroupProfileSettings';
import Sidebar from './customDrawer';
import Settings from './screens/Settings';
import SearchList from './screens/SearchList';
import { addPages } from './redux/features/pagesSlice';
import Reshare from './screens/Reshare';
import Activities from './screens/Activities';
import ProfileView from './screens/ProfileView';
import AddTodo from './screens/AddTodo';
import EditTodo from './screens/EditTodo';
import Compliment from './screens/Compliment';
import ViewPost from './screens/ViewPost';
import PostList from './screens/PostList';
import CameraPreview from './screens/CameraPreview';
import PrivateAccount from './screens/PrivateAccount';
import { addPost } from './redux/features/postSlice';
import { addFriend } from './redux/features/friendSlice';
import PrivacyPolicy from './screens/PrivacyPolicy';
import ContactUs from './screens/ContactUs';

const Stack = createStackNavigator();
const HomeStack = createBottomTabNavigator();
var authUser = firebase.auth().currentUser;
LogBox.ignoreLogs(["Setting a timer","Can't perform a React state update on an unmounted component", "value provided is not in a recognized RFC2822 or ISO format"])




function getHeaderTitle(route) {
	const routeName = getFocusedRouteNameFromRoute(route) ?? 'Socially';
	switch (routeName) {
	  case 'Home':
		return 'Socially';
	  case 'Settings':
		return 'Settings';
	  case 'Find People':
		return 'Find People';
	  case 'Profile': 
		return authUser?.displayName || "user"
	  case 'Post':
		return 'Add a Post';
	  case 'Notification':
		  return 'Notification';
	}
  }

 
  const PostStack = createStackNavigator();

  const PostNavigator = () =>{
	return(
		<PostStack.Navigator>
			<PostStack.Screen name="Post" component={AddPost} options={{ headerShown: false}}/>
			<PostStack.Screen name="FilterImage" component={FilterImage} options={{ headerShown: false}}/>
			<PostStack.Screen name="ImageBrowser" component={ImageBrowserScreen} />
			<PostStack.Screen name="Reshare" component={Reshare} />
		</PostStack.Navigator>
	)
  }

  const SearchStack = createStackNavigator();

  const SearchNavigator = () =>{
	  return(
		  <SearchStack.Navigator>
			  <SearchStack.Screen name="Search" options={{headerTitle: "Search", headerTitleAlign: "center"}} component={Search} />
			  <SearchStack.Screen name="UserProfile" component={UserProfile} options={{ headerTitleAlign: "center"}} />
			  <Stack.Screen name="SearchList" component={SearchList} options={{ headerTitleAlign: "center"}} />
			  <Stack.Screen name="Compliment" component={Compliment}  />
			  <Stack.Screen name="PostList" component={PostList} />
			<Stack.Screen name="UserFollowers" component={UserFollowers} />

		  </SearchStack.Navigator>
	  )
  }
 
  const NotificationStack = createStackNavigator();
  const NotificationNavigator = () => {
	return(
	<NotificationStack.Navigator>
		<NotificationStack.Screen name="Notification" component={Notifications} />
		<NotificationStack.Screen name="ViewProfile" component={ViewProfile} /> 
		<NotificationStack.Screen name="Activities" component={Activities} />
		<NotificationStack.Screen name="ProfileViewers" component={ProfileView} />
		<NotificationStack.Screen name='ViewPost' component={ViewPost} />
	</NotificationStack.Navigator>
	)
}


const ProfileStack = createStackNavigator();

const Drawer = createDrawerNavigator();

const ProfileSettingsStack = createStackNavigator();

const ProfileSettingsNavigator = () =>{
	return(
		<ProfileSettingsStack.Navigator>
			<ProfileStack.Screen name="ProfileSettings" component={ProfileSettings} />
		</ProfileSettingsStack.Navigator>
	)
}

const CreateGroupStack = createStackNavigator();

const CreateGroupNavigator = () =>{
	return(
		<CreateGroupStack.Navigator>
			<CreateGroupStack.Screen name="CreateGroup" component={CreateGroup} />
			<CreateGroupStack.Screen name="GroupSettings" component={GroupSettings} />
			{/* <CreateGroupStack.Screen name="GroupImage" component={GroupImage} /> */}
			<CreateGroupStack.Screen name="Invite" component={Invite} />
		</CreateGroupStack.Navigator>
	)
}
 

const PageStack = createStackNavigator();

const PageNavigator = () =>{
	return(
		<PageStack.Navigator>
			<PageStack.Screen name="Settings" component={Settings} />
			<PageStack.Screen name="GroupProfile" component={GroupProfile}
					options={{
						drawerLabel: "Page Profile",
						drawerIcon:() =>(
							<FontAwesome name="group" size={24} color="black" />
						),
					}}
				
				/>
				<PageStack.Screen name="GroupProfileSettings" component={GroupProfileSettings}
					options={{
						drawerLabel: "Page Profile Settings",
						drawerIcon: () =>(
							<Feather name="settings" size={24} color="black" />
						),
					}}
				/>
			<PageStack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={{
				 drawerLabel:"Privacy Policy"
			 }} />
			 <PageStack.Screen name="ContactUs" component={ContactUs} options={{
				 drawerLabel:"Contact Us"
			 }} />
	</PageStack.Navigator>
		)
}

const TodoStack = createStackNavigator();

const TodoNavigator =() =>{
	return(
		<TodoStack.Navigator>
			<TodoStack.Screen name="AddTodo" component={AddTodo} />
			<TodoStack.Screen name="EditTodo" component={EditTodo} />
		</TodoStack.Navigator>
	)
}

const PrivateAccountStack = createStackNavigator();

const PrivateAccountNavigator = () =>{
	return(
		<PrivateAccountStack.Navigator>
			<PrivateAccountStack.Screen name="PrivateAccount" component={PrivateAccount} />
		</PrivateAccountStack.Navigator>
	)
}

const DrawerNavigator = () =>{
	 
	return(
		<Drawer.Navigator drawerContent={props => <Sidebar {...props} />}>
			<Drawer.Screen name="Profile" component={ProfileNavigator} 
				options={{
					drawerIcon:() =>(
						<MaterialIcons name="person-outline" size={24} color="black" />
					)
				}}
			/>
			<Drawer.Screen name="ProfileSettings" component={ProfileSettingsNavigator} options={{
				drawerLabel: "Profile Settings",
				drawerIcon: () =>(
					<Feather name="settings" size={24} color="black" />
				),
				headerTitle: "Profile Settings"
			}}
			 />
			 <Drawer.Screen name="CreateGroup" component={CreateGroupNavigator}
			 	options={{
					 drawerLabel: "Create Page",
					 drawerIcon:() =>(
						<AntDesign name="addusergroup" size={24} color="black" />
					 )
				 }}
			 />
			 <Drawer.Screen name="AddTodo" component={TodoNavigator} options={{
				 drawerLabel: "Add Todos",
				 drawerIcon: () =>(
					<Entypo name="add-to-list" size={24} color="black" />
				 )
			 }} />
			 <Drawer.Screen name="PrivateAccount" component={PrivateAccountNavigator} options={{
				 drawerLabel: "Private Account",
				 drawerIcon: () =>(
					<FontAwesome5 name="user-lock" size={24} color="black" />
				 )
			 }} />

		</Drawer.Navigator>
	)
}

const ProfileNavigator = ({navigation}) =>{

	return (
		<ProfileStack.Navigator >
			<ProfileStack.Screen name="Profile" component={Profile} options={{
				headerRight: () => 
				(	
				<TouchableOpacity style={{margin: 10}} onPress={() => navigation.openDrawer()}>
					<Entypo name="menu" size={28} color="black" />
				</TouchableOpacity>
				)
			}} />
			<ProfileStack.Screen name="UserFollowers" component={UserFollowers} />
			<ProfileStack.Screen name="Settings" component={PageNavigator} options={{headerShown: false}} />
		</ProfileStack.Navigator>
	)
}

  function HomeNavigatorStack({navigation, route}) {
	const dispatch = useDispatch();
	const user = useSelector(selectUser);
	const users = useSelector(selectUsers);
	const [likes, setLikes] = useState(0);
	const [following, setFollowing] = useState([]);
	const [followers, setFollowers] = useState([]);
	const [newPosts, setNewPosts] = useState([]);
	const [friends,setFriends] = useState([]);
 
	useEffect(() =>{
		const unsubscribe = auth.onAuthStateChanged((authUser) => {
			if(authUser){
				dispatch(login({
				  uid: authUser?.uid,
				  photoURL: authUser?.photoURL || null,
				  email: authUser?.email || '',
				  displayName: authUser?.displayName || '',
				 
				}));
				
				
			}else{
			  dispatch(logout());
			} 
		});
		return unsubscribe;
	  },[dispatch]);


	  useEffect(() =>{
		   const unsubscribe =  db.collection('posts').onSnapshot((snapshot) =>{ 
			snapshot.docs.map((doc) =>{
				var uid = doc.id;
				db.collection('posts').doc(uid).collection('userPosts').orderBy('timestamp','desc').onSnapshot((snapshot) =>
					snapshot.docs.map((doc) =>(
							setNewPosts(prev => [...prev,	
									{
										id: doc.id,
										data: doc.data(),
										uid: uid
									}
									
								]
									))
								)

					)
			 
				})
			
		})
	return unsubscribe;
	  },[]);

	  useEffect(() =>{
		if(newPosts){
			dispatch(addPost(
				newPosts.map((post) => 
				({
					id: post.id,
					uid: post.uid,
					image: post.data.image
				}))
			))
		}
	  },[newPosts])

 
	  useEffect(() =>{
		if(user || authUser){
			db.collection("posts").doc(user?.uid || authUser?.uid).set({
				displayName: user?.displayName || authUser?.displayName || '',
				userImg: user?.photoURL || authUser?.photoURL || ''
			}).then(() => console.log('profile updated'));

			db.collection("users").doc(authUser?.uid || user?.uid ).set({
				displayName: user?.displayName || authUser?.displayName || '',
				email: user?.email || authUser?.email || '',
				photoURL: user?.photoURL ||authUser?.photoURL || null,
				uid: user?.uid || authUser?.uid,
				 
			})
		}
	  },[user]);

	  useEffect(() =>{
		if(users)
		{
			users.map((u) =>
			db.collection("users").doc(u?.uid).collection("page").onSnapshot((snapshot) =>
				dispatch(addPages(snapshot.docs.map((doc) =>({
					id: doc.id,
					name: doc.data().name,
					description: doc.data().description,
					invite: doc.data().invite,
					privacy:doc.data().privacy,
					types: doc.data().types,
					uid: u?.uid,
					website: doc.data().website || '',
					location:doc.data().location || [],
					bio: doc.data().bio || ''
				}))))
			)
		)}
		},[users]);


	  useEffect(() =>{
		db.collection('users').onSnapshot((snapshot) => {
            dispatch(addUsers(snapshot.docs.map((doc) => doc.data())));
        });
	  },[]);


	  useEffect(() =>{
		if(user || authUser){
			db.collection("users").doc(user?.uid || authUser?.uid).collection("friends").onSnapshot((snapshot) =>{
				setFollowing(snapshot?.docs?.map((doc) =>
					 ({
						 id: doc.id,
						 displayName: doc?.data()?.displayName || '',
						 photoURL: doc?.data().photoURL || null,
						 timestamp: doc.data().timestamp
					 })
				 ))
 
			});
			 
			db.collection("users").doc(user?.uid || authUser?.uid).collection("info").doc(user?.uid).get().then((doc) =>{
				dispatch(setUserInfo({
					bio: doc?.data()?.bio || '',
					location: doc?.data()?.location || null,
					privacy: doc?.data()?.privacy || 'public',
					website:doc?.data()?.website || ''
				}))
			})
		
		}
	},[user || authUser]);

	useEffect(() =>{
		if(user || authUser){
			const unsubscribe =db.collection("users").doc(user?.uid).collection("followers").onSnapshot((snapshot) =>
				setFollowers(snapshot?.docs?.map((doc) =>
				({
					id: doc.id,
					displayName: doc?.data()?.displayName || '',
					photoURL: doc?.data().photoURL || null,
					timestamp: doc.data().timestamp || null
				})
		))
			);
			return unsubscribe;
		}
	},[user || authUser]);

	useEffect(() =>{
		if(user || authUser){
			const unsubscribe = db.collection("posts").doc(user?.uid || authUser?.uid).collection("likedPosts").onSnapshot((snapshot) =>{
				setLikes(snapshot.size)
			})
			return unsubscribe;
		}
	},[user]);

	useEffect(() =>{
		if(user || authUser){
			const unsubscibe =  db.collection("users").doc(user?.uid || authUser?.uid).collection("friends").onSnapshot((snapshot) =>
				setFriends(snapshot.docs.map((doc) =>
					({
						displayName: doc.data().displayName || '',
						email: doc.data().email || '',
						uid: doc.data().uid,
						photoURL: doc.data().photoURL || '',
						id: doc.id
					})
				)
	
			))
		return unsubscibe;
		}
    },[user]);

	useEffect(() =>{
		if(friends){
			dispatch(addFriend(friends));
		}
	},[friends])


	useEffect(() =>{
		dispatch(setStats({
			followers: followers,
			following: following,
			likes: likes
		}))
	},[followers, following, likes])

	React.useLayoutEffect(() => {
		navigation.setOptions({ 
			headerTitle: getHeaderTitle(route),
			headerBackTitleVisible: false,
			headerShown:(getFocusedRouteNameFromRoute(route)==='Post' || getFocusedRouteNameFromRoute(route)==='Search'  || getFocusedRouteNameFromRoute(route)==='Notification' || getFocusedRouteNameFromRoute(route)==='Chat' || getFocusedRouteNameFromRoute(route)==='Profile') ? false : true,
			headerRight: () =>(
				<TouchableOpacity style={{margin: 10}} onPress={() => navigation.navigate("Chat")}>
						<Feather name="message-square" size={24} color="black" />
				</TouchableOpacity>
			)
		});
	  }, [navigation, route]);

	

	return (
		<HomeStack.Navigator
		>
			<HomeStack.Screen name="Home" component={Home} options={{
				tabBarIcon: () => <Entypo name="home" size={24} color="gray" />
			
			}}   />
			<HomeStack.Screen name="Search" component={SearchNavigator} options={{
				tabBarIcon: () => <AntDesign name="search1" size={24} color="gray" />
			
			}}/>
		
			<HomeStack.Screen name="Post" component={PostNavigator}
			 options={{
				tabBarIcon: () =><MaterialIcons name="add-a-photo" size={24} color="gray" />,
			
				tabBarVisible: false 
			}}
			/>
			<HomeStack.Screen name="Notification" component={NotificationNavigator} 
				options={{
				tabBarIcon: () => <Ionicons name="md-notifications" size={24} color="gray" />,
			}}
			/>
		 
			<HomeStack.Screen name="Profile" component={DrawerNavigator}
			 options={{
				tabBarIcon: () =><Avatar
									size="small"
									source={{
										uri: user?.photoURL || 'https://cdn0.iconfinder.com/data/icons/set-ui-app-android/32/8-512.png'
									}}
									rounded
									icon={{name: 'user', type: 'font-awesome'}}
								/>
							}}
			/>
		</HomeStack.Navigator>
	);
}

const ChatStack = createStackNavigator();

const ChatNavigator = () =>{
	return(
		<ChatStack.Navigator>
			<ChatStack.Screen name="ChatList" component={ChatList} options={{headerTitle: "Chat"}} />
			<ChatStack.Screen name="ChatScreen" component={ChatScreen}  />
		</ChatStack.Navigator>
	)	
}


export default function App() {
 
	return (
		<Provider store={store}>
			<SafeAreaView style={styles.container}>
				<StatusBar style="dark" />
				<NavigationContainer>
					<Stack.Navigator>
						<Stack.Screen
								name="Authentication"
								component={MobileVerification}
								options={{ headerTitle: '', headerTransparent: true }}
							/>
						<Stack.Screen name="Login" component={Login} options={{headerTransparent: true}} />
						<Stack.Screen
							name="Socially"
							component={HomeNavigatorStack}
							options={{headerTitleAlign:"center", headerTitle: "Socially",
						}}
						/>
						<Stack.Screen name="Comment" component={Comment} options={{headerTitleAlign: "center"}} />
						<Stack.Screen name="Story" component={Story} />
						<Stack.Screen name="Chat" component={ChatNavigator} options={{headerShown: false}} />
						<Stack.Screen name="CameraPreview" component={CameraPreview} options={{headerShown: false}} />
					</Stack.Navigator>
					
			</NavigationContainer>
				<FlashMessage position="top" />
			</SafeAreaView>
		</Provider>
		 
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		height: '100%'
	}
});
