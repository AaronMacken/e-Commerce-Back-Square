const mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

// admin account schema
const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// before a new admin is saved, use bcrypt to hash password
adminSchema.pre('save', async function(next) {
    try {
        if(!this.isModified("password")) {
            return next();
        }
        let hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
        return next();
    } catch(err) {
        return next(err);
    }
});

// make a compare password function available to all models of this admin schema
adminSchema.methods.comparePassword = async function(candidatePassword, next) {
    try {
        let isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (err) {
        return next(err);
    }
}

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;