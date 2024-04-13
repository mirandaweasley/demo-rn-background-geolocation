
import React from 'react';

import {
  Alert,
  Button,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  ScrollView,
} from 'react-native';

import BackgroundGeolocation from "react-native-background-geolocation";

const HelloWorld = () => {
  const [enabled, setEnabled] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [location, setLocation] = React.useState('');
  const [username, setUsername] = React.useState('2250748161613');
  const [password, setPassword] = React.useState('Demo');
  const [accessToken, setAccessToken] = React.useState('');
  const [refreshToken, setRefreshToken] = React.useState('');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    label: {
      fontSize: 16,
      marginBottom: 6,
    },
    text: {
      fontFamily: 'monospace',
      fontSize: 12,
      padding: 10,
    },
    input: {
      height: 40,
      marginBottom: 12,
      borderWidth: 1,
      padding: 10,
    },
  });

  React.useEffect(() => {
    if (enabled) {
      BackgroundGeolocation.onAuthorization((event) => {
        if (event.success) {
          console.log("[authorization] ERROR: ", event.error);
        } else {
          console.log("[authorization] SUCCESS: ", event.response);
        }
      });      
      BackgroundGeolocation.ready({
        distanceFilter: 0,
        locationUpdateInterval: 10000,
        stopTimeout: 5,
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        debug: true,
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
        stopOnTerminate: false,
        startOnBoot: true,
        url: 'https://sigcoges.com/v1/event/user_location',
        batchSync: false,
        autoSync: true,
        authorization: {
          strategy: "JWT",
          accessToken: accessToken,
          refreshToken: refreshToken,
          refreshUrl: "https://sigcoges.com/v1/auth/refresh",
          refreshHeaders: {
            Authorization: refreshToken
          },
          refreshPayload: {
            refreshToken: "{refreshToken}"
          },
        }
      }).then((state) => {
        setReady(true);
        console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);
        if (!state.enabled) {
          BackgroundGeolocation.start().then(() => {
            console.log("- BackgroundGeolocation starting");
            console.log("- BackgroundGeolocation.changePace(true)")
            BackgroundGeolocation.changePace(true);
          });
        }
      });
    } else {
      if (ready) {
        console.log("- BackgroundGeolocation stopping");
        BackgroundGeolocation.stop();
        setLocation('');
      }
    }
  }, [enabled]);

const handleLogin = async () => {

  try {
    const response = await fetch('https://sigcoges.com/v1/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login: username,
        password: password,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.msg || 'Login failed');
    }

    if (!json.refresh_token) {
      throw new Error("refresh_token not found");
    }

    setRefreshToken(json.refresh_token.replace(/^Bearer /, ''));

    if (!json.access_token) {
      throw new Error("access_token not found");
    }

    setAccessToken(json.access_token.replace(/^Bearer /, ''));

  } catch (error) {
    Alert.alert("Login failed");

  }
};

return (
  <ScrollView style={styles.container}>
    <Text style={styles.label}>Username:</Text>
    <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Enter your username"></TextInput>
    <Text style={styles.label}>Password:</Text>
    <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Enter your password" secureTextEntry={true}></TextInput>
    <Button title="Login" onPress={handleLogin}></Button>
    <Switch value={enabled} onValueChange={setEnabled} />
    <Text style={styles.label}>Access token:</Text>
    <Text style={styles.text}>{accessToken}</Text>
    <Text style={styles.label}>Refresh token:</Text>
    <Text style={styles.text}>{refreshToken}</Text>
    <Text style={styles.text}>{location}</Text>
    <Text style={styles.text}></Text>
  </ScrollView>
)

  
}

export default HelloWorld;
