import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import { addTask, addTeamMemberViaId, createTeam, deleteTask, deleteTeam, editTask, joinTeamViaCode, removeTeamMember,viewAlltask,viewTask } from "../controllers/teamController.js";

const router = Router()

router.post('/createTeam',authMiddleware,createTeam);
router.post('/joinTeam',authMiddleware,joinTeamViaCode);
router.post('/addTeamMemberViaId',authMiddleware,addTeamMemberViaId);
router.patch('/remove-TeamMember',authMiddleware,removeTeamMember);
router.patch('/add-task',authMiddleware,addTask);
router.patch('/edit-task/:taskId',authMiddleware,editTask);
router.delete('/delete-task/:taskId',authMiddleware,deleteTask);
router.delete('/delete-Team',authMiddleware,deleteTeam);
// view all task of a team using TeamId
router.get('/view-tasks/:teamId',authMiddleware,viewAlltask)
// router.get('/view-task/:teamId/:taskId',authMiddleware,viewTask)

export default router 