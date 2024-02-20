import mongoose from 'mongoose';

const usersGetsSchema = new mongoose.Schema({
firstName:String,
lastName:String,
userName:String,
password:String,
address:String,
group:Array,
phone:String,
partners:Number,
requests:Array,
tasksInProgress:[{type:Object}],
tasksHistory:[{type:Object}]
})
const UsersSend = mongoose.model('userssends',usersGetsSchema)

export default UsersSend