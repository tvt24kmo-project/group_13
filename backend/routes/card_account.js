const express=require('express');
const router=express.Router();
const card_account = require('../models/card_account_model');

router.get('/',function(request,response){
    card_account.getAll(function(err,result){
        if (err) {
        response.json(err);
        } else {
        response.json(result);
        }
    })
});

router.get('/:id',function(request,response){
    card_account.getById(request.params.id,function(err,result){
        if (err) {
        response.json(err);
        } else {
        response.json(result);
        }
    })
});

router.post('/',function(request, response){
    card_account.add(request.body, function(err, result){
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    })
})

router.put('/:id', function(request, response) {
    card_account.update(request.params.id, request.body, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    })
});

router.delete('/:id', function(request, response) {
    card_account.delete(request.params.id, function(err, result){
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    })
});

module.exports = router;