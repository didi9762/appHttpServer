import express from 'express';
import ClientRouter from './clientRouter.js';
import ServerRouter from './serverRouter.js';
import cors from 'cors'
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Tasks from './tasksSchema.js';
import Users from './usersSchema.js';
import UsersSend from './usersSendSchema.js';
import openMissions from './openMissions.js';
import SenderRouter from './senderRouter.js';
import CommonRouter from './commonRouter.js';



dotenv.config();
const app = express();
const PORT = 12345;
app.use(cors());


app.use(express.json());
app.use('/client',ClientRouter)
app.use('/server',ServerRouter)
app.use('/sender',SenderRouter)
app.use('/common',CommonRouter)

async function deleteTaks(){
  try{
  const tasksList = await Tasks.find({open:false})
  tasksList.map(async(task)=>{
    const sender = await UsersSend.findOne({userName:task.sender});
    const deliveryGuy = await Users.findOne({userName:task.deliveryGuy})
    if(!sender?.tasksHistory?.includes(task._id)&&!deliveryGuy?.tasksHistory.includes(task._id)){
      await task.deleteOne()
    }
  })}catch(e){console.log('error try to delete old tasks:',e);}
}

async function reopenTaks(){
  try{
  const tasksList = await Tasks.find({open:true})
  console.log(tasksList.length==0?'none open tasks':`reopen ${tasksList.length} tasks` );
  tasksList.map((task)=>{
    const newtask = {...task.toObject()}
    const taskToAdd = {
      saved:false,
      open:true,
      _id:newtask._id,
      type:newtask.type,
    sender:newtask.sender,
    source:newtask.source,
    destination:newtask.destination,
    price:newtask.price,
    vehicleType:newtask.vehicleType?newtask.vehicleType:'',
    pickupTime:newtask.pickupTime,
    senderName:newtask.senderName,
    blockedUsers:newtask.blockedUsers,
    }
    if(newtask.deliveryGuy){taskToAdd.deliveryGuy=newtask.deliveryGuy}
if(!taskToAdd.deliveryGuy){
    openMissions.set(task._id.toString()
      ,taskToAdd)}
  })
}catch(e){console.log('error try reopen tasks:',e);}
}

mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;


db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
console.log('Connected to MongoDB');
});
await deleteTaks()
await reopenTaks()

async function resetAllTasks(){
  try{
    const usersGet = await Users.find({})
    const userSend = await UsersSend.find({})
    const tasks = await Tasks.find({})
    usersGet.map(async(user)=>await user.updateOne({tasksInProgress:[],tasksHistory:[]}))
    userSend.map(async(user)=>await user.updateOne({tasksHistory:[],tasksOpen:[],tasksInProgress:[]}))
    tasks.map(async(task)=>await task.deleteOne())
  }catch(e){console.log('error try reset all tasks');}
}



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



