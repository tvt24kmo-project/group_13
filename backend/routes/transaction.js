const express = require('express');
const router = express.Router();
const transaction = require('../models/transaction_model');






router.get('/',function(request, response){
    console.log('GET /transactions');
    transaction.getAll(function(err,result){
        console.error('Error fetching transactions:', err);

              if (err){
            response.json(err);
            
        }
        else {
            console.log('Transactions fetched successfully');
            response.json(result);

        }
    })
});

router.get('/:id',function(request, response){
    transaction.getById(request.params.id,function(err,result){
        if (err){
            response.json(err);
        }
        else {
            response.json(result[0]);

        }
    })
});

router.post('/',function(request,response){
    transaction.add(request.body,function(err,result){
        if (err){
            console.error('Error adding transaction:', err);
            response.json(err);
        }
        else {
            response.json(request.body);
        }
    })
    }
);

router.put('/:id',function(request,response){
    transaction.update(request.params.id,request.body,function(err,result){
        if (err){
            console.error('Error updating transaction:', err);
            response.json(err);
        }
        else {
            response.json(result.affectedRows);
        }
    })
    }
);

router.delete('/:id',function(request,response){
    transaction.delete(request.params.id,function(err,result){
        if (err){
            response.json(err);
        }
        else {
            response.json(result.affectedRows);
        }
    })
    }
);

router.get('/account/:id_account',function(request, response){
    transaction.getByAccount(request.params.id_account,function(err,result){
        if (err){
            response.json(err);
        }
        else {
            response.json(result);

        }
    })
});
module.exports=router;  