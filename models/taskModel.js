// import { date } from "joi";
import { Schema, model } from "mongoose";

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Completed'],
        default: 'To Do',
        // required: true,
    },
    assignedUser: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low',
        required: true,
    },
}, {
    timestamps: true, 
});

export default model("Task", taskSchema);
