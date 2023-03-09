import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    recipient : {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
    sender : {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
    text : String,
}, {timestamps:true});

const Message = mongoose.model("Message", MessageSchema);
export default Message;