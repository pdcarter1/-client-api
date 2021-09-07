const Joi = require('joi');

const email = Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'nz'] } });
const pin = Joi.string().min(6).max(6).required();
const newPassword = Joi.string().alphanum().min(6).max(30).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'));

const resetPassReqValidation = (req, res, next) => {
    const schema = Joi.object({email});
    const value = schema.validate(req.body);

    if(value.error){
        return res.json({status: "error", message:value.error.message});
    }
    next();
};

const updatePasswordValidation = (req, res, next) => {
    const schema = Joi.object({ email, pin, newPassword });
    const value = schema.validate(req.body);

    if (value.error) {
        return res.json({ status: "error", message: value.error.message });
    }
    next();
};

module.exports = {
    resetPassReqValidation,
    updatePasswordValidation,
};