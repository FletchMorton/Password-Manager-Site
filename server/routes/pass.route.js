const express = require('express')
const PasswordLog = require('../models/passwordLog.model.js')
const User = require('../models/user.model.js')                     //Need this because we use verifyUser from userVerification
const userVerification = require('../util/userVerification.js');    //For checking the current user against their session cookie
const customError = require('../util/customError.js');

//Creates the router
const router = express.Router();

/* ----------Create API---------- */
//Create a new password and store it in the db
router.post('/create', userVerification.verifyUser, async (request, response, next) => {
    //Console logging
    console.log("Storing new password entry.........");

    //Collate data
    const { userid } = request.sessionUser;
    const { username, password, application } = request.body;
    
    //Add the password to the db
    const newPassword = new PasswordLog({userid, username, password, application});
    try {
        await newPassword.save(); //Save inside the DB
        response
            .status(201) // Created
            .json({pass: newPassword, message: "Password stored!"});

        console.log("Password stored!");
    
    } catch(error) { next(error); }
});

/* ----------Update API---------- */
// First verify the user, then update the requested informaiton by changing the respective fields in the database
router.post('/update', userVerification.verifyUser, async (request, response, next) => { //User if verified in verifyUser before API does anything
    //Console logging
    console.log("Updating your password log.........");

    try {
        //Update the password log with the specified alterations
        const updatedPass = await PasswordLog.findByIdAndUpdate(request.body._id, {
            //Prevent updating protected information
            $set: {
                username: request.body.username,
                password: request.body.password,
                application: request.body.application
            }
        }, {new: true}) //new: true specifies that the updated info should be returned

        //If anything was updated
        if(updatedPass) {
            //Return the updated password log
            response
                .status(200) // Success
                .json({pass: updatedPass, message: "Password Log Updated Successfully!"});

            console.log("Password Log Updated Successfully!");
            
        } else return next(customError.errorHandler(404, 'This password does not exist!')); // Not found

    } catch(error) { next(error); }

});


/* ----------Delete API---------- */
// Delete the specified password
router.delete('/delete', userVerification.verifyUser, async (request, response, next) => { //User is verified in verifyUser before API does anything
    //Console logging
    console.log("Deleting your password log...");

    try {
        //Try to delete the password
        const deletedPass = await PasswordLog.findByIdAndDelete(request.body._id);

        //If anything was updated
        if(deletedPass) {
            //Report password deletion
            response
                .status(200) // Success
                .json({message: 'This password log has been deleted...'});

            console.log("This password log has been deleted...");
        
        } else return next(customError.errorHandler(404, 'This password does not exist!')); // Not found

    } catch(error) { next(error); }

});

/* ----------List API---------- */
// Return all password logs that belong to the specified user
router.post('/list', userVerification.verifyUser, async (request, response, next) => { //User is verified in verifyUser before API does anything
    //Console logging
    console.log("Fetching the user's password logs...");

    try {

        // Get the search term if it exists
        const keyword = request.body.keyword || '';

        const passList = await PasswordLog.find({
            userid: request.sessionUser.userid,
            application: {$regex: keyword, $options: 'i'} // Application contians the keyword as a substring. Non-case-sesitive
        });

        //Respond with the collection of password logs 
        response
            .status(200) // 200 is successful response code
            .json(passList);

        console.log("Password logs retrieved successfully!");

    } catch(error) { next(error); }

});


module.exports = router;
