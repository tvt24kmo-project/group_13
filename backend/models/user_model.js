const db = require('../database');

const user = {
    getAll: function(callback) {
        return db.query('SELECT * FROM user', callback);
    },

    getById: function(id, callback) {
        return db.query('SELECT * FROM user WHERE id_user=?', [id], callback);
    },

    add: function(user_data, callback) {
        return db.query('INSERT INTO user (firstname, lastname, pic_path) VALUES(?,?,?)', 
            [user_data.firstname, user_data.lastname, user_data.pic_path], callback);
    },

    delete: function(id, callback) {
        return db.query('DELETE FROM user WHERE id_user=?', [id], callback);
    },

    update: function(id, user_data, callback) {
        return db.query('UPDATE user SET firstname=?, lastname=?, pic_path=? WHERE id_user=?', 
            [user_data.firstname, user_data.lastname, user_data.pic_path, id], callback);
    }
};

module.exports = user;