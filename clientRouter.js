import express from 'express'
import { users } from './fakeData.js';
import openMissions from './openMissions.js';
import {generateToken, verifyToken} from './verify.js';
import { sends } from './fakeData.js';

const ClientRouter = express.Router()

ClientRouter.post('/login',(req,res)=>{
   const {userName,password} =req.body
try{
   const userD = users.filter((user)=>user.userName===userName&&user.password===password)
   const token = generateToken(userD.id)
delete userD.password
   res.json({userDetailes:userD,token:token})
}catch (e){console.log('error try login:',e);}


})
ClientRouter.get('/groupdetails',(req,res)=>{
   const groupId = req.headers.data
   try{
      const group = sends.filter((sender)=>sender.groupId===String(groupId))
      if(!group){res.status(500).send('group not found')}
      res.json(group)
   }catch(e){console.log('error try find group details');}
})

ClientRouter.get('/',(req,res)=>{
   try{
      console.log('try');

   if(!verifyToken(req,()=>{res.send(Array.from(openMissions.values()))})){res.send('invalid user')}
  }catch(e){
   console.log('error try refresh:',e);
   }

})


export default ClientRouter