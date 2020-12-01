var firebaseConfig = {
	apiKey: "AIzaSyBxPKk95jjKsufgZ2xFZlQBLdJURkVNnvE",
	authDomain: "buynow-app.firebaseapp.com",
	databaseURL: "https://buynow-app.firebaseio.com",
	projectId: "buynow-app",
	storageBucket: "buynow-app.appspot.com",
	messagingSenderId: "23251607808",
	appId: "1:23251607808:web:8ffe8824b643c076d193e5",
	measurementId: "G-BJEKG38NNQ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database()