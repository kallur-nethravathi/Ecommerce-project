import mongoose from "mongoose";

export const connectDB = async () => {

    try{
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log("MongoDB Connected");
    }catch(error){
        console.error("MongoDB Connection Error:", error);
        throw error;
    }
};

