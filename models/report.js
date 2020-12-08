const appRootPath = require('app-root-path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const modelName = require(`${appRootPath}/tools/shared`).modelName(__filename)
const mongoosePaginate = require('mongoose-paginate-v2');


let modelSchema = new Schema({
    kind: { type: String, required: true,default:'Idea',index:true },
    reason: { type: String, required: true,index:true },

    IdeaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Idea',
        required:true,
        index:true
    },







}, { timestamps: true })
modelSchema.plugin(mongoosePaginate);

module.exports = mongoose.model(modelName, modelSchema);
