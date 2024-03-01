import express from "express";
import openMissions from "./openMissions.js";
import Users from "./usersSchema.js";
import Tasks from "./tasksSchema.js";
import { verifyToken,generateToken } from "./verify.js";
import UsersSend from "./usersSendSchema.js";

const SenderRouter = express.Router()

SenderRouter.post("/login", async (req, res) => {
    const { userName, password } = req.body;
    try {
      const userD = await UsersSend.findOne({
        userName: userName,
      });
      if (!userD) {
        console.log("error try fined user");
        res.status(403).send({error:"user not found"});
        return;
      }
      else if(userD.password!==password){console.log('password incorect');res.status(403).send({error:'incorrect password'});return}
      const token = generateToken(userD.userName);
      const userDetailes = {
        phone:userD.phone,
        firstName: userD.firstName,
        lastName: userD.lastName,
        userName: userD.userName,
        group: userD.group,
        requests:userD.requests,
        tasksInProgress:userD.tasksInProgress,
        tasksOpen:userD.tasksOpen
      };
      res.json({ userDetailes: userDetailes, token: token });
    } catch (e) {
      console.log("error try login:", e);
    }
  });
  
  SenderRouter.get('/updateuserinfo',async(req,res)=>{
    try{
const isvalid = await verifyToken(req,async(userName)=>{
        const user = await UsersSend.findOne({userName:userName})
        res.json({
            phone:user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
            group: user.group,
            requests:user.requests,
            tasksInProgress:user.tasksInProgress,
            tasksOpen:user.tasksOpen});return true
        })
        if(!isvalid){ res.status(503).send('error try update user info: invalid token');return}
    }catch(e){console.log('error try update user info:',e);}
  })

SenderRouter.get('/opentasks',async(req,res)=>{
    try{
        let resList =[]
    if(!await verifyToken(req,(userName)=>{
        openMissions.forEach((task)=>{if(task.sender===userName){
            resList.push(task)
        }})
        res.send(resList);return true
    })){res.status(503).send('error no token')}
}catch(e){console.log('error try get user open tasks: invalid token');}
})

SenderRouter.get('/tasksinprogress', async (req, res) => {
    try {
        if (!await verifyToken(req, async (userName) => {
            const sender = await UsersSend.findOne({ userName: userName });
            const resList = await Promise.all(sender.tasksInProgress.map(async (taskId) => {
                const task = await Tasks.findOne({ id: taskId });
  return task
            }));
            const filteredResList = resList.filter(task => task !== null);
            res.send(filteredResList);return true
        })) {
            res.status(503).send('error try get tasks in progress: invalid token');
        }
    } catch (e) {
        console.log('error try get tasks in progress:', e);
        res.status(500).send('Internal server error');
    }
});

SenderRouter.get('/taskoverview',async(req,res)=>{
    const {taskid,username} = req.headers
    try{
        const task = await Tasks.findOne({id:taskid,sender:username})
        if(!task){res.status(503).send("task does not exist" );return}
        setTimeout(async () => {
            try {
                const response = {
                    address: task.address,
                    price: task.price,
                    deliveryGuy: task.deliveryGuy
                };
                res.json(JSON.stringify(response));
            } catch (error) {
                console.log('Error while preparing response:', error);
                res.status(500).send('Internal Server Error');
            }
        }, 2000);
    }catch(e){
        console.log('error try get task overview info:',e);
    }
})



export default SenderRouter

