const bcrypt = require('bcrypt');
const saltRounds = 1

const hashPassword = plainPassword => {
    return new Promise(resolve => {
        resolve(bcrypt.hashSync(plainPassword, saltRounds));
    });
};

module.exports = {
    hashPassword,
};