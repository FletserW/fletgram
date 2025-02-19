import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { Home, Search, PlusSquare, Video, User } from "lucide-react-native";

import Feed from "./tabs/index";
import ExploreScreen from "./tabs/ExploreScreen";
import PostScreen from "./tabs/PostScreen";
import ProfileScreen from "./tabs/ProfileScreen";
import ProfileScreen2 from "./settings/ProfileScreen";
import ReelsScreen from "./tabs/ReelsScreen";
import HomeScreen from "./Index";
import RegisterScreen from "./registro/RegisterScreen";
import FindPeopleScreen from "./settings/FindPeopleScreen";
import SettingsScreen from "./settings/Index";
import PersonalDataScreen from "./settings/PersonalDataScreen";
import SecurityScreen from "./settings/SecurityScreen";
import UploadPostScreen from "./tabs/PostScreen";


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TempTabs() {
  return (
    <Tab.Navigator id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#111",
          height: 60,
        },
        tabBarIcon: ({ focused }) => {
          let IconComponent;

          switch (route.name) {
            case "Feed":
              IconComponent = Home;
              break;
            case "Explore":
              IconComponent = Search;
              break;
            case "Post":
              IconComponent = PlusSquare;
              break;
            case "Reels":
              IconComponent = Video;
              break;
            case "Profile":
              IconComponent = User;
              break;
            default:
              IconComponent = Home;
          }

          return <IconComponent size={24} color={focused ? "#9d3520" : "gray"} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={Feed} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Post" component={PostScreen} />
      <Tab.Screen name="Reels" component={ReelsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function Temp() {
  return (
    <NavigationContainer>
      <Stack.Navigator id={undefined} initialRouteName="Home">
        <Stack.Screen name="tabs" component={TempTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="FindPeopleScreen" component={FindPeopleScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ProfileScreen2" component={ProfileScreen2} options={{ headerShown: false }} />
        <Stack.Screen name="PersonalDataScreen" component={PersonalDataScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SecurityScreen" component={SecurityScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UpLoadPostScreen" component={UploadPostScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}