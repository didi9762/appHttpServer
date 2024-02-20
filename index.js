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



dotenv.config();
const app = express();
const PORT = 12345;
app.use(cors());


app.use(express.json());
app.use('/client',ClientRouter)
app.use('/server',ServerRouter)

async function deleteTaks(){
  try{
  const tasksList = await Tasks.find({close:true})
  tasksList.map(async(task)=>{
    const sender = await UsersSend.findOne({userName:task.sender});
    const deliveryGuy = await Users.findOne({userName:task.deliveryGuy})
    if(!sender?.tasksHistory?.includes(task.id)&&!deliveryGuy?.tasksHistory.includes(task.id)){
      await task.deleteOne()
    }
  })}catch(e){console.log('error try to delete old tasks:',e);}
}

async function reopenTaks(){
  try{
  const tasksList = await Tasks.find({close:false})
  tasksList.map((task)=>{
    const taskToAdd = {...task.toObject()}
if(!taskToAdd.deliveryGuy){
    openMissions.set(task.id,taskToAdd)}
  })
}catch(e){console.log('error try reopen tasks:',e);}
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;


db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
console.log('Connected to MongoDB');
});
await deleteTaks()
await reopenTaks()
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



