const express = require('express');
const router = express.Router();  


router.get('/',function(request,response){
    user.getAll(request.params.id,function(err,result){
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});


router.get('/:id', function(request, response) { 
    user.getById(request.params.id, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

router.post('/', function(request, response) {
    user.add(request.body, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

router.put('/:id', function(request, response) {  // Muutin POST -> PUT 
    user.update(request.params.id, request.body, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

router.delete('/:id', function(request, response) {
    user.delete(request.params.id, function(err, result) {
        if (err) {
            response.json(err);
        } else {
            response.json(result);
        }
    });
});

module.exports = router;