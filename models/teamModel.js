import { Schema, model } from "mongoose";

const teamSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique:true,
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: {
    type: [Schema.Types.ObjectId], 
    ref: 'User',
    default: [],  },
  tasks: { 
    type: [Schema.Types.ObjectId],
    ref:'Task' ,
    default: []
 },
 

});

export default model("Team", teamSchema);
