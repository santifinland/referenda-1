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
var Party = require('../models/party');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/party')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

var upload = multer({ 
    storage: storage
});


/********************************************************************

	POST /api/v1/party/
	body: name, description, quota, logo
	response: Success
                HTTP response:
                201 Created
                Headers:
                Location:  http://referenda.es/api/v1/party/[name]
                Body: Empty

              Error
                HTTP response:
                500 Error
                Headers:
                Body:
                    {“Creation error”: “No database connection”}

***********************************************************************/
router.post('/', upload.single('logo'), function(req, res, next) {
	console.log("start");
	console.log(req.body);

    if (req.file == undefined) {
        console.log('no logo');
        res.json({msg: 'there is no logo!'});
        return ;
    };

    var newData = req.body;
    newData.logo = req.file.filename;
    console.log(newData);

    Party.create(newData, function(err, result) {
        if (err) { 
            console.log('error');
            res.status(500).json({"Creation error": "No database connection"});
            return ;
        };
        console.log('success');
        res.location('/api/v1/party/' + result._id);
        res.status(201).json({});
        return ;
    });       
});

/********************************************************************

    PUT /api/v1/party/:id
    body: name, description, quota, logo
    response: Success
                HTTP response:
                204 Updated
                Headers:
                Location:  http://referenda.es/api/v1/party/partyname
                Body: Empty
            Error
                HTTP response:
                500 Error
                Headers:
                Body:
                    {“Creation error”: “No database connection”}

***********************************************************************/
router.put('/:id', upload.single('logo'), function(req, res, next) {
    console.log("start");
    console.log(req.params.id);
    console.log(req.body);

    if (req.file == undefined) {
        console.log('no logo');
        res.json({msg: 'there is no logo!'});
        return ;
    };

    var newData = req.body;
    newData.logo = req.file.filename;
    console.log(newData);

    Party.findByIdAndUpdate(req.params.id, newData, function(err, result) {
        if (err) { 
            console.log('error');
            res.status(500).json({"Creation error": "No database connection"});
            return ;
        };
        console.log('success');
        res.location('/api/v1/party/' + result._id);
        res.status(204).json({});
        return ;
    });       
});

/********************************************************************

    GET /api/v1/party/
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
    Party.find(function (err, parties) {
        if (err) {
            console.log('error');
            res.status(500).json({"Retrieve error": "No connection to db"});
            return ;
        }
        console.log('success');
        res.status(200).json(parties);
        return ;
    });

})

/********************************************************************

    GET /api/v1/party/:id
    response: Sucess
            HTTP response:
                200 OK
            Headers:
            Body:
                {“name”: “pp”,
                  “quota”: 130,
                  “logo”: “http://referenda.es/img/logopp.png”,
                  “description”: “Partido Popular”}
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
    Party.findById(req.params.id, function (err, party) {
        if (err) {
            console.log('error');
            res.status(500).json({"Retrieve error": "No connection to db"});
            return ;
        }
        console.log('success');
        res.status(200).json(party);
        return ;
    });

})


module.exports = router;



