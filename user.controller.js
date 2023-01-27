const express = require('express');
const router = express.Router();
const userService = require('./user.service');
var multer = require('multer');
const path = require("path");

var app = express();
var multipart = require('connect-multiparty');
var GET_USER;
// routes
router.post('/login', authenticate);
router.post('/register', register);
router.post('/getLoggedInUser', getLoggedInUser);
router.post('/editName', editName);
router.post('/editEmail', editEmail);
router.post('/changePassword', changePassword);
router.post('/editUserType', editUserType);
router.post('/search', search);
router.post('/addFriend', addFriend);
router.post('/resetPassword', resetPassword);
router.post('/requestSent', requestSent);
router.post('/declineRequest', declineRequest);
router.post('/acceptRequest', acceptRequest);
router.post('/acceptForFriend', acceptForFriend);
// router.post('/confirmNotification', confirmNotification);
router.post('/notificationSeen', notificationSeen);
router.post('/unfriend', unfriend);
router.get('/getNotifications', getNotifications);
// router.get('/getLikeNotifications', getLikeNotifications);
router.get('/getFriendRequests', getFriendRequests);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.post('/getFriends', getFriends);
router.post('/getFriendsChat', getFriendsChat);
router.put('/current', update);
router.delete('/current', _delete);
router.post('/uploadProfilePicture', multipart(), uploadProfilePicture);
router.post('/uploadCoverPhoto', multipart(), uploadCoverPhoto);
router.post('/uploadMedia', multipart(), uploadMedia);
router.post('/uploadVideo', multipart(), uploadVideo);
router.post("/charge", charge);
router.post("/posts", multipart(), posts);
router.post("/getMyPosts", getMyPosts);
router.post("/getFriendPosts", getFriendPosts);
router.post("/getAllPosts", getAllPosts);
router.post("/getFriendsPosts", getFriendsPosts);
router.post("/likePost", likePost);
router.post("/unlikePost", unlikePost);
router.post("/editPost", multipart(), editPost);
router.post("/deletePost", deletePost);
router.post("/getLikers", getLikers);
router.post("/getViewers", getViewers);
router.post("/videoViews", videoViews);
router.post("/comments", comments);
router.post("/getComments", getComments);
router.post("/deleteComment", deleteComment);
router.post("/openDialog", openDialog);
router.post("/updateMessageStatus", updateMessageStatus);
router.post("/sendMessage", sendMessage);
router.post("/logout", logout);
router.post("/unreadMessages", unreadMessages);
router.post("/clearChat", clearChat);
router.post("/updateInfoStatus", updateInfoStatus);
router.post("/updateMediaStatus", updateMediaStatus);
router.post("/updateDroneStatus", updateDroneStatus);
router.post("/deleteSeleced", deleteSeleced);
router.post("/confirmEditedText", confirmEditedText);
router.post("/checkUser", checkUser);

module.exports = router;

function charge(req, res, next) {
    userService.charge(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function checkUser(req, res, next) {
    if(GET_USER !== undefined && GET_USER != '') {   
        let id = GET_USER._id;
        let token = GET_USER.token;
        userService.checkUser(id)
        .then(result => res.json({result, token}))
        .catch(err => next(err));
    }
    else{
        res.json(GET_USER);
    }
}

function resetPassword(req, res, next) {
    userService.resetPassword(req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function uploadProfilePicture(req,res,next){
    userService.uploadProfilePicture(req.user.sub,req.files)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function uploadCoverPhoto(req,res,next){
    userService.uploadCoverPhoto(req.user.sub,req.files)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function uploadMedia(req,res,next){
    userService.uploadMedia(req.user.sub,req.files) 
    .then(result => res.json(result))
    .catch(err => next(err));
}

function uploadVideo(req,res,next){
    userService.uploadVideo(req.user.sub,req.files)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => {
            GET_USER = user;
            res.json(user);
        })
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.create(req.body,res)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function editName(req, res, next) {
    userService.editName(req.user.sub, req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function editEmail(req, res, next) {
    userService.editEmail(req.user.sub, req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function changePassword(req, res, next) {
    userService.changePassword(req.user.sub, req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function editUserType(req, res, next) {
    userService.editUserType(req.user.sub, req.body)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function search(req, res, next) {
    userService.search(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function addFriend(req, res, next) {
    userService.addFriend(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function requestSent(req, res, next) {
    
    userService.requestSent(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function posts(req, res, next) {
    userService.posts(req.user.sub, req.body, req.files, function(posts, user){
        res.json({posts, user});
    })
    .catch(err => next(err));
}

function editPost(req, res, next) {
    userService.editPost(req.user.sub, req.body, req.files)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function declineRequest(req, res, next) {
    userService.declineRequest(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function acceptRequest(req, res, next) {
    userService.acceptRequest(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function acceptForFriend(req, res, next) {
    userService.acceptForFriend(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

// function confirmNotification(req, res, next) {
//     userService.confirmNotification(req.user.sub, req.body, function(callback){
//         res.json(callback);    
//     })
//     .catch(err => next(err));
// }

function notificationSeen(req, res, next) {
    userService.notificationSeen(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function getFriendRequests(req, res, next) {
    userService.getFriendRequests(req.user.sub)
    .then(result => res.json(result))
    .catch(err => next(err));
}


function getMyPosts(req, res, next) {
    userService.getMyPosts(req.user.sub, function(posts, user){
        res.json({posts, user});
    })
    .catch(err => next(err));
}

function getFriendPosts(req, res, next) {
    userService.getMyPosts(req.body.id, function(posts, user){
        res.json({posts, user});
    })
    .catch(err => next(err));
}

function comments(req, res, next) {
    userService.comments(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function getComments(req, res, next) {
    userService.getComments(req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function deleteComment(req, res, next) {
    userService.deleteComment(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function openDialog(req, res, next) {
    userService.openDialog(req.body, function(message, user){
        res.json({message, user});
    })
    .catch(err => next(err));
}

function updateMessageStatus(req, res, next) {
    userService.updateMessageStatus(req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function sendMessage(req, res, next) {
    userService.sendMessage(req.body, function(message, user){
        res.json({message,user});
    })
    .catch(err => next(err));
}

function unreadMessages(req, res, next) {
    userService.unreadMessages(req.user.sub)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function clearChat(req, res, next) {
    userService.clearChat(req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function deleteSeleced(req, res, next) {
    userService.deleteSeleced(req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function confirmEditedText(req, res, next) {
    userService.confirmEditedText(req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function updateInfoStatus(req, res, next) {
    userService.updateInfoStatus(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function updateMediaStatus(req, res, next) {
    userService.updateMediaStatus(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function updateDroneStatus(req, res, next) {
    userService.updateDroneStatus(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function logout(req, res, next) {
    GET_USER = '';
    userService.logout(req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function getAllPosts(req, res, next) {
    userService.getAllPosts(req.body, function(posts, user){
        res.json({posts,user});
    })
    .catch(err => next(err));
}

function getFriendsPosts(req, res, next) {
    userService.getFriendsPosts(req.body, function(posts, user){
        res.json({posts,user});
    })
    .catch(err => next(err));
}

function likePost(req, res, next) {
    userService.likePost(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function unlikePost(req, res, next) {
    userService.unlikePost(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function deletePost(req, res, next) {
    userService.deletePost(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function getLikers(req, res, next) {
    userService.getLikers(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function getViewers(req, res, next) {
    userService.getViewers(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function videoViews(req, res, next) {
    userService.videoViews(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function getNotifications(req, res, next) {
    userService.getNotifications(req.user.sub, function(users, request){
        res.json({users,request});
    })
    .catch(err => next(err));
}

// function getLikeNotifications(req, res, next) {
//     userService.getLikeNotifications(req.user.sub, function(post, user){
//         res.json({post,user});
//     })
//     .catch(err => next(err));
// }

function getFriends(req, res, next) {
    userService.getFriends(req.user.sub)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function getFriendsChat(req, res, next) {
    userService.getFriendsChat(req.user.sub, req.body, function(friend, message){
        res.json({friend,message});
    })
    .catch(err => next(err));
}

function unfriend(req, res, next) {
    userService.unfriend(req.user.sub, req.body)
    .then(result => res.json(result))
    .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getLoggedInUser(req, res, next) {
    userService.getLoggedInUser(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req.user.sub, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.user.sub)
        .then(() => res.json({}))
        .catch(err => next(err));
}