const db=require('../database');

const account = {
    getAll:function(callback) {
        return db.query('SELECT * FROM account', callback);
    },

    getById:function(id,callback){
        return db.query('SELECT * FROM account WHERE id_account=?',[id],callback);
    },

    getByUserId:function(id,callback){
        return db.query('SELECT * FROM account WHERE id_user=?;',[id],callback);
    },

    add:function(account_data,callback){
        return db.query('INSERT INTO account (amount,`limit`,balance,id_user) VALUES(?,?,?,?)',[account_data.amount,account_data.limit,account_data.balance,account_data.id_user],callback);   
    },

    delete:function(id,callback){
        return db.query('DELETE FROM account WHERE id_account=?',[id],callback);
    },

    update:function(id,account_data,callback){
        return db.query('UPDATE account SET amount=?,`limit`=?,balance=?,id_user=? WHERE id_account=?',[account_data.limit,account_data.limit,account_data.balance,account_data.id_user,id],callback);
    }
};

module.exports=account;