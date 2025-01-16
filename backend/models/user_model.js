const db=require('../database');
const bcrypt=require('bcryptjs');

const user={
getAll:function(callback) {
    return db.query('SELECT * FROM user', callback);
    },
    getById:function(id,callback){
return db.query('SELECT * FROM user WHERE iduser=?',[id],callback);
    },
    add:function(user_data,callback){
        bcrypt.hash(user_data.password, 10, function(err, hashed_password){
            return db.query('INSERT INTO user(username,password,fname,lname,address)VALUES(?,?,?,?,?)',[user_data.username,hashed_password,user_data.fname,user_data.lname,user_data.address],callback);
        })
        
    }
}

module.exports=user;