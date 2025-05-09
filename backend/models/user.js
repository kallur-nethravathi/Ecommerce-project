import mongoose from "mongoose";

const userschema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    name:{
        type:String,
        required:true,
    },
    created_at:{
        type:Date,
        default:Date.now,
    },
    updated_at:{
        type:Date,
        default:Date.now,
    },
    added_datetime:{
        type:Date,
        default:Date.now,
    },
    updated_datetime:{
        type:Date,
        default:Date.now,
    },
    otp: {
        type: String,
        default: null,
    },
    otp_expiry: {
        type: Date,
        default: null,
    }
    }
)

const UserModel = mongoose.model("User", userschema);
export default UserModel;



