import Team from "../models/teamModel.js";
import User from "../models/userModel.js";
import Task from "../models/taskModel.js";
import generateUniqueCode from "../utils/genarateUniqueCode.js";
import Joi from "joi";

const createTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const schema = Joi.object({
      name: Joi.string().min(3).max(50).required(),
    });
    const { error } = schema.validate({ name });
    if (error) {
      return res.status(404).json({ error: error.message });
    }

    let code;
    let existingCode;

    do {
      code = generateUniqueCode();
      existingCode = await Team.findOne({ code });
    } while (existingCode);

    const newTeam = await Team.create({ name, admin: userId, code });
    if (!newTeam) {
      return res.status(422).json({ error: "Team Not Created" });
    }

    res.status(201).json({
      message: `Team '${name}' is created by ${req.user.name} with code '${code}'`,
      team: newTeam,
    });
  } catch (error) {
    console.error(error);
    return res.status(422).json({ error: "Internal server error" });
  }
};

const joinTeamViaCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    const schema = Joi.object({
      code: Joi.string().min(6).max(6).required(),
    });

    const { error } = schema.validate({ code });
    if (error) {
      return res.status(404).json({ error: error.message });
    }

    // Find the team by code
    const team = await Team.findOne({ code });
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Find the user by user ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is already part of the team

    if (team.members.includes(userId)) {
      return res.status(400).json({ error: "User already in the team" });
    }

    // Add the team to the user's list of teams
    user.teamIds.push(team._id);
    await user.save();

    // Add the user to the team's members list
    team.members.push(user._id);
    await team.save();

    // Respond with success message
    res.status(200).json({ message: "Team joined successfully", team });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const addTeamMemberViaId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamId, addUserId } = req.body;
    const schema = Joi.object({
      teamId: Joi.string().required(),
      addUserId: Joi.string().required(),
    });

    const { error } = schema.validate({ teamId, addUserId });
    if (error) {
      return res.status(404).json({ error: error.message });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    if (team.admin.toString() !== userId) {
      return res.status(403).json({
        error: "You are not authorized to add members from this team",
      });
    }

    if (team.members.includes(addUserId)) {
      return res.status(404).json({ error: "User Already found in the team" });
    }

    const addUser = await User.findById(addUserId);
    if (!addUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add the team to the user's list of teams
    addUser.teamIds.push(team._id);
    await addUser.save();

    // Add the user to the team's members list
    team.members.push(addUserId);
    await team.save();

    // Respond with success message
    res
      .status(200)
      .json({
        message: `${addUser.username} joined ${team.name} successfully`,
        team,
      });
  } catch (error) {
    return res.status(422).json({ error: "Internal server error" });
  }
};

const removeTeamMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamId, removeUserId } = req.body;
    const schema = Joi.object({
      teamId: Joi.string().required(),
      removeUserId: Joi.string().required(),
    });

    const { error } = schema.validate({ teamId, removeUserId });
    if (error) {
      return res.status(404).json({ error: error.message });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    if (team.admin.toString() !== userId) {
      return res.status(403).json({
        error: "You are not authorized to remove members from this team",
      });
    }

    if (!team.members.includes(removeUserId)) {
      return res.status(404).json({ error: "User not found in the team" });
    }

    const removeUser = await User.findById(removeUserId);
    if (!removeUser) {
      return res.status(404).json({ error: "User not found" });
    }

    team.members = team.members.filter(
      (memberId) => memberId.toString() !== removeUserId
    );
    await team.save();

    removeUser.teamIds = removeUser.teamIds.filter(
      (teamId) => teamId.toString() !== teamId
    );
    await removeUser.save();

    res.status(200).json({ message: "Member removed successfully", team });
  } catch (error) {
    return res.status(422).json({ error: "Internal server error" });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.body;
    const userId = req.user.id;
    const schema = Joi.object({
      teamId: Joi.string().required(),
    });

    const { error } = schema.validate({ teamId });
    if (error) {
      res.status(404).json({ error: error.message });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.admin.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this team" });
    }

    const deleteteam = await Team.findByIdAndDelete(teamId);
    if (!deleteteam) {
      return res.status(404).json({ error: "Team not found" });
    }

    res
      .status(202)
      .json({ message: "Team Deleted Succesfully ! ", Team: deleteTeam });
  } catch (error) {
    return res.status(422).json({ error: "InterNal Server Error" });
  }
};

const viewAlltask = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;
    const user = await User.findById(userId);
    const team = await Team.findById(teamId).populate("tasks").populate('members');

    if (!team || !user) {
      return res.status(404).json({ error: "Internal Server Error " });
    }
    const isAdmin = team.admin.toString() === userId;
    const isMember = team.members.includes(userId);
    if (!isAdmin && !isMember) {
      return res
        .status(403)
        .json({ error: "You are not authorized to view this team" });
    }
    if (isAdmin) {
      return res.status(201).json({ Tasks: team.tasks });
    }

    res.status(201).json({
      tasks: team.tasks.filter(
        (task) => task.assignedUser.toString() === userId
      ),
    });
  } catch (error) {
    return res.status(422).json({ error: "InterNal Server Error" });
  }
};

const viewTask = (req, res) => {};

const addTask = async (req, res) => {
  try {
    const { assignedUserId, title, description, dueDate, teamId } = req.body;
    const userId = req.user.id;
    const schema = Joi.object({
      assignedUserId: Joi.string().required(),
      title: Joi.string().required(),
      description: Joi.string().required(),
      dueDate: Joi.date().required(),
    });

    const { error } = schema.validate({
      assignedUserId,
      title,
      description,
      dueDate,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Fetch the team by ID
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if(!team.members.includes(assignedUserId)){
      return res.status(404).json({ error: "User not found in the team" });
    }

    // Fetch the user creating the task
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Admin not found" });
    }

    if (team.admin.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to add tasks to this team" });
    }

    // Fetch the assigned user to validate
    const assignedUser = await User.findById(assignedUserId);
    if (!assignedUser) {
      return res.status(404).json({ error: "Assigned user not found" });
    }

    // Create a new task
    const newTask = await Task.create({
      assignedUser: assignedUser._id,
      title,
      description,
      dueDate,
    });

    if (!newTask) {
      return res.status(422).json({ error: "Task not added, try again" });
    }

    // Push the new task to the team and save
    team.tasks.push(newTask._id);
    await team.save();

    assignedUser.taskIds.push(newTask._id);
    await assignedUser.save();
    // Return success response
    res.status(201).json({
      message: "Task added successfully!",
      task: newTask,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


const editTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignedUserId, title, description, dueDate, status, priority } = req.body;
    const userId = req.user.id;

    const schema = Joi.object({
      assignedUserId: Joi.string().optional(),
      title: Joi.string().optional(),
      description: Joi.string().optional(),
      dueDate: Joi.date().optional(),
      status: Joi.string().valid('To Do', 'In Progress', 'Completed').optional(),
      priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
    });

    const { error } = schema.validate({
      assignedUserId,
      title,
      description,
      dueDate,
      status,
      priority
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Fetch the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Check if the user making the request is the admin
    const team = await Team.findOne({ tasks: taskId });
    if (!team) {
      return res.status(404).json({ error: "Team not found for the task" });
    }

    if (team.admin.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to edit tasks in this team" });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignedUserId) {
      const assignedUser = await User.findById(assignedUserId);
      if (!assignedUser) {
        return res.status(404).json({ error: "Assigned user not found" });
      }
      task.assignedUser = assignedUserId;
    }

    await task.save();
    res.status(200).json({
      message: "Task updated successfully!",
      task,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Fetch the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Check if the user making the request is the admin
    const team = await Team.findOne({ tasks: taskId });
    if (!team) {
      return res.status(404).json({ error: "Team not found for the task" });
    }

    if (team.admin.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete tasks in this team" });
    }

    team.tasks = team.tasks.filter((id) => id.toString() !== taskId);
    await team.save();

    const assignedUser = await User.findById(task.assignedUser);
    if (assignedUser) {
      assignedUser.taskIds = assignedUser.taskIds.filter((id) => id.toString() !== taskId);
      await assignedUser.save();
    }

    // Delete the task itself
    await Task.findByIdAndDelete(taskId);

    res.status(200).json({ message: "Task deleted successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export {
  createTeam,
  joinTeamViaCode,
  addTeamMemberViaId,
  removeTeamMember,
  deleteTeam,
  viewAlltask,
  viewTask,
  addTask,
  editTask,
  deleteTask
};
