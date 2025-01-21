const express = require('express');
const card = require('../models/card_model');
const router = express.Router();  

router.get('/',function(request,response){
    card.getAll(request.params.id,function(err,result){
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

router.get('/:id', function(request, response) { 
    card.getById(request.params.id, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

router.post('/', function(request,response){
    card.add(request.body, function(err,result){
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

router.put('/:id', function(request, response){
    card.update(request.params.id, request.body, function(err,result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

router.delete('/:id', function(request, response){
    card.delete(request.params.id, function(err,result){
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

module.exports=router;