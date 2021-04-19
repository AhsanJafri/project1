import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Button, Container, Content, Header, Right } from 'native-base';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { DrawerActions } from '@react-navigation/native';

const Sidebar = ({ ...props }) => {

    const handlePress = () =>{
        props.navigation.dispatch(DrawerActions.closeDrawer())
        props.navigation.navigate("Settings")
    }
    // console.log('navi--?',props.navigation);
	return (
		<Container>
			<Header style={{ backgroundColor: '#ffffff', borderBottomWidth: 0, marginTop: 20, borderWidth: 0 }}>
				<StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
				<Right>
					<Button transparent>
						<TouchableOpacity onPress={() => handlePress()}>
							<Ionicons name="ios-options" size={28} color="black" />
						</TouchableOpacity>
					</Button>
				</Right>
			</Header>
			<Content>
				<DrawerContentScrollView {...props}>
					<DrawerItemList {...props} />
				</DrawerContentScrollView>
			</Content>
		</Container>
	);
};

export default Sidebar;

const styles = StyleSheet.create({});
