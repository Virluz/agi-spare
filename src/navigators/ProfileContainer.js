import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import Profile from '../screens/profile/Profile';
import Privacy from '../screens/profile/Privacy';

const ProfileStack = createStackNavigator();



const ProfileContainer = () => {
    return (

        // <View style={{ backgroundColor: 'red' }}><Text style={styles.text_14_bold_black}>asdfasfd</Text></View>

        <ProfileStack.Navigator
            initialRouteName="Profile"
            screenOptions={{
                headerShown: false,
            }}>
            <ProfileStack.Screen
                name="Profile"
                component={Profile}
            />

            <ProfileStack.Screen
                name="Privacy"
                component={Privacy}
            />




        </ProfileStack.Navigator>
    )
}

export default ProfileContainer
