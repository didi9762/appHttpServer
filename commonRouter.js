import Users from "./usersSchema.js";
import UsersSend from "./usersSendSchema.js";
import Tasks from "./tasksSchema.js";
import { verifyToken,generateToken } from "./verify.js";
import express from "express";

const CommonRouter = express.Router()

CommonRouter.get('/taskshistory',async (req,res)=>{
    try {
        const {issender} = req.headers
      if (
        !await verifyToken(req,async (userName) => {
          const user =issender==='true'?await UsersSend.findOne({userName:userName}): await Users.findOne({userName:userName})
          if(!user){
            res.status(503).send('error user not found');return}
          const tasksIdList = user.tasksHistory
          async function findTasks() {
            const promises = tasksIdList.map(async (id) => {
                return await Tasks.findOne({ id: id });
            });
            return Promise.all(promises);
        }
        const resList = await findTasks()
          res.send(resList);
        })
      ) {
        res.send("invalid user");
      }
    } catch (e) {
      console.log("error try get history tasks:", e);
    }
  })
  
  CommonRouter.delete('/deletetaskhistory',async (req,res)=>{
    const {taskid,issender} = req.headers 
    try{
      if(!await verifyToken(req,async(userName)=>{
        const user =issender==='true'?await UsersSend.findOne({userName:userName}): await Users.findOne({userName:userName})
        const newHistoryList = user.tasksHistory.filter((id)=>id!==taskid)
        await user.updateOne({
  tasksHistory:newHistoryList
        })
        res.status(200).send('deleted')
      })){res.send('invalid user')}
    }catch(e){console.log('error try delete task from history:',e)
  }
  })

  export default CommonRouter