const db=require('../database');

const card_account = {
    getAll:function(callback){
        return db.query('SELECT * FROM card_account', callback);
    },
    getById:function(id,callback){
        return db.query('SELECT * FROM card_account WHERE id_card_account=?',[id],callback);
    },
    add:function(card_account_data,callback){
        return db.query('INSERT INTO card_account (id_card, id_account, account_type) VALUES(?,?,?)', [card_account_data.id_card,card_account_data.id_account, card_account_data.account_type],callback);  
    },
    delete:function(id,callback){
        return db.query('DELETE FROM card_account WHERE id_card_account=?',[id],callback);
    },
    update:function(id,card_account_data,callback){
        return db.query('UPDATE card_account SET id_card=?,id_account=?,account_type=? WHERE id_card_account=?',[card_account_data.id_card,card_account_data.id_account,card_account_data.account_type,id],callback);
}
};

module.exports=card_account;