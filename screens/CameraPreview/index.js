import React, { useRef, useState } from 'react';
import { ImageBackground,ScrollView } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import BottomSheet from 'reanimated-bottom-sheet';
import RenderGif from '../../components/RenderGif';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import Draggable from 'react-native-draggable';
import { Entypo } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as firebase from 'firebase';
import { db } from '../../firebase';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';
import { Audio } from 'expo-av';
import { Foundation } from '@expo/vector-icons';
import { ColorPicker } from 'react-native-color-picker';
import { Modal } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const CameraPreview = ({ navigation, route }) => {
	const photo = route?.params?.photo;
	const [ image, setImage ] = useState(null);
	const sheetRef = React.useRef(null);
	const [loading, setLoading] = useState(false);
	const firebaseUser = firebase.auth().currentUser;
	const [text, setText] = useState('');
	const [emojiText, setEmojiText] = useState('');
	const [emoji, setEmoji] = useState(false);
	const [input, setInput] = useState(false);
	const [submit, setSubmit] = useState(false);
	const [soundUri,setSoundUri] = useState('');
	const [backgroundModalVisible, setBackgroundModalVisible] = useState(false)
	const [downloadUri, setDownloadUri] = useState('');
	const [textColor, setTextColor] = useState("white")

	const sound = new Audio.Sound();


	async function playSound() {
	  console.log('Loading Sound');
	 await sound.loadAsync({
		  uri: soundUri
	  })
	   sound.playAsync(); 
		uploadSound(soundUri);
	}

	const retakePicture = () => {
		navigation.goBack();
	};

	const handleSelect = (image) => {
		setImage(image);
	};

 
	const renderContent = () => {
		return (
			<>
			{!emoji ? 
				<View style={{backgroundColor: 'gray',padding: 16}}>
					<View style={{ width: 30,
							alignSelf:"center",
							backgroundColor:"white",
							margin: 10,
							height:7,
							borderRadius: 10}} />
						<RenderGif handleSelect={handleSelect} />  
				</View>
		    : null
			}
			</>
		);
	};

		 
	const renderHeader = () => {
		<View
			style={{
				width: '100%',
				height: 40,
				borderWidth: 2
			}}
		>
	 
		</View>;
	};
	let captureViewRef = useRef();

	const saveImage = async () => {
		 await sound.unloadAsync();
		 console.log('unloading');
		captureRef(captureViewRef, {
			format: 'jpg',
			quality: 0.9
		}).then((uri) => uploadImage(uri), (error) => console.log('Oops, snapshot failed', error));

	};

	const uploadSound = async(uri) =>{
		const response = await fetch(uri);
		const blob = await response.blob();
		var ref = firebase.storage().ref().child(`sounds/${uri}`);

		await ref.put(blob)
			.then(snapshot => {
				return snapshot.ref.getDownloadURL(); 
			}).catch((err) => console.log('error in uploading audio->', err.message))
			.then(async(downloadURL) => {
				console.log(`Successfully uploaded sound and got download link - ${downloadURL}`);
				setDownloadUri(downloadURL);
				return downloadURL;
			}).catch((err)=> console.log('error in downloading sound-->', err.message));
	}


	const uploadImage = async(uri) => {
		setLoading(true);
		const response = await fetch(uri);
		const blob = await response.blob();
		var ref = firebase.storage().ref().child(`images/${uri}`);
 
	
		await ref.put(blob)
			.then(snapshot => {
				return snapshot.ref.getDownloadURL(); 
			}).catch((err) => console.log('error in uploading image/video->', err.message))
			.then(async(downloadURL) => {
				console.log(`Successfully uploaded image and got download link - ${downloadURL}`);
				setLoading(false);
				await db.collection("users").doc(firebaseUser.uid).collection("stories").add({
				  image: downloadURL,
				  type:  "image",
				  finish: 0,
				  timestamp: firebase.firestore.FieldValue.serverTimestamp(),
				  sound: downloadUri || ''
				})
				navigation.navigate('Story');
				return downloadURL;
			}).catch((err)=> console.log('error in downloading image-->', err.message));
	}

	const handleIconPress = (text) =>{
		if(text === "emoji"){
			setEmoji(!emoji);
		}else if(text === "text"){
			setInput(!input);
		}
	}

	const RenderText = () =>{
		return(
			<Text style={{fontSize: 55}}>{emojiText}</Text>
		)
	}
	
	const renderInput = () =>{
		return (
			<>
			{submit ? 
				<Text style={{alignSelf: "center",fontSize: 39, fontWeight: "bold",color:textColor}}>{text}</Text>		 
				 : 
				<TextInput 
					placeholder="Enter text"
					value={text}
					onChangeText={setText}
					onSubmitEditing={() => setSubmit(true)}
					autoCapitalize="none"
					placeholderTextColor="white"
					style={{ width: width-40,padding: 10, alignSelf: "center",backgroundColor:"rgba(217, 217, 217,0.5)",
					borderColor: "black", borderWidth: 2,fontSize: 19, fontWeight: "bold",color:"white"
				}}
				/>
			}
			</>
		)
	}
	const handleColorChange = () =>{
		 setBackgroundModalVisible(true);
	}

	const handleAudioPress = async() =>{
		let result = await DocumentPicker.getDocumentAsync({});
		setSoundUri(result.uri);
		playSound();
	}	
	const textChangeColor = (color) =>{
		setTextColor(color);
		setBackgroundModalVisible(false);
	 }

	return (
		<ScrollView
			style={{
				flex: 1,
				flexDirection: 'column',
				width: '100%',
				height: '100%'
			}}
		>
			<ViewShot ref={captureViewRef} options={{ format: 'jpg', quality: 0.9 }}>
				<ImageBackground
					source={{ uri: photo }}
					style={{
						flex: 1,
						height: height,
						width: width,
						alignItems: 'center',
						justifyContent: 'center',
						alignSelf: 'center'
					}}
				>
				<View
					style={{
						alignItems: 'center',
						justifyContent: 'center',
						alignSelf: 'center',
						flexDirection: 'column'
					}}
				>
					<Draggable
						imageSource={{ uri: image }}
						renderSize={100}
						x={100}
						y={300}
						onLongPress={() => console.log('long press')}
						onShortPressRelease={() => console.log('press drag')}
						onPressIn={() => console.log('in press')}
						onPressOut={() => console.log('out press')}
					/>
					<Draggable
						renderSize={100}
						x={5}
						y={5}
						onLongPress={() => console.log('long press')}
						onShortPressRelease={() => console.log('press drag')}
						onPressIn={() => console.log('in press')}
						onPressOut={() => console.log('out press')}
					>
						<RenderText />
					</Draggable>
				{input ? 	<Draggable
						renderSize={100}
						x={5}
						y={100}
						onLongPress={() => console.log('long press')}
						onShortPressRelease={() => console.log('press drag')}
						onPressIn={() => console.log('in press')}
						onPressOut={() => console.log('out press')}
					>
						{renderInput()}
					</Draggable> : null}
				</View>
				{emoji ? 
				<View style={{backgroundColor:"white", height: 450, position: "absolute", bottom: 0,zIndex: 1}}>
					<EmojiSelector
						showSearchBar={false}
						showTabs={true}
						showHistory={true}
						showSectionTitles={true}
						category={Categories.all}
						onEmojiSelected={(emoji) => setEmojiText(emoji)}
					/> 
				</View>
					: null
					}
				</ImageBackground>
			</ViewShot>
			<View
				style={{
					flex: 1,
					flexDirection: 'column',
					position: 'absolute',
					right: 30,
					top: 65,
					alignItems:"center",

				}}
			>
				<TouchableOpacity
					style={{ flexDirection: 'row', alignItems: 'center' }}
					onPress={() => sheetRef.current.snapTo(0)}
				>
					<MaterialCommunityIcons name="gif" size={40} color="white" />
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.icon}
					onPress={() => handleIconPress("emoji")}
				>
					<Entypo name="emoji-happy" size={24} color="white" />
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.icon}
					onPress={() => handleIconPress("text")}
				>
					<MaterialCommunityIcons name="format-text" size={29} color="white" />
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.icon}
					onPress={() => handleAudioPress()}
				>
					<MaterialIcons name="audiotrack" size={24} color="white" />
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.icon}
					onPress={() => handleColorChange()}
				>
					<Foundation name="text-color" size={29} color="white" />
				</TouchableOpacity>
			</View>
			<Modal
				animationType="slide"
				transparent={true}
				visible={backgroundModalVisible}
				style={{flexDirection:"column"}}
				onRequestClose={() => {
				setBackgroundModalVisible(!backgroundModalVisible);
				}}
			>
				<ColorPicker onColorSelected={(color) =>textChangeColor(color)} style={{ flex: 1, backgroundColor: "white" }} />	
			</Modal>  
			{!emoji ?  
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					position: 'absolute',
					bottom: 10,
					width: '100%'
				}}
			>
				<TouchableOpacity
					onPress={retakePicture}
					style={{
						width: 130,
						height: 40,
						alignItems: 'center',
						borderRadius: 4
					}}
				>
					<Text
						style={{
							color: '#fff',
							fontSize: 20
						}}
					>
						Re-take
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={saveImage}
					style={{
						width: 130,
						height: 40,
						alignItems: 'center',
						borderRadius: 4
					}}
				>
					<Text
						style={{
							color: '#fff',
							fontSize: 20
						}}
					>
						save photo
					</Text>
				</TouchableOpacity>
			</View>
			: null}
			<BottomSheet
				ref={sheetRef}
				snapPoints={[ 450, 300, 0 ]}
				renderHeader={renderHeader}
				borderRadius={10}
				initialSnap={2}
				renderContent={renderContent}
			/>
		</ScrollView>
	);
};

export default CameraPreview;

const styles = StyleSheet.create({
	icon:{ 
		flexDirection: 'row', 
		alignItems: 'center',
		marginVertical: 10 
	}
});
 