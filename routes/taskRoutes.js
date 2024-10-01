import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { viewTask,addtask,deleteTask,editTask } from "../controllers/taskController.js";

const router=Router();
router.get('/',(req,res)=>{
    res.send("this is task route")
})
router.get('/view/:taskId',authMiddleware,viewTask)
router.post('/addTask',authMiddleware,addtask)
router.put('/editTask/:taskId',authMiddleware,editTask)
router.delete('/delete/:taskId',authMiddleware,deleteTask)


export default router
