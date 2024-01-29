import express from "express";
import openMissions from "./openMissions.js";
import closeMissions from "./closeMissions.js";

const ServerRouter = express.Router();

ServerRouter.post("/newtask", async (req, res) => {
  try {
    const { newtask } = req.body;
    openMissions.set(newtask.id, newtask);
    res.status(200)
  } catch (error) {
    console.log("error try add task to open missions:", error);
    res.status(500).send("error try add task to open missions")
  }
});
ServerRouter.post('/closetask',async(req,res)=>{
  const {task} = req.body;
  try{
closeMissions.set(task.id,task)
res.status(200)
  }catch(e){
    console.log('error try add close task:',e);
    res.status(500).send('error try add close task')
  }
})

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
      updateMission.save= userName
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
    const update = await openMissions.get(missionId);
    if (!update) {
      console.log(`mission:${missionId} not found`);
      res.send("unsucces-close");
      return;
    }
    if (update.open) {
res.send('unsecces-no-hold')
    } else if (update.close) {
      res.send("unsucces-close");
    } else {
      closeMissions.set(update.id,update)
      openMissions.delete(update.id)
      res.send("succes-close");
    }
  } catch (error) {
    console.log("error try to hold mission");
  }
});

ServerRouter.delete('/closetask/:taskId',async(req,res)=>{
  const taskId= req.params.taskId;
  try{closeMissions.delete(taskId)
  res.status(200).send('done')
}catch(e){console.log('error try delete task:',e);res.status(500).send('error deliting task')}
})


export default ServerRouter;
