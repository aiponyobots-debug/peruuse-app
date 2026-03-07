import { enableScreens } from 'react-native-screens';
enableScreens(false);

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { WishlistProvider } from './context/WishlistContext';

import HomeScreen from './app/(tabs)/index';
import SearchScreen from './app/(tabs)/search';
import AddScreen from './app/(tabs)/add';
import ProfileScreen from './app/(tabs)/profile';

const Tab = createBottomTabNavigator();

function App() {
  return (
    <WishlistProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarShowLabel: true,
            tabBarLabelStyle: styles.tabLabel,
            tabBarActiveTintColor: '#2D4A28',
            tabBarInactiveTintColor: '#8A8680',
            tabBarIcon: ({ color }) => {
              const icons = { Home: 'home', Search: 'search', Add: 'plus-circle', Profile: 'user' };
              return <Feather name={icons[route.name]} size={22} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Search" component={SearchScreen} />
          <Tab.Screen name="Add" component={AddScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </WishlistProvider>
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
