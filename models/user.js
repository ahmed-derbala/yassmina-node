const appRootPath = require('app-root-path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
const uniqueMessages = require(`${appRootPath}/messages/unique_messages`)
const prefs = require(`${appRootPath}/config/prefs`);
var validate = require('mongoose-validator')



var emailValidator = 
    validate({
      validator: 'isEmail',
      message: 'invaid email format',
    })
  


let User = new Schema({
    email: { type: String, required: true, unique: true, index: true,validate:emailValidator },
    phone: { type: String, required: false, max: 100, unique: false, index: false },
    userName: { type: String, required: false },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    clearance: { type: Object, required: true },
    ongoingAssessment: { type: Object, required: false, default: {} },
    workExperiences: { type: [Object], required: false, default: [] },
    educations: { type: [Object], required: false, default: [] },
    gender: { type: String, required: false, default: 'SECRET' },
    lang: { type: String, required: false },
    InvitationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invitation'
    },
    CompanyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },

    settings: { type: Object, required: false },
    password: { type: String, required: true, select: false, },
    isActive: { type: Boolean, required: true, default: true, },
    showContactInfos: { type: Boolean, required: false, default: true },



}, { timestamps: true });

User.plugin(uniqueValidator, { message: `{PATH}={VALUE} ${uniqueMessages.alreadyTaken(prefs.defaultLang)}` });

User.methods.submitOngoingAssessment = function () {    
    return models.SubmittedAssessment.create({
        UserId: this._id,
        Assessment: this.ongoingAssessment
    })
        .then(submittedAssessment => {
            //nulling ongoingAssessment
            models.User.updateOne({ _id: this._id }, { ongoingAssessment: null },
                function (updateErr, numberAffected, rawResponse) {
                    if (updateErr) {
                        return console.log(updateErr);
                    }
                    else {
                        return log(this._id).verbose({ label: 'SUCCESS', message: `ongoing assessment submitted` })
                    }
                })
            return true
        })
        .catch(err => {
            return log(this._id).error({ label: 'ERROR', message: err })
        })
};


module.exports.genders = ['MALE','FEMALE','SECRET']
module.exports = mongoose.model('User', User);
