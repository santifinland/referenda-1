var express = require('express');
var config = require('../config');
var router = express.Router();
var multer = require('multer');
var moment = require('moment');
var fs = require('fs');
var bCrypt = require('bcrypt-nodejs');
var validator = require('validatorjs');
var done = false;

var mongoose = require('mongoose');
var User = require('../models/user');
var Party = require('../models/party');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/user')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

var upload = multer({ 
    storage: storage
});


/********************************************************************

	POST /api/v1/user/
	body: name, mail, passord, avatar, city, region
	response: Success
                HTTP response:
                201 Created
                Headers:
                Location:  http://referenda.es/api/v1/user/userId
                Body: Empty

            Error
                HTTP response:
                500 Error
                Headers:
                Body:
                    {“Creation error”: “No database connection”}
***********************************************************************/
router.post('/', function(req, res, next) {
	console.log("start");
	console.log(req.body);
    
    User.find({name: req.body.name}, function(err, result){
    	if (err){
            console.log('error');
            res.status(500).json({"Creation error": "No database connection"});
            return ;
        };
    	
    	if (result) {
    		console.log('user already exists');
    		res.json({msg: 'failed'});
            return ;
    	};

    	User.create(req.body, function(err1, result1) {
    		if (err) { 
                console.log('error');
                res.status(500).json({"Creation error": "No database connection"});
                return ;
            };
            console.log('success');
            res.location('/api/v1/user/' + result._id);
            res.status(204).json({});
            return ;
    	});
    });           
});

/********************************************************************

    POST /api/v1/user/:id
    body: name, mail, passord, avatar, city, region
    response: Success
                HTTP response:
                204 Updated
                Headers:
                Location:  http://referenda.es/api/v1/user/userId
                Body: Empty

            Error
                HTTP response:
                500 Error
                Headers:
                Body:
                    {“Creation error”: “No database connection”}
***********************************************************************/
router.put('/:id', function(req, res, next) {
    console.log("start");
    console.log(req.params.id);
    console.log(req.body);

    if (req.file == undefined) {
        console.log('no logo');
        res.json({msg: 'there is no logo!'});
        return ;
    };

    var newData = req.body;
    console.log(newData);

    User.findByIdAndUpdate(req.params.id, newData, function(err, result) {
        if (err) { 
            console.log('error');
            res.status(500).json({"Creation error": "No database connection"});
            return ;
        };
        console.log('success');
        res.location('/api/v1/user/' + result._id);
        res.status(204).json({});
        return ;
    });       
});


/********************************************************************

    GET /api/v1/user/
    response: Sucess
            HTTP response:
                200 OK
            Headers:
            Body:
                {[{_id:'', name:'',...}, {_id:'', name:'',...}...]}
            Error
            HTTP response:
                500 Error
            Headers:
            Body:
                {“Retrieve error”: “No connection to db”}

***********************************************************************/
router.get('/', function(req, res, next){
    console.log('start');
    User.find(function (err, users) {
        if (err) {
            console.log('error');
            res.status(500).json({"Retrieve error": "No connection to db"});
            return ;
        }
        console.log('success');
        res.status(200).json(users);
        return ;
    });

})

/********************************************************************

    GET /api/v1/user/:id
    response: Sucess
                HTTP response:
                    200 OK
                Headers:
                Body:
                    {“nickname”: “pepe”,
                      “mail”: “pepe@mailinator.com”,
                      “avatar”: “http://referenda.es/img/logopepe.png”}
            Error
                HTTP response:
                    500 Error
                Headers:
                Body:
                    {“Retrieve error”: “No connection to db”}

***********************************************************************/
router.get('/:id', function(req, res, next){
    console.log('start');
    console.log(req.params.id);
    User.findById(req.params.id, function (err, user) {
        if (err) {
            console.log('error');
            res.status(500).json({"Retrieve error": "No connection to db"});
            return ;
        }
        console.log('success');
        res.status(200).json(user);
        return ;
    });

})


/********************************************************************

    POST /v1/user/delegate-party/
    body: user, party
    response: Sucess
                HTTP response:
                    200 OK
                Headers:
                Body:
                    {"message": "success"}
            Error
                HTTP response:
                    500 Error
                Headers:
                Body:
                    {"error”: “No connection to db”}

***********************************************************************/
router.post('/delegate-party', function(req, res, next){
    console.log('delegate-party start');
    console.log(req.body);

    
    User.findOne({_id: req.body.user}, function(err1, result1){
        if (err1) {
            console.log('error1');
            res.status(500).json({"error": "No connection to db"});
            return ;
        };

        /* find old prefered party and reduce the count */
        var old_party = result1.party;

        party.findOne({_id: old_party}, function(err2, result2){
            if (err2) {
                console.log('error2');
                res.status(500).json({"error": "No connection to db"});
                return ;
            };

            var count = result2.count - 1;

            party.findOneAndUpdate({_id: old_party}, {count: count}, function(err3, result3){
                if (err3) {
                    console.log('error3');
                    res.status(500).json({"error": "No connection to db"});
                    return ;
                };                
            })
        });

        /* update user prefered party as new */
        User.findOneAndUpdate({_id: req.body.user}, {party: req.body.party}, function(err4, result4){
            if (err4) { 
                console.log('error4');
                res.status(500).json({"error": "No connection to db"});
                return ;
            };
            console.log(result4);
        });

        /* find new prefered party and increase the count */
        party.findOne({_id: party}, function(err5, result5){
            if (err5) {
                console.log('error5');
                res.status(500).json({"error": "No connection to db"});
                return ;
            };

            var count = result5.count + 1;

            party.findOneAndUpdate({_id: party}, {count: count}, function(err6, result6){
                if (err6) {
                    console.log('error6');
                    res.status(500).json({"error": "No connection to db"});
                    return ;
                };                
                res.status(200).json({message: 'success'});
            });
        });
    });       
})

module.exports = router;



