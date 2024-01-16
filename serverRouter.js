import express from "express";
import openMissions from "./openMissions";

const ServerRouter = express.Router();

ServerRouter.post("/newtask", async (req, res) => {
  try {
    const { newtask } = req.body;
    openMissions.set(newtask.id, newtask);
    res.status(200)
  } catch (error) {
    console.log("error try add task to open missions:", error);
  }
});
ServerRouter.put("/save", async (req, res) => {
  const { missionId } = req.body;
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

export default ServerRouter;
