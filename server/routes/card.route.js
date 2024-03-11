const express = require('express')
const CardLog = require('../models/cardLog.model.js')
const User = require('../models/user.model.js')                     //Need this because we use verifyUser from userVerification
const userVerification = require('../util/userVerification.js');    //For checking the current user against their session cookie
const customError = require('../util/customError.js');

//Creates the router
const router = express.Router();

/* ----------Create API---------- */
//Create a new card entry and store it in the db
router.post('/create', userVerification.verifyUser, async (request, response, next) => {
    //Console logging
    console.log("Storing new card entry.........");

    //Collate data
    const { userid } = request.sessionUser;
    const { cardNumber, cvv, expiration, bank, firstName, lastName, zip, billingAddress } = request.body;
    
    //Add the card to the db
    const newCard = new CardLog({userid, cardNumber, cvv, expiration, bank, firstName, lastName, zip, billingAddress});
    try {
        await newCard.save(); //Save inside the DB
        response
            .status(201) // Created
            .json({card: newCard, message: "Card stored!"});
        
        console.log("Card stored!");
    
    } catch(error) { next(error); }
});

/* ----------Update API---------- */
// First verify the user, then update the requested informaiton by changing the respective fields in the database
router.post('/update', userVerification.verifyUser, async (request, response, next) => { //User is verified in verifyUser before API does anything
    //Console logging
    console.log("Updating your card log.........");

    try {
        //Update the card with the specified alterations
        const updatedCard = await CardLog.findByIdAndUpdate(request.body._id, {
            //Prevent updating protected information by limiting what may be changed
            $set: {
                cardNumber: request.body.cardNumber,
                cvv: request.body.cvv,
                expiration: request.body.expiration,
                bank: request.body.bank,
                firstName: request.body.firstName,
                lastName: request.body.lastName,
                zip: request.body.zip,
                billingAddress: request.body.billingAddress
            }
        }, {new: true}) //new: true specifies that the updated info should be returned, rather than the original info

        //If anything was actually updated
        if(updatedCard) {
            //Return the updated card
            response
                .status(200) // Success
                .json({card: updatedCard, message: "Card Updated Successfully!"});

            console.log("Card Updated Successfully!");

        } else return next(customError.errorHandler(404, 'This card does not exist!')); // Not found

    } catch(error) { next(error); }

});


/* ----------Delete API---------- */
// Delete the specified card
router.delete('/delete', userVerification.verifyUser, async (request, response, next) => { //User is verified in verifyUser before API does anything
    //Console logging
    console.log("Deleting your card information...");

    try {
        //Try deleting the card
        const deletedCard = await CardLog.findByIdAndDelete(request.body._id);

        //If anything was actually deleted
        if(deletedCard) {
            //Report card deletion
            response
                .status(200) // Success
                .json({message: 'This card has been deleted...'});

            console.log("This card has been deleted...");
       
        } else return next(customError.errorHandler(404, 'This card does not exist!')); // Not found

    } catch(error) { next(error); }

});

/* ----------List API---------- */
// Return all card logs that belong to the specified user
router.post('/list', userVerification.verifyUser, async (request, response, next) => { //User is verified in verifyUser before API does anything
    //Console logging
    console.log("Fetching the user's card logs...");

    try {
        // Get the search term if it exists
        const keyword = request.body.keyword || '';

        const cardList = await CardLog.find({
            userid: request.sessionUser.userid,
            cardNumber: {$regex: keyword, $options: 'i'} // cardNumber contians the keyword somewhere as a substring. Non-case-sesitive
        });

        //Respond with the collection of card logs 
        response
            .status(200) // Success
            .json(cardList);

        console.log("Card logs retrieved successfully!");

    } catch(error) { next(error); }

});


module.exports = router;
