const express = require('express')
const SecureNote = require('../models/secureNote.model.js')
const User = require('../models/user.model.js')                     //Need this because we use verifyUser from userVerification
const userVerification = require('../util/userVerification.js');    //For checking the current user against their session cookie
const customError = require('../util/customError.js');

//Creates the router
const router = express.Router();

/* ----------Create API---------- */
//Create a new Secure Note and store it in the db
router.post('/create', userVerification.verifyUser, async (request, response, next) => {
    //Console logging
    console.log("Storing new note.........");

    //Collate data
    const { userid } = request.sessionUser;
    const { title, text } = request.body;
    
    //Add user to the db
    const newSecureNote = new SecureNote({userid, title, text});
    try {
        await newSecureNote.save(); //Save inside the DB
        response
            .status(201) // Created
            .json({note: newSecureNote, message: "Note created!"});

        console.log("Note created!");
    
    } catch(error) { next(error); }
});

/* ----------Update API---------- */
// First verify the user, then update the requested informaiton by changing the respective fields in the database
router.post('/update', userVerification.verifyUser, async (request, response, next) => { //User if verified in verifyUser before API does anything
   //Console logging
    console.log("Updating your note.........");

    try {
        //Update the note with the specified alterations
        const updatedNote = await SecureNote.findByIdAndUpdate(request.body._id, {
            //Prevent updating protected information
            $set: {
                title: request.body.title,
                text: request.body.text,
            }
        }, {new: true}) //new: true specifies that the updated info should be returned

        //Check if anything was actually updated
        if(updatedNote) {
            //Return the updated note
            response
                .status(200) // Success
                .json({note: updatedNote, message: "Secure Note Updated Successfully"});

            console.log("Secure Note Updated Successfully!");
        
        } else return next(customError.errorHandler(404, 'This note does not exist!')); // Not found

    } catch(error) { next(error); }

});


/* ----------Delete API---------- */
// Delete the specified note
router.delete('/delete', userVerification.verifyUser, async (request, response, next) => { //User is verified in verifyUser before API does anything
    //Console logging
    console.log("Deleting your note...");

    try {
        //Try deleting the note
        const deletedNote = await SecureNote.findByIdAndDelete(request.body._id);

        //If anything was actually deleted
        if(deletedNote) {
            //Report note deletion
            response
                .status(200) // Success
                .json({message: 'This secure note has been deleted...'});

            console.log("This secure note has been deleted...");

        } else return next(customError.errorHandler(404, 'This note does not exist!')); // Not found

    } catch(error) { next(error); }

});

/* ----------List API---------- */
// Return all notes that belong to the specified user
router.post('/list', userVerification.verifyUser, async (request, response, next) => { //User is verified in verifyUser before API does anything
    //Console logging
    console.log("Fetching the user's secure notes...");

    try {
        // Get the search term if it exists
        const keyword = request.body.keyword || '';

        const noteList = await SecureNote.find({
            userid: request.sessionUser.userid,
            title: {$regex: keyword, $options: 'i'} // Title contians the keyword somewhere as a substring. Non-case-sesitive
        });

        //Respond with the collection of notes 
        response
            .status(200) // Success
            .json(noteList);

        console.log("Notes retrieved successfully!");

    } catch(error) { next(error); }

});


module.exports = router;
