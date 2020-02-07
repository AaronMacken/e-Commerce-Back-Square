// function that returns the error status (or 500 status)
// and the error message (or a default message) 
// data is coming from the error function defined in the index.js file when next is called
function errorHandler(error, request, response, next) {
    return response.status(error.status || 500).json({
        error: {
            message: error.message || "Oops! Something went wrong."
        }
    });
}

module.exports = errorHandler;