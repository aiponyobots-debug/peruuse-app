import { enableScreens } from 'react-native-screens';
enableScreens(false);

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import HomeScreen from './app/(tabs)/index';
import DiscoverScreen from './app/(tabs)/discover';
import AddScreen from './app/(tabs)/add';
import NotificationsScreen from './app/(tabs)/notifications';
import ProfileScreen from './app/(tabs)/profile';

const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabLabel,
          tabBarActiveTintColor: '#2D4A28',
          tabBarInactiveTintColor: '#8A8680',
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Discover" component={DiscoverScreen} />
        <Tab.Screen name="Add" component={AddScreen} />
        <Tab.Screen name="Activity" component={NotificationsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FAFAF8',
    borderTopColor: '#E8E6E2',
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});

registerRootComponent(App);
