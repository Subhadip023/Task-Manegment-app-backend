import { Schema,model } from "mongoose";
import { hashPassword } from "../utils/hashPassword.js";
const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    taskIds:{
        type:[Schema.Types.ObjectId],
        ref:'Task',
        default:[]
    },
    teamIds: {
        type: [Schema.Types.ObjectId],  
        ref: 'Team',
        default: [],  
      },
    refreshToken: {
        type: String, 
        default: null ,
    }
});


userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await hashPassword(user.password);
    }
    next();
});

export default model ("User",userSchema)