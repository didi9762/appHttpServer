import express, { response } from "express";
import Users from "./usersSchema.js";
import UsersSend from "./usersSendSchema.js";
import openMissions from "./openMissions.js";
import { generateToken, verifyToken } from "./verify.js";
import Tasks from "./tasksSchema.js";

const ClientRouter = express.Router();

ClientRouter.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  try {
    const userD = await Users.findOne({
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
      tasksInProgress:userD.tasksInProgress
    };
    res.json({ userDetailes: userDetailes, token: token });
  } catch (e) {
    console.log("error try login:", e);
  }
});

ClientRouter.get('/getupdates',async (req,res)=>{
  try{if(!await verifyToken(req,async (userName)=>{
    const user = await Users.findOne({userName:userName})
    if(user){
      const userDetailes = {
        phone:user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        group: user.group,
        requests:user.requests,
        tasksInProgress:user.tasksInProgress
      };
      res.json(JSON.stringify(userDetailes))}
  else{res.status(500).send('error try update uer info')}})){res.status(503).send('error no token')}
  }catch(e){console.log('error try get updates:',e);}
})


ClientRouter.post('/joingroup',async(req,res)=>{//!!!!!!!add operation to resolve token!!!!!!
  const {userId,token} = req.body
  try{
    const user = await Users.findOne({userName:userId})
const sender = await UsersSend.findOne({userName:token})
if(!sender){
  res.status(299).send('299')
  console.log('user not found')
  ;return
}
else {
  if(sender.group.includes(userId)){
    res.status(298).send('298')
    console.log('already in');return
  }
  else if (sender.requests.some(request => request.userId === userId)) {
    res.status(297).send('297');
    console.log('Request already sent');
    return;
  }
  else{
    const timeStamp = new Date()
   await sender.updateOne({
    $push:{requests:{userId:userId,time:timeStamp}},
    save:true
   })
   await user.updateOne({
    $push:{requests:{userId:token,time:timeStamp}},
    save:true
   })
    res.status(200).send('request sent');
    return
}
  }
}catch(err){console.log('error while trying add to group:',err);}
})

ClientRouter.post('/submitjoin',async (req,res)=>{
  const {userId,groupId} = req.body
  try{
    const group =await UsersSend.findOne({userName:groupId})
    const client =await Users.findOne({userName:userId})
    if(!group||!client){res.status(500).send('cant find sender or client');return}
    if(!group.group.includes(userId)){
      await group.updateOne({
        $push:{group:userId},
        save:true
      })
    }
    if(!client.group.includes(groupId)){
      await client.updateOne({
        $push:{
          group:groupId},
          save:true
      })
    }
    await cancelrequest(req,res,userId,groupId)
  }catch(e){console.log('error try submit request:',e);}
})


ClientRouter.delete('/leavegroup',async(req,res)=>{
  const {userId,groupId}= req.query
  try{
    const user = await Users.findOne({userName:userId})
    const sender = await UsersSend.findOne({userName:groupId})
    if(!user||!sender){res.status(500).send('error find user or sender');return}
    if (!sender.group.includes(userId)){res.status(500).send('user is not in group');return}
    await sender.updateOne({
      $pull:{
        group:userId
      },save:true
    })
    await user.updateOne({
      $pull:{
        group:groupId
      },save:true
    })
    res.status(200).send('success')
  }catch(e){console.log('error try leave group',e);}
})

  async function cancelrequest( req,res,userId, groupId ){
    
  try {
    const user = await Users.findOne({ userName: userId });
    const sender = await UsersSend.findOne({ userName: groupId });

    if (!user || !sender) {
      res.status(500).send('Error finding user or sender');
      return;
    }

    const request = sender.requests.filter((r)=>r.userId===userId)
    if(request.length===0){res.status(500).send('not request found');return}
    await sender.updateOne(
      { $pull: { requests:{userId:userId} } },
    );

    await user.updateOne(
      { $pull: { requests:{userId:groupId} } },
    );
    res.status(200).send('ok');
  } catch (error) {
    console.log('Error trying to leave group:', error);
    res.status(500).send('Error trying to leave group');
  }}

  ClientRouter.delete('/cancelrequest', async (req, res) => {
    const { userId, groupId } = req.query;
  await cancelrequest(req,res,userId, groupId )
});


ClientRouter.get("/groupdetails", async (req, res) => {
  const groupId = req.headers.data;
  try {
    const senderD = await UsersSend.findOne({ userName: groupId });
    if (!senderD) {
      res.status(403).send("group not exist");
      return;
    }
    const groupDetailes = {
      name: `${senderD.firstName} ${senderD.lastName}`,
      address: senderD.address,
      phone: senderD.phone,
      partners: senderD.group.length,
    };
    res.json(groupDetailes);
  } catch (e) {
    console.log("error try find group details", e);
  }
});

ClientRouter.get("/open", async(req, res) => {
  try {
    if (
      !await verifyToken(req, async (userName) => {
        const user = await Users.findOne({ userName: userName });
        const missions = Array.from(openMissions.values());
        const missionsToSend = missions.filter((mission) => {
          if (
            mission.type === "public" ||
            (mission.type === "privet" && user.group.includes(mission.sender))
          ) {
            return mission;
          }
        });
        res.send(missionsToSend);
      })
    ) {
      res.send("invalid user");
    }
  } catch (e) {
    console.log("error try refresh:", e);
  }
});

ClientRouter.get('/taskshistory',async (req,res)=>{
  try {
    if (
      !await verifyToken(req,async (userName) => {
        const user = await Users.findOne({userName:userName})
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

ClientRouter.delete('/deletetaskhistory',async (req,res)=>{
  const {taskid} = req.headers 
  try{
    if(!await verifyToken(req,async(userame)=>{
      const user = await Users.findOne({userName:userame})
      const newHistoryList = user.tasksHistory.filter((id)=>id!==taskid)
      await user.updateOne({
tasksHistory:newHistoryList
      })
      res.status(200).send('deleted')
    })){res.send('invalid user')}
  }catch(e){console.log('error try delete task from history:',e)
}
})

ClientRouter.get("/close", async(req, res) => {
  try {
    if (
      !await verifyToken(req, async(userName) => {
        const user =await Users.findOne({userName:userName})
        const idsList = user.tasksInProgress
        
        async function findTasks() {
          const promises = idsList.map(async (id) => {
              return await Tasks.findOne({ id: id });
          });
          return Promise.all(promises);
      }
        const list = await findTasks()
        res.send(list);
      })
    ) {
      res.send("invalid user");
    }
  } catch (e) {
    console.log("error get tasks in progress:", e);
  }
});

export default ClientRouter;
