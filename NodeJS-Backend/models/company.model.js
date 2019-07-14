const mongoose = require('mongoose');

var companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'name can\'t be empty'
    },
    email: {
        type: String,
        unique: true
    },
    logoPath: {
        type: String,
        default: null
    },
    webSite: {
        type: String,
        default: null
    }
});

// email validation
companySchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

mongoose.model('Company', companySchema);
