import mongoose from 'mongoose';

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
        console.error('MONGO_URI is not defined in the environment variables');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

export default connectDB;
