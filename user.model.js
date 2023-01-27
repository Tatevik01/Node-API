const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
    email: { type: String, unique: true, required: true },
    hash: { type: String, required: false },
    name: { type: String, required: true },
    userid: {type: mongoose.Schema.ObjectId, required: false},
    userType:{type: String, required: false},
    status:{type: String, required: false, default: "Offline"},
    profilePicture: 
      { data: Buffer, contentType: String, required: false },
    coverPhoto:{
      data: Buffer, contentType: String, required: false },
    photos: [],
    videos: [],
    friends : [],
    requestDate: { type: Date, required: false },
    subscription:{type: String, startDate:Date, endDate:Date, required: false},
    drones:[],
    posts:[],
    infoType: {type: String, required: false, default: "public"},
    mediaType: {type: String, required: false, default: "public"},
    droneType: {type: String, required: false, default: "public"}
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', schema);