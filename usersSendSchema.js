import mongoose from 'mongoose';

const usersSendsSchema = new mongoose.Schema({
firstName:String,
lastName:String,
userName:String,
password:String,
address:String,
group:Array,
phone:String,
requests:Array,
tasksInProgress:[],
tasksOpen:[],
tasksHistory:[]
})
const UsersSend = mongoose.model('userssends',usersSendsSchema)

export default UsersSend