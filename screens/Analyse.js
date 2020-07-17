import React from 'react';
import {
	ActivityIndicator,
	Clipboard,
	FlatList,
	Image,
	Share,
	StyleSheet,
	Text,
	ScrollView,
	View
} from 'react-native';

import {Button} from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import uuid from 'uuid';
import Environment from '../config/environment';
import firebase from '../config/firebase';
import Icon from 'react-native-vector-icons/Ionicons';

export default class Analyse extends React.Component {
	state = {
		image: null,
		uploading: false,
		googleResponse: null
	};

	async componentDidMount() {
		await Permissions.askAsync(Permissions.CAMERA);
	}

	render() {
		let { image } = this.state;

		return (
			<View style={styles.container}>
				<ScrollView
					style={styles.container}
					contentContainerStyle={styles.contentContainer}
				>

					<View style={styles.helpContainer}>

          <Button
  					onPress={() => this._takePhoto()}
  					title="Take a photo"
  				/>
						{this._maybeRenderImage()}
					</View>
				</ScrollView>
			</View>
		);
	}

/*
  Adds a loading overlay while the image is being processed/uploaded to the API. I could not make this look clean, however,
  given time constraints, therefore this was never used.
*/

	_maybeRenderUploadingOverlay = () => {
		if (this.state.uploading) {
			return (
				<View
					style={[
						StyleSheet.absoluteFill,
						{
							backgroundColor: 'rgba(0,0,0,0.4)',
							alignItems: 'center',
							justifyContent: 'center'
						}
					]}
				>
					<ActivityIndicator color="#fff" animating size="large" />
				</View>
			);
		}
	};

  /*
    Renders an image, provided one exists in the current state. If the image has been analysed, i.e, if the googleResponse
    state is not null, we can display the results from the server
  */

	_maybeRenderImage = () => {
		let { image, googleResponse } = this.state;
		if (!image) {
			return;
		}

		return (
			<View
				style={{
					marginTop: 20,
					width: 250,
					borderRadius: 3,
					elevation: 2
				}}
			>


				<View
					style={{
						borderTopRightRadius: 3,
						borderTopLeftRadius: 3,
						shadowColor: 'rgba(0,0,0,1)',
						shadowOpacity: 0.2,
						shadowOffset: { width: 4, height: 4 },
						shadowRadius: 5,
						overflow: 'hidden',
            display:'block'
					}}
				>
					<Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
          <Button
            style={{ marginBottom: 10 }}
            onPress={() => this.submitToGoogle()}
            title="Analyze!"
          />
				</View>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          textAlign: 'center',
          fontFamily: 'Arial',
          lineHeight: 40
        }}> Tap text to copy to clipboard </Text>
        {this.state.googleResponse != null && (
          <Text style={{
            fontSize: 20,
            fontStyle: 'italic',
            textAlign: 'center',
            fontFamily: 'Arial',
          }}onPress={this._copyToClipboard}>{this.state.googleResponse.responses[0].textAnnotations[0].description}</Text>
        )}

			</View>
		);
	};

  /*
    Used for copying text to the clipboard, as no PDF exporting implementation was done.
  */
	_copyToClipboard = () => {
		Clipboard.setString(this.state.googleResponse.responses[0].textAnnotations[0].description);
		alert('Copied to clipboard');
	};

  /*
    Allows user to take a photo for processing.
  */

	_takePhoto = async () => {
		let pickerResult = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [4, 3]
		});

		this._handleImagePicked(pickerResult);
	};

  /*
    Handles the post-processing that goes on for the chosen image - prepares the state for firebase uploading.
  */
	_handleImagePicked = async pickerResult => {
		try {
			this.setState({ uploading: true });

			if (!pickerResult.cancelled) {
				uploadUrl = await uploadImageAsync(pickerResult.uri);
				this.setState({ image: uploadUrl });
			}
		} catch (e) {
			console.log(e);
			alert(e);
		} finally {
			this.setState({ uploading: false });
		}
	};

  /*
    Sends a POST request to the Google Vision API and stores the response in the googleResponse state prop.
  */
	submitToGoogle = async () => {
		try {
			this.setState({ uploading: true });
			let { image } = this.state;
			let body = JSON.stringify({
				requests: [
					{
						features: [
              { type: 'DOCUMENT_TEXT_DETECTION'},
						],
						image: {
							source: {
								imageUri: image
							}
						}
					}
				]
			});
			let response = await fetch(
				'https://vision.googleapis.com/v1/images:annotate?key=' +
					Environment['GOOGLE_CLOUD_VISION_API_KEY'],
				{
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
					},
					method: 'POST',
					body: body
				}
			);
			let responseJson = await response.json();
			console.log(responseJson);
			this.setState({
				googleResponse: responseJson,
				uploading: false
			});
		} catch (error) {
			console.log(error);
		}
	};
}

/*
  Uploads image to firebase photo bucket for later use.
*/

async function uploadImageAsync(uri) {
	const blob = await new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.onload = function() {
			resolve(xhr.response);
		};
		xhr.onerror = function(e) {
			console.log(e);
			reject(new TypeError('Network request failed'));
		};
		xhr.responseType = 'blob';
		xhr.open('GET', uri, true);
		xhr.send(null);
	});

	const ref = firebase
		.storage()
		.ref()
		.child(uuid.v4());
	const snapshot = await ref.put(blob);

	blob.close();

	return await snapshot.ref.getDownloadURL();
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		paddingBottom: 10
	},
	contentContainer: {
		paddingTop: 50,
	},

	getStartedContainer: {
		alignItems: 'center',
	},

	getStartedText: {
		fontSize: 17,
		color: 'rgba(96,100,109, 1)',
		lineHeight: 24,
		textAlign: 'center'
	},

	helpContainer: {
		marginTop: 15,
		alignItems: 'center'
	},
  button:{
    position: 'absolute',
    alignSelf: 'center',
    margin: '50%'
  }
});
