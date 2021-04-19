import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity,Image } from 'react-native';
import { Avatar } from 'react-native-elements';
import { SimpleLineIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing'; 
import ImageCarousel from '../ImageCousel';
import { db } from '../../firebase';
import * as firebase from 'firebase';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import RenderVideo from '../../components/RenderVideo';
import { SliderBox } from 'react-native-image-slider-box';


const Posts = ({uid, image, timestamp,text, postId, video, resharedBy,likedBy, open, setOpen,setUserID, setPostID}) => {
	const [avatarUrl, setAvatarUrl] = useState(null);
	const [name, setName] = useState('');
	const [ like, setLike ] = useState(false);
	const [likeCount, setLikeCount] = useState(0);	
	const navigation = useNavigation();
	const [users, setUsers] = useState([]);
	const [comment, setComment] = useState(0);
	const user = firebase.auth().currentUser;
	const [currentImage, setCurrentImage] = useState(null);
	const [loading, setLoading] = useState(false);
	const [localUri, setLocalUri] = useState(null);
	const [noImage, setNoImage] = useState(false);
 


	async function ensureDirExists() {
		const dirInfo = await FileSystem.getInfoAsync(posts);
		if (!dirInfo.exists) {
		  console.log("Posts directory doesn't exist, creating...");
		  await FileSystem.makeDirectoryAsync(posts, { intermediates: true });
		}
	  }
	  



	useEffect(() =>{
		if(uid){
			db.collection('posts').doc(uid).get().then((doc) =>{
					setName(doc.data().displayName);
					setAvatarUrl(doc.data().userImg)
				})
		}
	},[setName, setAvatarUrl]);
	useEffect(() =>{
		const unsubscribe = db.collection("posts").doc(user?.uid).collection("likedPosts").onSnapshot((snapshot) =>
			snapshot.docs.map((doc) =>{
				if(doc.data().postId === postId){
					// console.log('true');
					setLike(true);
				}else{
					setLike(false);
				}
			})
		)
	return unsubscribe;
	},[setLike]);

	

	useEffect(() =>{
		const unsubscribe =db.collection("posts").doc(uid).collection("userPosts").doc(postId).collection("comments").onSnapshot((snapshot) =>
		setComment(snapshot.size)
	)
	return unsubscribe
	},[setComment])

	useEffect(() =>{
		const unsubscribe = db.collection("posts").doc(uid).collection("userPosts").doc(postId).collection("likes").onSnapshot((snapshot) =>{
				setLikeCount(snapshot.size);
			})
		return unsubscribe;
	},[setLikeCount, setUsers]);

	useEffect(() =>{
		if(image){
			if(image?.length ===1){
				setCurrentImage(image[0]);
			}
		}
	},[image])

	const handleLike =  () => {
	if(user!==null){
		if(!like){	
			setLike(true);
			setLikeCount(likeCount + 1);
			 db.collection("posts").doc(uid).collection("userPosts").doc(postId).set({
				postId: postId,
				text:text || '',
				resharedBy: resharedBy || [],
				likedBy: [...likedBy,{
					uid: user?.uid,
					photoURL: user?.photoURL,
					displayName: user?.displayName
				}],
				videos: video || '',
				resharedCount: resharedBy?.length || 0,
				timestamp: timestamp || null,
			})
			db.collection("posts").doc(user?.uid).collection("likedPosts").add({
				postId: postId
			})
		}else{
			setLike(false);
			setLikeCount(likeCount - 1);
			 db.collection("posts").doc(uid).collection("userPosts").doc(postId).collection("likes").onSnapshot((snapshot)=>
				snapshot.docs.map((doc) =>
					{
						if(doc.data().user === user?.uid){
							console.log('uid-->', doc.id);
						 
							db.collection("posts").doc(uid).collection("userPosts").doc(postId).collection("likes").doc(doc.id).delete().then(() =>
								console.log('deleted'),
							).catch((err )=> console.log('err in deleteing-->', err.message));
						}
					}
				)
			
			)
			db.collection("posts").doc(user?.uid).collection("likedPosts").onSnapshot((snapshot) =>
					snapshot.docs.map((doc) =>{
						if(doc.data().postId === postId){

							db.collection("posts").doc(user?.uid).collection("likedPosts").doc(doc.id).delete().then(() =>console.log('deleted'))
							.catch((err) => console.log('err in deleing-->', err.message))
						}
					})
			 
			)
		}
	}
	};

	const handleAvatarPress = () =>{
		console.log('postId-->',postId);
		console.log('like-->', like);
		console.log('uid-->', uid);
		console.log('likeCount-->', likeCount);
	}

 
const getSharingUrl = () =>{
	FileSystem.downloadAsync(
		currentImage,
		FileSystem.documentDirectory + 'post.jpeg'
	  )
		.then(async({ uri }) => {
		  console.log('Finished downloading to ', uri);
		setLoading(false);
		setLocalUri(uri)
		})
}

	let openShareDialogAsync = async () => {
		if(currentImage){
			// console.log('current Image-->',currentImage);
			setLoading(true);
			await getSharingUrl();
			if (!(await Sharing.isAvailableAsync())) {
			  alert(`Uh oh, sharing isn't available on your platform`);
			  return;
			}
			if(localUri){
				await Sharing.shareAsync(localUri);
			}
		}else{
			// setNoImage(true);
			console.log('no current image');
		}

	  };
 
	  const handleReshare = () =>{
		if(currentImage){
			// console.log('current image-->',currentImage);
			navigation.navigate("Post", {screen: "Reshare", params: {images: [currentImage], postId: postId, uid: uid, resharedBy : resharedBy}})
		}else{
			console.log('no current image');
		}
	  }
 
	
	 
	  const handleOpen = () =>{
		  setOpen(!open);
		//   console.log('postId-->',postId);
		  setPostID(postId)
		//   console.log('userId-->',uid);
		  setUserID(uid);
	  }
 	
	
	  
	

	  

	return (
		<ScrollView style={styles.posts}>
			<View style={styles.header}>
				<View style={styles.postHeader}>
					<Avatar
						rounded
						size="medium"
						source={{
							uri:avatarUrl || 'https://wallpaperaccess.com/full/345330.jpg' 
						}}
						containerStyle={{ margin: 10 }}
						onPress={() => handleAvatarPress()}
					/>
					<View style={styles.postText}>
						<Text style={styles.postName}>{name}</Text>
						<Text style={styles.timestamp}>{timestamp}</Text>
					</View>
				</View>
			  
						<TouchableOpacity style={{margin: 10}} onPress={() => handleOpen()}>
						<SimpleLineIcons name="options-vertical" size={24} color="black" />
						</TouchableOpacity>
				 
			</View>
			 
			{loading ?  <View style={styles.middle}><Text style={{fontSize: 18, color:"#49cbe9", alignSelf: "center"}}> Preparing for sharing</Text></View> : 
				<View style={styles.middle}>
				
				{image ? 
					<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
					{image.length > 1 ? 
						<Image source ={{uri: image[0]}} height="530" width="100%" />
						: 
						<SliderBox  currentImageEmitter={index => setCurrentImage(image[index])} circleLoop autoplay={true} images={image} sliderBoxHeight={530} />
						
					} 
					</View>
					: null
				}
				{video ? 
					<RenderVideo videos={video} /> : null
				}
					{text ? <Text style={styles.postCaption}>{text}</Text> : null}
				</View>
			}
			 
			<View style={styles.bottom}>
				<TouchableOpacity style={styles.iconContainer} onPress={handleLike}>
					{like ? (
						<>
                            <AntDesign name="heart" size={24} color="red" />
                            <Text style={styles.iconContainerText}>{likeCount}</Text>
                        </>
					) : (
                        <>
                            <AntDesign name="hearto" size={24} color="black" />
                            <Text style={styles.iconContainerText}>{likeCount}</Text>
                        </>
                    )}
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('Comment', { uid: uid, postId: postId, name:name, avatarUrl: avatarUrl  })}>
					<FontAwesome name="comment-o" size={24} color="black" />
                    <Text style={styles.iconContainerText}>{comment}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={handleReshare} style={styles.iconContainer}>
                    <SimpleLineIcons name="share-alt" size={24} color="black" />
                    <Text style={styles.iconContainerText}>{resharedBy?.length}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={openShareDialogAsync} style={styles.iconContainer}>
                    <Feather name="share"  size={24} color="black" />
				</TouchableOpacity>
			</View>
			
		</ScrollView>
	);
};

export default Posts;

const styles = StyleSheet.create({
	posts: {
		flexDirection: 'column'
	},
	postHeader: {
		flexDirection: 'row'
	},
	postName: {
		fontSize: 17,
		fontWeight: '700',
		color: '#4d4d4d'
	},
	timestamp: {
		color: 'gray'
	},
	postText: {
		flexDirection: 'column',
		justifyContent: 'center'
	},
	options: {
		marginRight: 7
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	bottom: {
		marginTop: 10,
		flexDirection: 'row',
		justifyContent: 'space-around',
        alignItems: 'center',
       
		marginBottom: 15
    },
    iconContainer:{
        flexDirection: "row",
        alignItems: "center"
    },
    iconContainerText:{
        marginLeft: 5
    },
    postCaption: {
		fontSize: 16,
		marginTop: 10,
        marginLeft: 15,
        marginBottom: 10,
     
    }
});


 