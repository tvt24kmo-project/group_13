const db=require('../database');

const transaction = {
    getAll:function(callback) {
        return db.query('SELECT * FROM transaction', callback);
    },

    getById:function(id,callback){
        return db.query('SELECT * FROM transaction WHERE id_transaction=?',[id],callback);
    },

   

    add:function(transaction_data,callback){
        return db.query('INSERT INTO transaction (transaction_type, sum, date, type,id_account) VALUES(?,?,?,?,?)',
            [transaction_data.transaction_type,
                transaction_data.sum,
                transaction_data.date,
                transaction_data.type,
            transaction_data.id_account],callback);   
    },

    delete:function(id,callback){
        return db.query('DELETE FROM transaction WHERE id_transaction=?',[id],callback);
    },

    update:function(id,transaction_data,callback){
        return db.query('UPDATE transaction SET transaction_type=?, sum=?,date=?, type=?,id_transaction=? WHERE id_transaction=?',
            [transaction_data.transaction_type,
                transaction_data.sum,
                transaction_data.date,
                transaction_data.type,
                transaction_data.id_account,id],callback);
    }
};

module.exports=transaction; 