const card = {
    getAll:function(callback){
        return db.query('SELECT * FROM card', callback);
    },
    getById:function(callback){
        return db.query('SELECT * FROM card WHERE id_card = ?', [id],callback);
    },
    add:function(card_data,callback){
        return db.query('INSERT INTO card(type, card_number, pin, retrys) VALUES(?,?,?,?)',[card_data.type,card_data.card_number,card_data.pin,card_data.retrys,id],callback);
    },

    update:function(id,card_data,callback){
        return db.query('UPDATE card SET type=?,card_number=?,pin=?, retrys=? WHERE id_card=?',[card_data.type,card_data.card_number,card_data.pin,card_data.retrys,id],callback);
    },
    delete:function(id,callback){
        return db.query('DELETE FROM card WHERE id_card = ?',[id],callback);
    }
};

module.exports=card;