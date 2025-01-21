const express=require('express');
const router=express.Router();

router.get('/',function(request,response){
    card_account.getAll(request.params.id,function(err,result){
        if (err) {
        response.json(err);
        } else {
        response.json(result);
        }
    });
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
    });
});

router.delete('/:id', function(request, response) {
    card_account.delete(request.params.id, function(err, result){
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

module.exports = router;