import React from 'react';
import {StyleSheet} from 'react-native';

import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import Analyse from './screens/Analyse';
import Saved from './screens/Saved';
import Icon from 'react-native-vector-icons/Ionicons';

/*
  Allow navigation through the use of tabs for a more user friendly experience.
*/
const tabs = createBottomTabNavigator({
  Analyse:{
    screen: Analyse,
    navigationOptions:{
      tabBarLabel: 'Analyse',
      tabBarIcon: ({ tintColor }) => (
        <Icon
        name="ios-search"
        color= {tintColor}
        size={24} />
      )
    }
  },
  Saved:{
    screen: Saved,
    navigationOptions:{
      tabBarLabel: 'Saved',
      tabBarIcon: ({ tintColor }) => (
        <Icon
        name="ios-heart"
        color= {tintColor}
        size={24} />
      )
    }
  },
});

/*
  Since React Native 3.0, navigation components such as the tabs
  must be wrapped in an app container, then this container must be exported.
*/
const App = createAppContainer(tabs);
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
