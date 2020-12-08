const { validationResult } = require('express-validator');

/**
 * this function deals with errors, we return nothing about errors on production
 * @param {*} error 
 * @param {*} req can be null
 * @param {*} res can be null
 * @param {*} next can be null
 */
exports.errorHandler = (error, req, res, next) => {
    //to print the line of error
    console.error(error);
    let statusCode = 500
    if (error != null) {
        switch (error.name) {
            case 'ValidationError':
                statusCode = 422
                break;

            default:
                break;
        }
    } else {
        error = 'unknown_error'.white.bgRed
    }

    if (req != null && res != null) {
        log().error({ label: 'error', message: error.toString().black.bgRed, route: req.originalUrl })
        //return res.status(statusCode).render('error', { message: error,connectedUser: req.user })
        //this will be changed based on NODE_ENV in the future because now we need full error to be returned even on prod
        if (process.env.NODE_ENV == 'production') {
            return res.status(statusCode).json({ error:error.toString(),status: 'NOK', })
        } else {
            return res.status(statusCode).json({ error:error.toString(),status: 'NOK', })
        }
    } else {
        log().error({ label: 'error', message: error.toString().black.bgRed})
    }
}

/**
 * checking errors returned by validator, it should be called directly after validator on routes
 */
exports.validatorCheck = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        log().debug({ label: 'VALIDATION_ERROR', message: JSON.stringify(errors.errors), body: req.body })
        return res.status(422).json({ errors: errors.errors });
        //return res.render('error',{ message: errors.errors,connectdUser:req.user });

    }
    return next()
}