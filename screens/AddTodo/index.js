import React, { useEffect, useLayoutEffect, useState } from 'react';
import {  Text, View, TouchableOpacity,ScrollView,SafeAreaView } from 'react-native';
import { ListItem,CheckBox } from 'react-native-elements'
import { AntDesign } from '@expo/vector-icons';
import { db } from '../../firebase';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/features/userSlice';
import * as firebase from 'firebase';
import {LinearGradient} from 'expo-linear-gradient';
import { styles } from './styles';


const AddTodo = ({navigation}) => {
    const [todos, setTodos] = useState([]);
    const user = useSelector(selectUser)
    const [completedList, setCompletedList] = useState([]);

    useLayoutEffect(() =>{
      navigation.setOptions({
        headerTitle: "Todos",
        headerTitleAlign: "center"
      })
    },[navigation]);


  useEffect(() =>{
    db.collection("users").doc(user?.uid).collection("todos").orderBy('timestamp', 'desc').onSnapshot((snapshot) =>
     setTodos(snapshot.docs.map((doc) =>({
        id: doc.id,
        title: doc.data().title,
        timestamp: doc.data().timestamp,
        completed: doc.data().completed,
        description: doc.data().description
      })))
    )
  },[]);


  useEffect(() =>{
    if(todos){
      setCompletedList(todos.map((todo) => todo.completed));
    }
  },[todos]);

  const getProgress = () =>{
	  var p =  0;
    var len = completedList.length;
    completedList.map((list) => {
      if(list){
        p=p+(100/len)
      } 
    });
	  return p;
}
 
  const onPressAdd = (text,title,description,date,id,completed) =>{
    if(text === "Add"){
      navigation.navigate("EditTodo", {headerTitle:"Add a Todo"});
    }else if(text === "Edit"){
      console.log('date-->',typeof(new Date(date?.seconds * 1000).toUTCString()));
      navigation.navigate("EditTodo",{headerTitle: "Edit a Todo", title:title,description:description, date:new Date(date?.seconds * 1000).toUTCString(),id:id,completed:completed })
    }
  }

  const onCheck = (id,title,description,timestamp,completed) =>{
      db.collection("users").doc(user?.uid).collection("todos").doc(id).set({
          id:id,
          title:title,
          description:description,
          timestamp: timestamp,
          completed: !completed
      })
  }

	return (
		<SafeAreaView style={styles.container}>
      <View style={{marginHorizontal: 10}}>
       <LinearGradient colors={['#1E9600', '#FFF200', '#FF0000']} start={[0.0, 0.0]}
          end={[1.0, 1.0]} style={[styles.slider, {width: `${getProgress()}%`}]} />
          <Text style={{marginLeft: 5}}>{getProgress()}%</Text>
      </View>
			<ScrollView>
      {
        todos.map((l, i) => (
          
          <ListItem key={i} bottomDivider onPress={() => onPressAdd("Edit", l.title, l.description,l.timestamp,l.id,l.completed)}>
			        <CheckBox checked={l.completed} onPress={() => onCheck(l.id,l.title, l.description,l.timestamp,l.completed)}/>
            <ListItem.Content>
              <ListItem.Title style={{ textDecorationLine: l.completed ? 'line-through' : 'none',}}>{l.title}</ListItem.Title>
              <ListItem.Subtitle>{l.description}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        ))
      }
        </ScrollView>
			<TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={() => onPressAdd("Add")}>
				<AntDesign name="pluscircle" size={52} color="#f64f59" />
			</TouchableOpacity>
		</SafeAreaView>
	);
};

export default AddTodo;

 