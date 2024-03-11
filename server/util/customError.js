/* Exports errors for dev specified situations like a weak password for example */
// This is never actually used in the current iteration of the code

const errorHandler = (statusCode, message) => {
    const error = new Error();      //Create an error
    error.statusCode = statusCode;  //Copy down the status code (we can create our own codes and ascribe them meanings)
    error.message = message;        //Copy down the message (we can create custom messages)

    return error;
}

exports.errorHandler = errorHandler;