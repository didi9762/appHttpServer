import express from "express";
import openMissions from "./openMissions.js";

import Users from "./usersSchema.js";
import Tasks from "./tasksSchema.js";

const ServerRouter = express.Router();

ServerRouter.post("/newtask", async (req, res) => {
  try {
    const { newtask } = req.body;
    const newMission = new Tasks(newtask)
  await newMission.save()
    openMissions.set(newtask.id, newtask);
    res.status(200).send('posted')
  } catch (error) {
    console.log("error try add task to open missions:", error);
    res.status(500).send("error try add task to open missions")
  }
});


ServerRouter.put("/save", async (req, res) => {
  const { missionId,userName } = req.body;
  try {
    const update = await openMissions.get(missionId);
    if (!update) {
      console.log(`mission:${missionId} not found`);
      res.send("unsucces-close");
      return;
    }
    if (update.open) {
      const updateMission = update;
      updateMission.open = false;
      updateMission.saved= userName
      openMissions.set(update.id, updateMission);
      res.send({ message: "hold-success", mission: updateMission });
    } else if (update.close) {
      res.send("unsucces-close");
    } else {
      res.send("already-in-hold");
    }
  } catch (error) {
    console.log("error try to hold mission");
  }
});

ServerRouter.put("/close", async (req, res) => {//request to close task after confirm from sender
  const { missionId } = req.body;
  try {
    const task = await Tasks.findOne({id:missionId})
    const update = await openMissions.get(missionId);
    if (!update || !task) {
      console.log(`mission:${missionId} not found`);
      res.send("unsucces-close");
      return;
    }
    if (update.open) {
res.send('unsecces-no-hold')
    } else if (update.close) {
      res.send("unsucces-close");
    } else {
      await task.updateOne({deliveryGuy:update.saved})
      const user = await Users.findOne({userName:update.saved})
      await user.updateOne({
        $push:{
          tasksInProgress:missionId
        }
      })
      openMissions.delete(update.id)
      res.send("succes-close");
    }
  } catch (error) {
    console.log("error try to hold mission");
  }
});

ServerRouter.delete('/closetask/:taskId/:userId',async(req,res)=>{
  const {taskId,userId}= req.params
  try{
    const user = await Users.findOne({userName:userId})
    await user.updateOne({
      $pull:{
        tasksInProgress:taskId
      }
    })
    const Task = await Tasks.findOne({id:taskId})
    await Task.updateOne({close:true})
    const added =await addTaskToHistory(userId,taskId)
    const massage = `Task done ${added?'Added to history':null}`
  res.status(200).send(massage)
}catch(e){console.log('error try delete task:',e);res.status(500).send('error deliting task')}
})


async function addTaskToHistory(userId,taskId){
  try{
    const user = await Users.findOne({userName:userId})
    await user.updateOne({
    $push:{
      tasksHistory:taskId
    }
    })
    return true
  }catch(e){console.log('error try add task to history:',e);}
}

export default ServerRouter;
