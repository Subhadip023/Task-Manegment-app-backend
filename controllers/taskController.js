import Task from "../models/taskModel.js";
import Joi from'joi'
import userModel from "../models/userModel.js";

const addtask = async (req, res) => {
    try {
      const { title, description,dueDate } = req.body;
      const userId = req.user.id; 
    
      const schema = Joi.object({
        title: Joi.string().min(3).max(30).required(),
        description: Joi.string().min(3).max(320000).required(),
      });
  
      const { error } = schema.validate({ title, description });
      if (error) {
        return res.status(400).json({ error: error.message }); 
      }
  
      const newTask = await Task.create({
        title,
        description,
        assignedUser: userId,
        dueDate
      });
      if(newTask){
        const user=await userModel.findById(userId)

        user.taskIds.push(newTask._id)
        await user.save()
      }
  
      if (!newTask) {
        return res.status(422).json({ error: "Task Not Added, Try again" }); 
      }
  
      return res.status(201).json({ message: "Task Created Successfully", task: newTask }); 
  
    } catch (error) {
      console.error(error); 
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

 const viewTask = async(req, res) => {
    try {
        const {taskId}=req.params

        const task=await Task.findById(taskId).populate('assignedUser')
        const userId=req.user.id
        
        if (!task) {
            return res.status(422).json({ error: "Task Not Found, Try again" }); 
          }
          res.status(201).json({Task:task})

    } catch (error) {
      console.error(error); 
      return res.status(500).json({ error: "Internal Server Error" });
    }
 };



const editTask = async (req, res) => {
    try {
        const { taskId } = req.params;  
        const params = req.body;       
        
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { ...params }, 
            { new: true, runValidators: true }  
        );

        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" });
        }

        return res.status(200).json(updatedTask);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteTask = async(req, res) => {
    try {
        const {taskId}=req.params

        const task = await Task.findByIdAndDelete(taskId)
        if(!task){
            return res.status(404).json({ error: "Task Not Found, Try again"})
        }

        res.status(202).json({message:'Task Deleted Succesfully ! ',Task:task})

    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"Internal Server Error"})
    }
};


export { addtask, deleteTask, editTask, viewTask };
