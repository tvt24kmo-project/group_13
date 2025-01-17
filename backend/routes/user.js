const express = require('express');
const router = express.Router();
const user = require('../models/user_model');

router.get('/',function(request, response){
    user.getAll(function(err,result){
        if (err){
            response.json(err);
        }
        else {
            response.json(result);

        }
    })
});

router.get('/:id',function(request, response){
    user.getAll(request.params.id,function(err,result){
        if (err){
            response.json(err);
        }
        else {
            response.json(result);

        }
    })
});

router.post('/',function(request,response){
user.add(request.body,function(err,result){
    if (err){
        response.json(err);
    }
    else {
        response.json(result);

    }
})
});

module.exports=router;