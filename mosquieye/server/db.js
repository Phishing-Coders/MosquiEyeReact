const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://muhdnik12:mosquieye@cluster0.2pwcm.mongodb.net/Mosquieye?retryWrites=true&w=majority&appName=Cluster0', {
           
        });

        console.log(`MongoDB Connected`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = connectDB;
