import express from "express";
import Users from "./usersSchema.js";
import UsersSend from "./usersSendSchema.js";
import openMissions from "./openMissions.js";
import { generateToken, verifyToken } from "./verify.js";


const ClientRouter = express.Router();

ClientRouter.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  try {
    const userD = await Users.findOne({userName:userName,password:password})
    if(!userD){console.log('error try fined user');res.status(403).send('user not found');return}
    const token = generateToken(userD._id);
    const userDetailes = {
      fitstName: userD.firstName,
      lastName: userD.lastName,
      userName: userD.userName,
      group: userD.group,
    };
    res.json({ userDetailes: userDetailes, token: token });
  } catch (e) {
    console.log("error try login:", e);
  }
});

ClientRouter.get("/groupdetails", async (req, res) => {
  const groupId = req.headers.data;
  try {
   const senderD = await UsersSend.findOne({userName:groupId})
   if (!senderD){res.status(403).send('group not exist');return}
   const groupDetailes ={
name:`${senderD.firstName} ${senderD.lastName}`,
address:senderD.address,
phone:senderD.phone,
partners:senderD.group.length()
}    
res.json(groupDetailes);
  } catch (e) {
    console.log("error try find group details");
  }
});

ClientRouter.get("/", (req, res) => {
  try {
    console.log("try");

    if (
      !verifyToken(req, () => {
        res.send(Array.from(openMissions.values()));
      })
    ) {
      res.send("invalid user");
    }
  } catch (e) {
    console.log("error try refresh:", e);
  }
});

export default ClientRouter;
