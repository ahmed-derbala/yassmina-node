const appRootPath = require('app-root-path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const modelName = require(`${appRootPath}/tools/shared`).modelName(__filename)
const mongoosePaginate = require('mongoose-paginate-v2');


let modelSchema = new Schema({
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    email: { type: String, required: true, index: true },
    name: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    creatorKind: { type: String, required: false, index: true,default:'person' }, //company or person
    keywords: { type: String, required: true, index: true },
    type: { type: String, required: false, index: true },
    link: { type: String, required: false, index: true, default: '' }, //url of that idea like n3awen.com/idea/id/123456789
    url: { type: String, required: false, index: true }, //url given by user
    regions: { type: [String], required: true, index: true },
    allRegions: { type: Boolean, required: true, default: false, index: true },
    isPublic: { type: Boolean, required: true, default: false },
    service: { type: String, required: false, index: true }, //if materiel
    equipment: { type: String, required: false, index: true },
    equipmentCount: { type: Number, required: false, index: true },
    img: { data: Buffer, contentType: String }, //image
    isHelpRequest:{ type: Boolean, required: false, default: false },



}, { timestamps: true })
modelSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Idea', modelSchema);
