const express = require('express')
const bcryptjs = require('bcryptjs')                        //Hashing algorithm
const User = require('../models/user.model.js')
const customError = require('../util/customError.js');      //For handling custom errors
const jwt = require('jsonwebtoken');                        //For creating the session cookie
const brevo = require('@getbrevo/brevo');                   //For email verification
const {v4: uuidv4, v4} = require('uuid');                   //Generate random strings


//Creates the router
const router = express.Router();

/* ----------SignUp API---------- */
//Send signup information API
router.post('/signup', async (request, response, next) => { // Async lets us use await; next arg lets us use the middware
    //Console logging
    console.log("Creating a new user.........");

    //Collate data
    const { username, email, password } = request.body;
    const hashedPassword = bcryptjs.hashSync(password, 10); //implicit await. 10 is the salt num
    
    try {
        //Make sure the user doesn't exist already
        const existentUser = await User.findOne({email});
        if(!existentUser || existentUser.verified == false) {
            //Add user to the db
            const newUser = new User({username, email, password: hashedPassword, verified: false});
            await newUser.save(); //Save inside the DB. Await keeps us here until task complete


            /* ------------------------- The Great Text Wall -------------------------  */

            /* Send the verification email */

            //Brevo Initialization
            let defaultClient = brevo.ApiClient.instance;
            let apiKey = defaultClient.authentications['api-key'];
            apiKey.apiKey = process.env.BREVO_CON;

            //Brevo Connection
            let apiInstance = new brevo.TransactionalEmailsApi();
            let sendSmtpEmail = new brevo.SendSmtpEmail();

            //Set up the Email
            const verificationKey = v4() + newUser._id; //Unique string used to verify the user
            sendSmtpEmail.subject = "RetroVault User Confirmation";

            sendSmtpEmail.htmlContent = 
                `<p>Please click the link below to verify your account and begin buffing your security with RetroVault.</p>
                <p><a href=${"https://retrovault.co/accountVerification?user=" + newUser._id + "&verificationKey=" + verificationKey}>Verify Me!</a></p>`;

            sendSmtpEmail.sender = 
            {
                "name": "RetroVault",
                "email": "no-reply@retrovault.co",
            };
            
            sendSmtpEmail.to =
            [{
                "email": email,
                "name": username,
            }];

            // Save the verification key
            const hashedKey = bcryptjs.hashSync(verificationKey, 10); // Hash the key
            await User.findByIdAndUpdate(newUser._id, {  //Update the user with the specified alterations
                //Prevent updating protected information
                $set: {emailKey: hashedKey}
            });

            // Send the email
            apiInstance.sendTransacEmail(sendSmtpEmail)
            .then(function (data) {
                console.log("Email sent successfully!");
            
            }, function (error) {
                console.error(error);
            });

            /* -----------------------------------------------------------------------  */

            response
            .status(201) // Created
            .json({
                user: newUser,
                message: "User created! Returned information on the new user."
            });
        
            console.log("User created!");
        
        } else return next(customError.errorHandler(403, 'This user already exists!')); // Forbidden
    
    // Catch try block error and pass it to the middleware
    } catch(error) { next(error); }
});


/* ----------SignIn API---------- */
//Check if the user is who they say they are by checking the database for an email match. Compare passwords, and if things check out, log the user in by creating a session cookie for them
router.post('/signin', async (request, response, next) => {
    //Console logging
    console.log("Logging in.........");

    //Collate data
    const { email, password } = request.body;
    
    //Authenticate the user
    try {
        //Check if the user exists
        const currentUser = await User.findOne({email});
        if(currentUser) {

            //Check for verification
            if(currentUser.verified == false) return next(customError.errorHandler(403, 'User not verified!')); // Forbidden

            //Compare the password against the stored one
            if(bcryptjs.compareSync(password, currentUser.password)) {

                //Save a session token
                const sessionToken = jwt.sign({userid: currentUser._id}, process.env.SECRET_KEY) //second param is like a salt for the token. should be secret
                
                //Redact the password before returning the user information
                const {password: hashedPassword, ...currentUserSecure} = currentUser._doc;

                response
                    .status(200) // Success
                    .json({
                        user: currentUserSecure,
                        session: sessionToken,
                        message: 'Sign-In Successful! Returned information on the current user. Returned the Session Token.'
                    });

                console.log("Sign-In Successful!");

            //Password did not match
            } else return next(customError.errorHandler(401, 'Incorrect email or password!')); // Unauthorized

        //User did not exist
        } else return next(customError.errorHandler(404, 'This user does not exist!')); // Not Found
    
    // Catch try block error and pass it to the middleware
    } catch(error) { next(error); }
});


/* ----------Reset Password API---------- */
// First verify the user, then update the requested informaiton by changing the respective fields in the database
router.post('/resetPassword', async (request, response, next) => {
    try {

        //Collate data
        const { userID, newPassword, resetKey } = request.body;
        if(!resetKey || !userID) return next(customError.errorHandler(401, 'Bad link')); // Unauthorized

        //Look up user
        const currentUser = await User.findById({"_id": userID});

        // User exists
        if(currentUser) {
            // Keys matched
            if(bcryptjs.compareSync(resetKey, currentUser.resetKey)) {

                // Reset password
                const newPassHashed = bcryptjs.hashSync(newPassword, 10); // Hash the new password
                const updatedUser = await User.findByIdAndUpdate(userID, 
                    {$set: { 
                        password: newPassHashed, 
                        resetKey: '' //Get rid of the resetKey so it cant be abused
                    }});

                //Redact the password before returning the user information
                const {password: hashedPassword, ...currentUserSecure} = updatedUser._doc;

                // Indicate success
                response
                    .status(200) // Success
                    .json({user: currentUserSecure, message: "Password Reset! Returned information on the updated user."});

                console.log("Password Reset!");

            // Keys did not match
            } else return next(customError.errorHandler(401, 'Bad link')); // Unauthorized
        
        // User does not exist
        } else return next(customError.errorHandler(404, 'This user does not exist!')); // Not Found

    // Catch errors from try block and pass to middleware
    } catch(error) { next(error); }

});


/* ----------Verify Account API---------- */
// Set this user as a validated user if their link key matches their saved key
router.post('/verifyAccount', async (request, response, next) => {
    try {
        // Collate data
        const { userID, verificationKey } = request.body;
        if(!verificationKey || !userID) return next(customError.errorHandler(401, 'Bad link')); //Ensure the verificationKey and userID actually exist

        //Look up user
        const currentUser = await User.findById({"_id": userID});

        // User exists
        if(currentUser) {
            // Keys matched
            if(bcryptjs.compareSync(verificationKey, currentUser.emailKey)) {
                
                // Verify the user by updating their "verified" field
                await User.findByIdAndUpdate(userID, {$set: {verified: true}});

                // Send out response
                response
                    .status(200) // Success
                    .json({
                        message: "User verified! Redirecting to Home page..."
                    });
                    

                console.log("Verified!");

            // Keys did not match
            } else return next(customError.errorHandler(401, 'Bad link')); // Unauthorized

        // User does not exist
        } else return next(customError.errorHandler(404, 'This user does not exist!')); // Not Found

    // Catch try block errors
    } catch(error) { next(error); }

});


/* ----------Reset Confirmation Email API---------- */
// Send the user an email confirming password reset
router.post('/sendPassEmail/', async (request, response, next) => {

    try {
        // Check that the specified account exists
        const currentUser = await User.findOne({"email": request.body.email});
        if (currentUser) {

            //Brevo Initialization
            let defaultClient = brevo.ApiClient.instance;
            let apiKey = defaultClient.authentications['api-key'];
            apiKey.apiKey = process.env.BREVO_CON;

            //Brevo Connection
            let apiInstance = new brevo.TransactionalEmailsApi();
            let sendSmtpEmail = new brevo.SendSmtpEmail();

            //Set up the Email
            const resetKey = v4() + currentUser._id; //Unique string used to verify the user
            sendSmtpEmail.subject = "RetroVault Password Reset";

            sendSmtpEmail.htmlContent = 
                `<p>Forgot your password? Click the link below to set a new one and continue to RetroVault.</p>
                <p>If you did not initiate the password reset process for your account, please disregard this email.</p>
                <p><a href=${"https://retrovault.co/resetPassword?user=" + currentUser._id + "&resetKey=" + resetKey}>Reset Password!</a></p>`;

            sendSmtpEmail.sender = 
            {
                "name": "RetroVault",
                "email": "no-reply@retrovault.co",
            };
            
            sendSmtpEmail.to =
            [{
                "email": request.body.email,
                "name": currentUser.username,
            }];

            // Save the verification key
            const hashedKey = bcryptjs.hashSync(resetKey, 10); // Hash the key
            const updatedUser = await User.findByIdAndUpdate(currentUser._id, {$set: {resetKey: hashedKey}});

            // Send the email
            apiInstance.sendTransacEmail(sendSmtpEmail)
            .then(function (data) {
                console.log("Email sent successfully!");
            
            }, function (error) {
                console.error(error);
            });

            //Return the updated user
            const {password: pass, ...currentUserUpdated} = updatedUser._doc;
            response
                .status(200) // Success
                .json({
                    user: currentUserUpdated,
                    message: "Email sent successfully! Updated user data returned."
                });

        } else return next(customError.errorHandler(404, 'This user does not exist!')); // Not Found

    
    } catch(error) { next(error); }

});

module.exports = router;
