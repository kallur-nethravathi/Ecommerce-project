
import mongoose from "mongoose";
 
const Schema = mongoose.Schema;
const model = mongoose.model;
import { uuidv7 } from "uuidv7";

const messageDigitalSignatureSchema = new Schema({
    mdsk_id: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv7(),
        length: 36,
        index: true,
    },
    key_label:{
        type: String,
        required:true,
        index:true,
        maxlength:200,

    },
    key_version:{
        type:Number,
        required:true,
        index:true,
    },
    key_storage_location_options:{
        type:String,
        required:true,
        enum:["database_table","database_server","application_server","self_hosted_key_vault","third_party_hosted_managed_key_vault","third_party_hosted_key_vault_with_self_managed_keys"],
        default:"application_server",
        index:true
    },
    ds_algorithm:{
        type:String,
        required:true,

    },
    algorithm_type:{
        type:String,
        required:true,
        enum:["asymmetric","symmetric"],
        default:"asymmetric",
    },
    hmac_secret_key:{
        type:String,
        default:null,
    },
    hmac_secret_key_rel_kms_provided_ref:{
        type:String,
        default:null,
    },
    private_key:{
        type:String,
        default:null,
    },
    private_key_rel_kms_provided_ref:{
        type:String,
        default:null,
    },
    public_key:{
        type:String,
        default:null,
    },
    public_key_rel_kms_provided_ref:{
        type:String,
        default:null
    },
    key_strength:{
        type:Number,
        required:true
    },
    valid_from_date_time:{
        type:Date,
        index:true,
        required:true,
        default:Date.now
    },
    valid_to_date_time:{
        type:Date,
      default:null,
    index:true
    },
    created_datetime:{
        type:Date,
        required:true,
        default:Date.now
    },
    created_datetime_epoch:{
        type:Number,
        required:true,
        default:Date.now
    },
    created_by_sm_memb_id:{
        type:String,
        required:true,
        default:null
    },
    last_updated_datetime:{
        type:Date,
        required:true,
        default:Date.now
    },
    last_updated_datetime_epoch:{
        type:Number,
        required:true,
        default:Date.now
    },
    last_updated_by_sm_memb_id:{
        type:String,
        required:true,
         default:null
    },
    last_updated_by_sm_memb_id:{
        type:String,
        required:true,
      default:null
    },
    is_active:{
        type:String,
        required:true,
        enum:['enabled','disabled'],
        default:'enabled',
        index:true
    },
    
});

 
export const messageDigitalSignatureModel = model(
    "messageDigitalSignatureKeys",
    messageDigitalSignatureSchema
);