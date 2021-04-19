import { useNavigation } from '@react-navigation/native'
import React, { useLayoutEffect, useState } from 'react'
import {  Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import {TouchableOpacity, Image, FlatList} from 'react-native'
import { selectUser } from '../../redux/features/userSlice';
import { AntDesign } from '@expo/vector-icons';
import {TextInput} from 'react-native';
import { selectFriend } from '../../redux/features/friendSlice';

const ChatList = () => {
    const user = useSelector(selectUser);
    const [value, setValue] = useState('');
    const friend = useSelector(selectFriend);

    const navigation = useNavigation();
    useLayoutEffect(() =>{
		navigation.setOptions({
			headerShown: true
		})
	},[navigation])

    
    return (
        <View>
            <View style={styles.textInput}>
                <AntDesign name="search1" size={24} color="black" style={{marginHorizontal: 10}} />
                <TextInput  onChangeText={(text) => onChangeText(text)} value={value} placeholder="Search" />
            </View>
            <FlatList
                data={friend}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    (
                        <View>
                        { item.uid !== user.uid ? 
                            <TouchableOpacity onPress={() => navigation.navigate("ChatScreen", {friend: item})} style={styles.container}>
                                <Image
                                    source={{ uri: item?.photoURL }}
                                    style={{ height: 70, width: 70, borderRadius: 70 }}
                                />
                                <Text style={styles.text}>{item?.displayName}</Text>
                            </TouchableOpacity> : null}
                        </View>
                    )
                )
            }
            />
        </View>
    )
}

export default ChatList

 