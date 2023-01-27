var nodemailer = require('nodemailer');
var moment = require('moment');
const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
var mongoose = require('mongoose');
const keySecret = config.stripekeySecret;
const stripe = require("stripe")(keySecret);
const User = db.User;
const Post = db.Post;
const Comment = db.Comment;
const Message = db.Message;
const Drone = db.Drone;
const Subscription = db.Subscription;
const SubscriptionType = db.SubscriptionType;
const FriendRequest = db.FriendRequest;
const _ = require('lodash');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = config.url;
const express = require('express');
mongoose.set('useCreateIndex', true);
module.exports = {
    checkUser,
    authenticate,
    getAll,
    getById,
    getLoggedInUser,
    create,
    update,
    editName,
    editEmail,
    changePassword,
    search,
    editUserType,
    addFriend,
    charge,
    resetPassword,
    requestSent,
    declineRequest,
    acceptRequest,
    acceptForFriend,
    // confirmNotification,
    notificationSeen,
    getFriendRequests,
    getNotifications,
    // getLikeNotifications,
    getFriends,
    getFriendsChat,
    unfriend,
    posts,
    getMyPosts,
    getAllPosts,
    getFriendsPosts,
    likePost,
    unlikePost,
    deletePost,
    editPost,
    getLikers,
    getViewers,
    videoViews,
    comments,
    getComments,
    deleteComment,
    openDialog,
    updateMessageStatus,
    sendMessage,
    logout,
    unreadMessages,
    clearChat,
    updateInfoStatus,
    updateMediaStatus,
    updateDroneStatus,
    deleteSeleced,
    confirmEditedText,
    delete: _delete,
    uploadProfilePicture: uploadProfilePicture,
    uploadCoverPhoto: uploadCoverPhoto,
    uploadMedia: uploadMedia,
    uploadVideo: uploadVideo,
    subscribe: subscribe
};
var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sm.test.1528@gmail.com',
        pass: 'Sendmail11'
      }
});

async function checkUser(id) {
    const user = await User.findById(id);
    return user;
}

async function subscribe(id, subscription){
    const user = await User.findById(id);
    ///get Subscription type,
    //insert also in subscription db this entry with user
    const newSubscription = new Subscription();
    newSubscription.userEmail = user.email;
    newSubscription.type = subscription.type;
    newSubscription.startDate = new Date();
    newSubscription.endDate = newSubscription.startDate.getDate() + 30;
    newSubscription.save();

    // validate

    if (!user) throw 'User not found';
    //user.subscription = newSubscription;
    user.subscription.type = subscription.type;
    user.subscription.startDate = Date.now();
    //30 days subscription
    user.subscription.endDate = user.subscription.startDate.getDate() + 30;
    user.save();
}

async function addFriend(id, req){
    const user = await User.findById(req.userId);
    if (!user) throw 'User not found';
    var friendRequest = new FriendRequest();
    friendRequest.sender = id;
    friendRequest.reciever = req.userId;
    friendRequest.pendingStatus = true;
    friendRequest.isfriend = "sent";
    friendRequest.requestDate = Date.now();
    friendRequest.save();

}

async function requestSent(id, req){
    var users = [];
    const user = await User.findById(req.userId);
    if (!user) throw 'User not found';
    var myRequest = await FriendRequest.find({ sender: id, reciever: req.userId });
    var userRequests = await FriendRequest.find({ sender: req.userId, reciever: id });
    if((myRequest.length > 0 && myRequest[0].isfriend == "sent") && (userRequests.length == 0)){ 
        return await "myRequest";    
    }
    else if((myRequest.length == 0) && (userRequests.length > 0 && userRequests[0].isfriend == "sent")){
         return await "userRequest";
    }
    else if((myRequest.length > 0 && myRequest[0].isfriend != "sent") || (userRequests.length > 0 && userRequests[0].isfriend != "sent")){
        return await "empty";
    }

}

async function posts(id, body, files, callback){
    const user = await User.findById(id);
    if (!user) throw 'User not found';
    if(body.posttext != "" || body.posttype != "" || files.postphoto !== undefined || files.postvideo !== undefined)
    {
        var arr = [];
        var posts = new Post();
        posts.userId = user.id;
        posts.postText = body.posttext;
        posts.postType = body.posttype;
        posts.postDate = Date.now();
         if( files.postphoto !== undefined && files.postphoto.length ){
            files.postphoto.forEach(function(element){
                var newPhoto = fs.readFileSync(element.path);
                posts.postPhotos.push({path: Buffer(newPhoto, 'base64')});
            })
        }
        else if(files.postphoto !== undefined && !files.postphoto.length){
            var newPhoto = fs.readFileSync(files.postphoto.path);
            posts.postPhotos.push({path: Buffer(newPhoto, 'base64')});
        }
        if( files.postvideo !== undefined && files.postvideo.length ){
            files.postvideo.forEach(function(element){
                console.log(element);return;
                var newVideo = fs.readFileSync(element.path);
                posts.postVideos.push({path: Buffer(newVideo, 'base64')});
            })
        }
        else if(files.postvideo !== undefined && !files.postvideo.length){
            var newVideo = fs.readFileSync(files.postvideo.path);
            posts.postVideos.push({path: Buffer(newVideo, 'base64')});
        }
        posts.save();
        arr.push(posts);
        var result = await User.find({ _id: ObjectId(posts.userId) });
        await callback(arr, result)

    }
}

async function editPost(id, body, files){
    const user = await User.findById(id);
    if (!user) throw 'User not found';
    const post = await Post.findById(body.editedpostid);
    if(post){
        if(body.posttext != "" || body.posttype != "" || files.editedpostphoto !== undefined || files.editedpostvideo !== undefined)
        {
            post.userId = user.id;
            post.postText = body.editedposttext;
            post.postType = body.editedposttype;
            post.postStatus = "edited";
            post.postDate = Date.now();
             if( files.editedpostphoto !== undefined && files.editedpostphoto.length ){
                 post.postPhotos = [];
                files.editedpostphoto.forEach(function(element){
                    var newPhoto = fs.readFileSync(element.path);
                    post.postPhotos.push({path: Buffer(newPhoto, 'base64')});
                })
            }
            else if(files.editedpostphoto !== undefined && !files.editedpostphoto.length){
                post.postPhotos = [];
                var newPhoto = fs.readFileSync(files.editedpostphoto.path);
                post.postPhotos.push({path: Buffer(newPhoto, 'base64')});
            }
            else{
                post.postPhotos = [];
            }
            if( files.editedpostvideo !== undefined && files.editedpostvideo.length ){
                post.postVideos = [];
                files.editedpostvideo.forEach(function(element){
                    var newVideo = fs.readFileSync(element.path);
                    post.postVideos.push({path: Buffer(newVideo, 'base64')});
                })
            }
            else if(files.editedpostvideo !== undefined && !files.editedpostvideo.length){
                post.postVideos = [];
                var newVideo = fs.readFileSync(files.editedpostvideo.path);
                post.postVideos.push({path: Buffer(newVideo, 'base64')});
            }
            post.save();
            return "editedPost";
        }
    }
   
}

async function getMyPosts(user,callback){
    var arr = [];
    var result = await Post.find({userId: user});
    if(result.length != 0)
    {             
      arr.push(result);
      result.forEach(async function(element){
          var res = await User.find({ _id: ObjectId(element.userId) });
          await callback(arr, res)
      })
    }
    else
    {
        await callback("0");
    }
}

async function getAllPosts(user,callback){
    const arr = [];
    const array = [];
    const results = await Post.find();
    if(results.length != 0){
        const resultPromise =  _.map(results, async element => {
                arr.push(element);
                const ress = await User.find({_id: ObjectId(element.userId)});
                const resPromise = _.map(ress, async res => {
                        array.push(res);
                })
               await Promise.all(resPromise)
        })
           await Promise.all(resultPromise)
           
        return await callback(arr, array);  
    }
    else{
        callback("0");
    }
}

async function getFriendsPosts(user,callback) {
    const arr = [];
    const array = [];
    const results = await User.find({_id: ObjectId(user.id)});
    const resultPromise =  _.map(results, async element => {
        const friends = _.get(element, 'friends', [])
        if(friends.length != 0) {
        const friendPromise =  _.map(friends, async friend => {
            const ress = await User.find({_id: ObjectId(friend.id)});
            arr.push(ress);
            const resPromise = _.map(ress, async res => {
             const posts = await Post.find({userId: res._id.toString()})
                const postPromise =  _.map(posts, post => {
                    array.push(post);
                
                })
              await Promise.all(postPromise)
            })
           await Promise.all(resPromise)
        })
       await Promise.all(friendPromise)
        } 
    })
   await Promise.all(resultPromise)
   return await callback(array, arr);
}


async function likePost(id, req){
    var post = await Post.findById(req.postId);
    if(post !== null){
        post.postLikes.push({userId: id});
        post.likesCount = post.likesCount + 1;
        post.save();
        return post;
    }
    else{
        return "failed";
    }
}

async function unlikePost(id, req){
    var post = await Post.findById(req.postId);
    if(post !== null){
        for( var i = 0; i < post.postLikes.length; i++){ 
           if ( post.postLikes[i].userId == id) {
             post.postLikes.splice(i, 1); 
             post.likesCount = post.likesCount - 1;
             post.save();
            return post;
           }
        }
    }
    else{
        return "failed";
    }
}

async function deletePost(id, req){
    var post = await Post.findByIdAndRemove(req.postId);
    return post;
}


async function deleteComment(id, req){
    var comment = await Comment.findByIdAndRemove(req.commentId);
    return comment;
}

async function openDialog(req, callback){
    var arr = [];
    var users = [];
    var user = await User.findById(req.dialog_id);
    users.push(user);
    var res = await Message.find({
    $or: [
        {'sender': req.user_id, 'reciever': req.dialog_id},
        {'sender': req.dialog_id, 'reciever': req.user_id}
      ]
    });
    arr.push(res);
    await callback(arr, users);
}

async function updateMessageStatus(req){
    var res = await Message.updateMany({'sender': req.dialog_id, 'reciever': req.user_id}, {$set: {status: "seen"}}); 
    return res;
}

async function sendMessage(req, callback){
    var users = [];
    var user = await User.findById(req.sender_id);
    users.push(user);
    var message = new Message();
    message.sender = req.sender_id;
    message.reciever = req.reciever_id;
    message.message = req.message;
    message.status = "sent";
    message.messageDate = Date.now();
    message.save();
    await callback(message, users);
}

async function unreadMessages(id){
    var arr = [];
    var res = await Message.find({reciever: id, status: "sent"})

    if(res.length != 0){
        arr.push(res);
        return await arr;
    }
    else
    {
        return "0";
    }
}

async function clearChat(req){
    var query  = {'sender': req.user_id, 'reciever': req.dialog_id};
    var query2 = {'sender': req.dialog_id, 'reciever': req.user_id};
    Message.deleteMany({$or:[query, query2]},function(err){
        if (err) return err;
        else return "Success";
    });
}

async function deleteSeleced(req){
    var message = await Message.findByIdAndRemove(req.id);
    return message;
}

async function confirmEditedText(req){
    var doc = await Message.findOneAndUpdate({_id: ObjectId(req.id)}, {$set: {message: req.text}});
    if (doc)
    {
        return doc; 
    }
}

async function updateInfoStatus(id, req){
   var user = await User.findById(id);
   user.infoType = req.infoState;
   user.save();
}

async function updateMediaStatus(id, req){
   var user = await User.findById(id);
   user.mediaType = req.mediaState;
   user.save();
}

async function updateDroneStatus(id, req){
   var user = await User.findById(id);
   user.droneType = req.droneState;
   user.save();
}

async function getFriendsChat(id, req, callback){
    var friends = [];
    var arr = [];
    var user = await User.findById(id);
    if(user.friends.length != 0){
        const resultPromise =  _.map(user.friends, async element => {
            const results = await User.findById(element.id);
            friends.push(results); 
            const res = await Message.find({reciever: id, status: "sent"});
            arr.push(res);
        })
        await Promise.all(resultPromise);
        if(arr.length != 0){
            return await callback(friends, arr); 
        }
        else
        {
            return await callback(friends, "0");
        }
    }
    else{
        return "empty";
    }
}

async function logout(req){
    var user = await User.findById(req.id);
    user.status = "Offline";
    user.save();
}

async function getLikers(id, req){
    var arr = [];
    const post = await Post.findById(req.postId);
    const resultPromise =  _.map(post.postLikes, async element => {
        const results = await User.find({_id: ObjectId(element.userId)});
        arr.push(results);
    })
    await Promise.all(resultPromise);
    return await arr;
}

async function getViewers(id, req){
    var arr = [];
    var post = await Post.findById(req.postId);
    const resultPromise =  _.map(post.postViews, async element => {
        const results = await User.findById(element.userId);
        arr.push(results);
    })
    await Promise.all(resultPromise);
    return await arr;
}

async function videoViews(id, req){
    var arr = [];
    var post = await Post.findById(req.postId);
         if(post.postViews.length == 0){
            post.postViews.push({userId: id});
            post.viewsCount = post.viewsCount + 1;
            post.save();
            return await post;
         }
         else{
             post.postViews.forEach(async function(element){
                 if(element.userId.includes(id)){
                     arr.push(element);
                 }
             })
            if(arr.length == 0){
                post.postViews.push({userId: id});
                post.viewsCount = post.viewsCount + 1;
                post.save();
                return await post;
            }
            else{
                return await "seen";
            }
         }
}


async function getFriendRequests(id){
    var arr = [];
    const results = await FriendRequest.find({reciever: id, isfriend: "sent"});
    if(results.length != 0){
        const resultPromise =  _.map(results, async element => {
            const res = await User.find({_id: ObjectId(element.sender)});
            arr.push(res);
        })
        await Promise.all(resultPromise);
        return await arr;
    }
    else
    {
        return "0";
    }
}


async function acceptRequest(id, req){
    var user = await User.findById(id);
    var friend = await User.findById(req.requestId);
    var query = { sender: req.requestId, reciever: id };
    var friendRequest = await FriendRequest.find(query);
    friendRequest[0].isfriend = "accepted";
    friendRequest[0].status = "notSeen";
    friendRequest[0].save();
    user.requestDate = Date.now();
    user.friends.push({id: friend._id}); 
    user.save();
    return await "accepted";
}

async function acceptForFriend(id, req){
    var user = await User.findById(req.requestId);
    var friend = await User.findById(id);
    user.requestDate = Date.now();
    user.friends.push({id: friend._id}); 
    user.save();
    return await "accepted";
}

async function getNotifications(id, callback){
    var users = [];
    var request = [];
    const results = await FriendRequest.find({ sender: id, isfriend: "accepted" });
        if(results.length != 0){
            request.push(results);
            const resultPromise =  _.map(results, async element => {
                const res = await User.findById(element.reciever);
                if(res.length == 0){
                    return "empty";
                }
                else{
                    users.push(res);    
                }
            })
            await Promise.all(resultPromise)
            return  await callback(users, request); 
        }
        else{
            return "empty";
        }
}

// async function confirmNotification(id, req, callback){
//     MongoClient.connect(url, { useNewUrlParser: true }, async function(err, db) {
//       if (err) throw err;
//       var dbo = db.db("drones-x");
//       dbo.collection("friendrequests").findOneAndUpdate({ sender: id, isfriend: "accepted", status: "notSeen" }, {$set: {status: "seen"}}, function(err,doc) {
//        if (err) { throw err; }
//        else { console.log("Updated"); }
//      }); 

//     });
//     await callback("confirmed");
// }

async function notificationSeen(id, req){
    var query = { sender: id, isfriend: "accepted", status: "notSeen" };
    const results = await FriendRequest.updateMany(query, {$set: {status: 'seen'}});
    return await "notSeen";
}

async function declineRequest(id, req){
    var result = await FriendRequest.find({ sender: req.requestId, reciever: id }); 
    await FriendRequest.findByIdAndRemove(result[0]._id);
    return "declined";
}

async function unfriend(id, req){
    var user = await User.findById(id);
    var friend = await User.findById(req.requestId);
    var query = { sender: id, reciever: req.requestId };
    var query2 = { sender: req.requestId, reciever: id };
    FriendRequest.find(query).remove().exec();
    FriendRequest.find(query2).remove().exec();
    User.findById(id).update( 
          { $pull: { "friends" : { id: ObjectId(req.requestId) } } }
      );
    User.findById(req.requestId).update(
            { $pull: { "friends" : { id: ObjectId(id) } } }
    );
      return "removed";
}


async function comments(id, req){
    var comment = new Comment();
    comment.userId = id;
    comment.postId = req.postId;
    comment.text = req.text;
    comment.commentDate = Date.now();
    comment.save();
    return comment;
}

async function getComments(req){
    var arr = [[], []],
        ary = [],
        obj = {};

    const results = await Comment.find({postId: req.postId});
    if(results.length != 0){
        const resultPromise =  _.map(results, async element => {
             const res = await User.find({_id: ObjectId(element.userId)});
                res.forEach(function(el){
                    obj.commentId = element._id;
                    obj.comment = element.text;
                    obj.commentDate = element.commentDate;
                    ary.push(obj);
                    obj = {};
                }); 
                arr[0].push(res);
                arr[1].push(ary);
        })
            await Promise.all(resultPromise)
            return await arr;
                
    }
    else{
        return "empty";
    }
}

async function getFriends(id){
    var friends = [];
    var user = await User.findById(id);
    if(user.friends.length != 0){
        const resultPromise =  _.map(user.friends, async element => {
            const results = await User.findById(element.id);
            friends.push(results);  
        })   
            await Promise.all(resultPromise);
            return await friends;
    }
    else{
        return "empty";
    }
}


// async function getLikeNotifications(id, callback){
//     var array = [];
//     var arr = [];
//      MongoClient.connect(url, { useNewUrlParser: true }, async function(err, db) {
//       if (err) throw err;
//       var dbo = db.db("drones-x");
//       dbo.collection("posts").find({userId: id}).toArray(async function(err, result) {
//         if (err) throw err;
//         array.push(result);
//         result.forEach(function(element){
//             element.postLikes.forEach(function(elem){
//                 if(elem.status == "liked"){
//                     dbo.collection("users").find({_id: ObjectId(elem.userId)}).toArray(async function(err, res) {
//                         if (err) throw err;
//                         res.push({hahahahahaha: elem._id});
//                         arr.push(res);
//                            setTimeout(async function(){ await callback(array, arr); }, 1000);  
//                       });
//                 }
//             })
//         })
//       });
//     });
// }

async function uploadCoverPhoto(id, req){
    var newImg = fs.readFileSync(req.cover_img.path);
    var doc = await User.findOneAndUpdate({_id: ObjectId(id)}, {$set: {'coverPhoto.data': Buffer(newImg, 'base64'), 'coverPhoto.contentType': req.cover_img.type}});
    var result = await User.findById(id);
    return await result;
}

async function uploadProfilePicture(id, req){
    var newImg = fs.readFileSync(req.myImage.path);
    var doc = await User.findOneAndUpdate({_id: ObjectId(id)}, {$set: {'profilePicture.data': Buffer(newImg, 'base64'), 'profilePicture.contentType': req.myImage.type}});
    var result = await User.findById(id);
    return await result;
}

async function uploadMedia(id, req){
    if( req.myFiles.length !== undefined ){
        const resultPromise =  _.map(req.myFiles, async element => {
            var newImg = fs.readFileSync(element.path);
            await User.update(
                { "_id": ObjectId(id) },
                { "$push": { "photos": { path: Buffer(newImg, 'base64') } } }
            );
        })
        await Promise.all(resultPromise)
    }
    else{
        var newImg = fs.readFileSync(req.myFiles.path);
        await User.update(
            { "_id": ObjectId(id) },
            { "$push": { "photos": { path: Buffer(newImg, 'base64') } } }
        );
    }
    var result = await User.findById(id);
    return await result;
}

async function uploadVideo(id, req){
    if( req.myVideos.length !== undefined ){
        req.myVideos.forEach(async function(element){
            var newVideo = fs.readFileSync(element.path);
            await User.update(
                { "_id": ObjectId(id) },
                { "$push": { "videos": { path: Buffer(newVideo, 'base64') } } }
            );
        });
    }
    else{
        var newVideo = fs.readFileSync(req.myVideos.path);
        await User.update(
            { "_id": ObjectId(id) },
            { "$push": { "videos": { path: Buffer(newVideo, 'base64') } } }
        );
    }
    var result = await User.findById(id);
    return await result;
}

async function authenticate({email, password}) {
    var user = await User.findOne({email});
    if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        const token = jwt.sign({ sub: user.id }, config.secret); 
        user.status = "Online";
        user.save();
        return {
            ...userWithoutHash,
            token
        };
    }
    else{
        return "notFound";
    }
}

async function resetPassword(email) {
    const user = await User.findOne(email);
     var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 8; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));          
      }

    if(!user)
    {
        return "noUser";
    }
    else{
        var mailOptions = {
          from: "sm.test.1528@gmail.com",
          to: `${email}`,
          subject: 'Reset Password',
          text: "Your new password: " + `${text}`
        };
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            return error;
          } else {
            return 'sent';
          }
        });
         user.hash = bcrypt.hashSync(text, 10);
         user.save();
        return "sent";
    }
}

async function getAll() {
    return await User.find().select('-hash');
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function getLoggedInUser(id) {
    return await User.findById(id).select('-hash');
}

async function editName(id, userParam) {
    const user = await User.findById(id);
    if(user.name == userParam.editName)
    {
        return 'equals';
    }
    else{
        user.name = userParam.editName;
        await user.save();
        return 'notEquals';
    }
}

async function editEmail(id, userParam) {
    const user = await User.findById(id);
    if (user.email == userParam.editEmail) {
        return 'equals';

    }
    else if(await User.findOne({ email: userParam.email })){
        return 'taken';
    }
    else{
        user.email = userParam.editEmail;
        await user.save();
        return 'notEquals';
    }
    
}

async function changePassword(id, userParam) {
    const user = await User.findById(id);
    if(!bcrypt.compareSync(userParam.cur_pass, user.hash)){
        return "notEquals";
    }
    else{
        user.hash = bcrypt.hashSync(userParam.new_pass, 10);
        await user.save();
        return 'equals';
    }
    
}

async function search(id, userParam) {
    const user = await User.findById(id);
    var users = [];
    var regexp = new RegExp("^"+ userParam.name.charAt(0).toUpperCase() + userParam.name.slice(1));
    const result = await User.find({ name: regexp});
    if (result.length != 0 ) 
    {
        if(result[0].name.includes(userParam.name) || result[0].name.includes(userParam.name.charAt(0).toUpperCase() + userParam.name.slice(1))){
            const resultPromise =  _.map(result, async element => {
                if(element._id == user.id){
                    console.log('g')
                }
                else{
                     users.push(element);
                }
            })   
            await Promise.all(resultPromise);
            return await users;
        }        
    }
}

async function editUserType(id, userParam) {
    const user = await User.findById(id);
    if(user.userType == userParam.userType && user.subscription == userParam.subscription)
    {
        return "equals";
    }
    else{
        user.userType = userParam.userType;
        user.subscription = userParam.subscription;
        await user.save();
        return 'notEquals';
    }
    
}

async function charge(req){
    let amount = 1500;

  stripe.customers.create({
    email: req.email,
    card: req.id
  })
  .then(customer =>
    stripe.charges.create({
      amount,
      description: "Sample Charge",
      currency: "usd",
      customer: customer.id
    }))
  .then(function(charge){
    
    res.send(charge)
  })
  .catch(err => {
    res.status(500).send({error: "Purchase Failed"});
  });

}

async function create(userParam,res) {

    // validate
    if (await User.findOne({ email: userParam.email })) {
         throw 'taken';
        // return "taken";
    }

    const user = new User(userParam);
    var pr_img = fs.readFileSync("user.jpg");
    user.profilePicture.data = Buffer(pr_img, 'base64');
    user.profilePicture.contentType = "image/jpeg";

    var cover_img = fs.readFileSync("cover.jpg");
    user.coverPhoto.data = Buffer(cover_img, 'base64');
    user.coverPhoto.contentType = "image/jpeg";
    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.email !== userParam.email && await User.findOne({ email: userParam.email })) {
        throw 'Email "' + userParam.email + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}
