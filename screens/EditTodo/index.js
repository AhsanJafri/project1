import React, { useEffect, useLayoutEffect, useState } from 'react'
import { StyleSheet, Text, View,TextInput } from 'react-native'
import { useSelector } from 'react-redux';
import { db } from '../../firebase';
import {Input,Button} from 'react-native-elements';
import { selectUser } from '../../redux/features/userSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TouchableOpacity } from 'react-native';

const EditTodo = ({navigation,route}) => {
	const [ title, setTitle ] = useState('');
    const [description, setDescription] = useState('');
    const user = useSelector(selectUser);
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setDate(currentDate);
        // console.log('date->',currentDate);
      };
      
      const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
      };
      
      const showDatepicker = () => {
        showMode('date');
      };

   


      const onSubmit = () =>{
        if(title!=='' && description!==''){
            console.log('ehy');
            if(headerTitle === "Add a Todo"){
                db.collection("users").doc(user?.uid || firebaseUser?.uid).collection("todos").add({
                    title: title,
                    completed: false,
                    description: description,
                    timestamp: date
                })
            }else if(headerTitle === "Edit a Todo"){
                db.collection("users").doc(user?.uid || firebaseUser?.uid).collection("todos").doc(route?.params?.id).set({
                    title: title,
                    completed: false,
                    description: description,
                    timestamp: date,
                    id: route?.params?.id,
                    completed: route?.params?.completed
               })
            }
            navigation.goBack();
        }else{
          
        }
    }

    const headerTitle = route?.params?.headerTitle

    useLayoutEffect(() =>{
        navigation.setOptions({
            headerTitle:headerTitle,
            headerTitleAlign:"center",
         
        })
    },[navigation]);

    useEffect(() =>{
        if(headerTitle  === "Edit a Todo"){
            setTitle(route?.params?.title);
            setDate(new Date(route?.params?.date))
            setDescription(route?.params?.description);
        }
      },[navigation]);


      const onDelete =() =>{
        navigation.goBack();  
        db.collection("users").doc(user?.uid || firebaseUser?.uid).collection("todos").doc(route?.params?.id).delete().then(() =>{
              console.log('deleted successfully');
        })
      }


    // console.log('title-->',title);
    // console.log('description-->',description)

  

    return (
        <View
			style={{
				flex: 1,
				width: '100%',
				flexDirection: 'row',
				// alignItems: 'center',
				paddingRight: 10,
				paddingBottom: 5,
				paddingTop: 5
			}}
		>
            	<View
				style={{
					flex: 1,
					justifyContent: 'flex-start',
					alignItems: 'flex-start',
					paddingLeft: 25
				}}
			>
                 <Input
                        labelStyle={{ paddingBottom: 5, color: "#49cbe9" }}
                        label="Title"
                        style={[styles.input, {marginTop: 10}]}
                        value={title}
                        onChangeText={setTitle}
                        autoFocus
                        autoCapitalize="none"
                        errorMessage={title==='' ? "Please enter the title" : ''}
                        // containerStyle={{width: "100%"}}
                    />
                     <Input
                        labelStyle={{ paddingBottom: 5, color: "#49cbe9" }}
                        label="Description"
                        style={[styles.input, {marginTop: 10}]}
                        value={description}
                        onChangeText={setDescription}
                        autoFocus
                        autoCapitalize="none"
                        numberOfLines={5}
                        errorMessage={description=== '' ?  "Please enter description" : ''}
                        // inputStyle={{height: 100}}
                    />
                    <View style={{width: "80%", alignSelf:"center"}}> 
                        <Button buttonStyle={{borderRadius: 10,backgroundColor:"#49cbe9", paddingVertical: 15}} title="Due Date" onPress={showDatepicker} />
                    </View>
                    {headerTitle === "Edit a Todo" ? 
                        <View style={{width: "80%", alignSelf:"center",paddingTop: 15}}> 
                            <Button onPress={onDelete} buttonStyle={{borderRadius: 10,backgroundColor:"#EB504E", paddingVertical: 15}} title="Delete"/>
                        </View> : null
                    }
                    <View style={{width: "80%", alignSelf:"center",paddingTop: 15}}> 
                        <Button onPress={onSubmit} buttonStyle={{borderRadius: 10,backgroundColor:"#56ab2f", paddingVertical: 15}} title="Done"/>
                    </View>
            </View>
            {show ? (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode={mode}
                    is24Hour={true}
                    display="default"
                    onChange={onChange}
                />
            ) : null}
        </View>
    )
}

export default EditTodo

const styles = StyleSheet.create({
    input: {
		borderWidth: 1,
		borderColor: 'black',
		padding: 10,
        width: "100%"
	},
})
