import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Avatar, Text } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { Platform } from 'react-native';
import { Keyboard } from 'react-native';
import * as firebase from 'firebase';
import EmojiSelector, { Categories } from 'react-native-emoji-selector'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, Image ,Modal } from 'react-native';
import {fetchGifs,fetchSearch}  from '../../gifs';
import AvatarCarousel from '../../components/AvatarCarousel';
import { useSelector } from 'react-redux';
import { selectChatUser } from '../../redux/features/chatUser';
import { db } from '../../firebase';
import { selectUser } from '../../redux/features/userSlice';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { ColorPicker } from 'react-native-color-picker';
import { Foundation } from '@expo/vector-icons';	
import { styles } from './styles';


const ChatScreen = ({route}) => {
	const navigation = useNavigation();
    const [ input, setInput ] = useState('');
	const [emoji, setEmoji] = useState(false);
	const [gifs, setGifs] = useState([]);
	const [term, updateTerm] = useState('');
	const [modalVisible, setModalVisible] = useState(false);
	const [backgroundModalVisible, setBackgroundModalVisible] = useState(false)
    const chatUser = useSelector(selectChatUser) || route?.params?.friend;
    const user = useSelector(selectUser);
	const [messageFriend, setMessageFriend] = useState(null);
	const [senderId, setSenderId] = useState(null);
	const [chats, setChats] = useState([])
	const friend = route?.params?.friend;
	const [chatBackground, setChatBackground] = useState('white');

	 

	useLayoutEffect(() =>{
		navigation.setOptions({
			headerShown: true,
			headerRight: () =>(
				<TouchableOpacity onPress={() => setBackgroundModalVisible(true)}>
					<Foundation name="background-color" size={29} color="black" />
				</TouchableOpacity>
			),
			headerTitle: chatUser?.displayName || friend?.displayName || 'user'
		})
	},[chatUser, navigation])
 
 
	useEffect(() =>{
		db.collection("users").where("email", "==",chatUser?.email || friend?.email).get().then((snapshot) =>{
			snapshot.docs.map((doc) => {
				setMessageFriend(doc.id);
			})
		}).catch((error) => {
			console.log("Error getting documents: ", error);
		});
	},[chatUser]);

 
	useEffect(() =>{
		if(messageFriend){
			db.collection("users").doc(messageFriend).collection("friends").where("email", "==", user?.email).get().then((snapshot) =>{
				snapshot.docs.map((doc) =>{
						setSenderId(doc.id)
				}) 
			})
		}
	},[messageFriend]);

	useEffect(() =>{
		const unsubscibe = db.collection("users").doc(user?.uid).collection("friends").doc(chatUser?.id).collection("chats").orderBy('timestamp', 'asc').onSnapshot((snapshot) =>{
			setChats(snapshot.docs.map((doc) =>({
				id: doc.id,
				data: doc.data()
			})))
		})
	return unsubscibe;
	},[chatUser]);
 

    const sendMessage = (image) =>{
		let img;
		img = typeof image === "string" ? image: ''
        Keyboard.dismiss();
		db.collection("users").doc(user?.uid).collection("friends").doc(chatUser?.id).collection("chats").add({
			message: input,
			sender: user?.email,
			reciever: friend?.email,
			image:img,
			timestamp: firebase.firestore.FieldValue.serverTimestamp()
		});
		console.log('senderId-->',senderId);
		if(senderId){
			db.collection("users").doc(messageFriend).collection("friends").doc(senderId).collection("chats").add({
				message: input,	
				sender: user?.email,
				reciever: friend?.email,
				image:img,
				timestamp: firebase.firestore.FieldValue.serverTimestamp()
			})
		}

		setInput("");
		
	}
 
	useEffect(() =>{
		if(!term)
			fetchGifs(setGifs);
	},[])

    const onEdit = (newTerm) => {
		updateTerm(newTerm);
		fetchSearch(setGifs);
	  }
 	const scrollView = useRef();

	 const backgroundChangeColor = (color) =>{
		setChatBackground(color);
		setBackgroundModalVisible(false);
	 }

	 return (
        <SafeAreaView style={{ flex: 1, backgroundColor: chatBackground }}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={90}
            >
                <View style={styles.header}>
                    <AvatarCarousel currentIndex={friend?.id} uid={friend?.uid} />
                </View>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <>	
					<ScrollView
						ref={scrollView}
						onContentSizeChange={() => scrollView.current.scrollToEnd({ animated: true })}
						contentContainerStyle={{
							paddingTop: 15
						}}
					>
						{chats.map(({id, data}) => (
                            data.sender === user?.email ? (
                            <View key={id} style={styles.commentContainer}>
								<View  style={styles.sender}>
									<View style={styles.content}>
										<View style={[styles.col, {	backgroundColor: "#8E2DE2",}]}>
											{data?.image ? <Image source={{uri: data?.image}} style={styles.image} /> : null }
											<Text style={styles.senderText}>{data.message}</Text>
										</View>
									</View>
								</View>
								<Text style={styles.senderTimestamp}>{moment(new Date(data?.timestamp?.seconds * 1000).toUTCString()).fromNow()}</Text>
						</View>
                            ): (
                                <View key={id} style={styles.commentContainer}>
								<View style={styles.reciever}>
									<Avatar
										size={40}
										rounded
										source={{
											uri: friend?.photoURL
										}}
										containerStyle={{
											marginRight: 5
										}}
									/>
									<View style={styles.content}>
										<View style={[styles.col, {backgroundColor: "lightgray"}]}>
											{data?.image ? <Image source={{uri: data?.image}} style={styles.image} /> : null }
											<Text style={styles.recieverText}>{data.message}</Text>
										</View>
									</View>
								</View>
								<Text style={styles.receiverTimestamp}>{moment(new Date(data?.timestamp?.seconds * 1000).toUTCString()).fromNow()}</Text>
						</View>
                            )
                        ))}
                    
                    </ScrollView>
                    <View style={styles.footer}>
                    <TouchableOpacity onPress={() => {setModalVisible(!modalVisible)}}>
						<MaterialCommunityIcons name="gif" size={30} color="black" />
					</TouchableOpacity>
					<TouchableOpacity  onPress={() =>{emoji ? setEmoji(false) : setEmoji(true)}}>
						<Text style={styles.emoji}>😄</Text>
					</TouchableOpacity>
                        <TextInput
                            value={input}
                            onSubmitEditing={sendMessage}
                            onChangeText={setInput}
                            placeholder="Type message here..."
                            style={styles.textInput}
                        />
                        <TouchableOpacity onPress={sendMessage} activeOpacity={0.5}>
                            <Ionicons name="send" size={24} color="#2B68E6" />
                        </TouchableOpacity>
                    </View>
                </>
			</TouchableWithoutFeedback>
                <Modal
					animationType="slide"
					transparent={true}
					visible={modalVisible}
					style={{flexDirection:"column"}}
					onRequestClose={() => {
					setModalVisible(!modalVisible);
					}}
					>
					<View style={styles.top} />	
					<View style={styles.gif}> 
						<View style={styles.modalHeader}>
							<TouchableOpacity style={{marginRight: 10}} onPress={() => {setModalVisible(false)}}>
								<Ionicons name="md-arrow-back" size={24} color="white" />
							</TouchableOpacity>
						<TextInput
							placeholder="Search Giphy"
							placeholderTextColor='#fff'
							style={styles.textInput}
							onChangeText={(text) => onEdit(text)}
						/>
						</View>
						<FlatList
							data={gifs}
							numColumns={2}
							style={{marginBottom: 40}}
							renderItem={({item}) => (
								<TouchableOpacity onPress={() => sendMessage(item.images.original.url)}>
									<Image
										resizeMode='contain'
										style={styles.image}
										source={{uri: item.images.original.url}}
									/>
								</TouchableOpacity>
						)}/>
					</View>
					</Modal>
					<Modal
						animationType="slide"
						transparent={true}
						visible={backgroundModalVisible}
						style={{flexDirection:"column"}}
						onRequestClose={() => {
						setBackgroundModalVisible(!backgroundModalVisible);
						}}
					>
						<ColorPicker onColorSelected={(color) =>backgroundChangeColor(color)} style={{ flex: 1, backgroundColor: "white" }} />	
					</Modal>  
			</KeyboardAvoidingView>
            {emoji ? <EmojiSelector  
						showSearchBar={false}
						showTabs={true}
						showHistory={true}
						showSectionTitles={true}
          				category={Categories.all} onEmojiSelected={(emoji) => setInput(emoji)} 
					/>	: null
			}
		</SafeAreaView>
    )
}

export default ChatScreen;
