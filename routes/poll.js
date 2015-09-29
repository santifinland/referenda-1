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
var Poll = require('../models/poll');
var User = require('../models/user');


/********************************************************************

	POST /api/v1/poll/
	body: type, institution, tier, headline, short_description, 
            long_description, link, pub_date, vote_start, vote_end,
            positive, negative, abstence, official_positive,
            official_negative, official_abstence
	response: Success
                HTTP response:
                201 Created
                Headers:
                Location:  http://referenda.es/api/v1/poll/_id
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

    var newData = req.body;
    var str_tmp1 = req.body.vote_start;
    var str_ret1 = str_tmp1.replace('/', '-');   
    newData.vote_start = moment(str_ret1).format('YYYY-MM-DD HH:mm:ss');

    var str_tmp2 = req.body.vote_start;
    var str_ret2 = str_tmp2.replace('/', '-');   
    newData.vote_eDate = moment(str_ret2).format('YYYY-MM-DD HH:mm:ss');

    var str_tmp2 = req.body.pub_date;
    var str_ret2 = str_tmp2.replace('/', '-');   
    newData.pub_date = moment(str_ret2).format('YYYY-MM-DD HH:mm:ss');

    console.log(newData);

    Poll.create(newData, function(err, result) {
        if (err) { 
            console.log('error');
            res.status(500).json({"Creation error": "No database connection"});
            return ;
        };
        console.log('success');
        res.location('/api/v1/poll/' + result._id);
        res.status(201).json({});
        return ;
    });         
});

/********************************************************************

    PUT /api/v1/poll/:id
    body: type, institution, tier, headline, short_description, 
            long_description, link, pub_date, vote_start, vote_end,
            positive, negative, abstence, official_positive,
            official_negative, official_abstence
    response: Success
                HTTP response:
                204 Updated
                Headers:
                Location:  http://referenda.es/api/v1/poll/pollId
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
    console.log(req.body);

    var newData = req.body;
    var str_tmp1 = req.body.vote_start;
    var str_ret1 = str_tmp1.replace('/', '-');   
    newData.vote_start = moment(str_ret1).format('YYYY-MM-DD HH:mm:ss');

    var str_tmp2 = req.body.vote_start;
    var str_ret2 = str_tmp2.replace('/', '-');   
    newData.vote_eDate = moment(str_ret2).format('YYYY-MM-DD HH:mm:ss');

    var str_tmp2 = req.body.pub_date;
    var str_ret2 = str_tmp2.replace('/', '-');   
    newData.pub_date = moment(str_ret2).format('YYYY-MM-DD HH:mm:ss');

    console.log(newData);

    Poll.findByIdAndUpdate(newData, function(err, result) {
        if (err) { 
            console.log('error');
            res.status(500).json({"Creation error": "No database connection"});
            return ;
        };
        console.log('success');
        res.location('/api/v1/poll/' + result._id);
        res.status(204).json({});
        return ;
    });         
});


/********************************************************************

    GET /api/v1/poll/
    response: Success
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
                    {“Retrieve error”: “No database connection”}

***********************************************************************/
router.get('/', function(req, res, next){
    console.log('start');
    Party.find(function (err, polls) {
        if (err) {
            console.log('error');
            res.status(500).json({"Retrieve error": "No connection to db"});
            return ;
        }
        console.log('success');
        res.status(200).json(polls);
        return ;
    })
});


/********************************************************************

    GET /api/v1/poll/:id
    response: Success
                HTTP response:
                200 OK
                Headers:
                Body:
                    {“headline”: “pp”,
                      “short_description”: 130,
                      “long_description”: “http://referenda.es/img/logopp.png”,
                      “link”: “Partido Popular”,
                      “type: “Health”,
                      “tier”: 1,
                      “Institution”: “Congreso”,
                      “pub_date”: 2015-12-20 12:00:00,
                      “vote_start”: 2015-12-20 12:00:00,
                      “vote_end”: 2015-12-22 12:00:00,
                      “positive”: 0,
                      “negative”: 0,
                      “abstention”: 0,
                      “official_positive”: 0,
                      “official_negative”: 0,
                      “official_abstention”: 0}
            Error
                HTTP response:
                500 Error
                Headers:
                Body:
                    {“Retrieve error”: “No database connection”}

***********************************************************************/
router.get('/:id', function(req, res, next){
    console.log('start');
    console.log(req.params.id);
    Party.findById(req.params.id, function (err, poll) {
        if (err) {
            console.log('error');
            res.status(500).json({"Retrieve error": "No connection to db"});
            return ;
        }
        console.log('success');
        res.status(200).json(poll);
        return ;
    });

})

/********************************************************************
    GET /api/v1/poll/live-poll/?status=open
    GET /api/v1/poll/live-poll/?status=closed

    Response: Success
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
                    {“Retrieve error”: “No database connection”}

***********************************************************************/
router.get('/live-poll', function(req, res, next) {
    console.log("start");
    var now = moment().format('YYYY-MM-DD HH:mm:ss');
    if (req.qurey.status == "opened") {       
        Poll.findOne({$and: [   { vote_start: { $gte: now } },
                                 { vote_end: { $lt: now } }
                            ]}, 
            function(err, result){
                if (err) {
                    console.log('error');
                    res.status(500).json({"Retrieve error": "No connection to db"});
                    return ;
                }
                console.log('success');
                res.status(200).json(poll);
                return ;
            });
    } else {
        Poll.findOne({ vote_end: { $gte: now } }, 
            function(err, result){
                if (err) {
                    console.log('error');
                    res.status(500).json({"Retrieve error": "No connection to db"});
                    return ;
                }
                console.log('success');
                res.status(200).json(poll);
                return ;
            });
    }

    
});

/********************************************************************

    POST /v1/poll/direct-vote/
    body: poll, user, answer
    response: success, failed

***********************************************************************/
router.post('/direct-vote', function(req, res, next){
    console.log('direct-vote start');
    console.log(req.body);

    /* find the delegated from User collection */
    User.find({delegator: user}, function(err1, result1) { 
        if (err1) {
            return next(err1);
        };
    })  
})


module.exports = router;



