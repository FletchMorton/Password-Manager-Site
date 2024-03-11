const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./routes/auth.route.js')
const userRouter = require('./routes/user.route.js')
const noteRouter = require('./routes/note.route.js')
const cardRouter = require('./routes/card.route.js')
const passRouter = require('./routes/pass.route.js')
const path = require("path")

main().catch(err => console.log(err));

async function main() {
	/* ----------Connect to Database---------- */
	//Connect to the server and act based on the reported status
	await mongoose.connect(process.env.MONGO_CON);
	const db = mongoose.createConnection(process.env.MONGO_CON)

		db.on('error', console.error.bind(console, "Connection error:"))

		db.on('close', function callback () {
			console.log("Server connection closed.")
		})

		db.once('open', async function callback () {
			console.log("Connected to server.")
		})


	/* ----------Configure Application---------- */
	//Create the application
	const app = express();

	//Specify format and tools
	app.use(express.json());

	//Watch a port
	app.listen(3005, () => {
		console.log('Server is running on port 3005');
	});

	// serve static React files
	app.use(express.static(path.join(__dirname, "../app/build")));

	/* ----------API Routes---------- */
	// Endpoints relating to user credentials
	app.use("/server/auth", authRouter);
	// Endpoints relating to user options
	app.use("/server/user", userRouter);
	// Endpoints relating to secure notes
	app.use("/server/note", noteRouter);
	// Endpoints relating to card logs
	app.use("/server/card", cardRouter);
	//Endpoints relating to password logs
	app.use("/server/pass", passRouter);


	/* ----------Middleware---------- */
	//Master function to deal with errors in all the API routes instead of dealing with them on a per case basis
	app.use((err, request, response, next) => {
		const statusCode = err.statusCode || 500; 					//Get the status from the error, or use a generic one
		const message = err.message || 'Internal Server Error!'; 	//Get the message from the error, or use a generic one

		//Return the error as a JSON
		return response.status(statusCode).json({
			success: false,
			statusCode,
			message,
		})
	});

	// serve the React HTML file
	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "../app/build/index.html"));
	})

}
