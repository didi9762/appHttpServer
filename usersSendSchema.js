import mongoose from 'mongoose';

const usersGetsSchema = new mongoose.Schema({
firstName:String,
lastName:String,
userName:String,
password:String,
address:String,
group:Array,
phone:String,
partners:Number
})
const UsersSend = mongoose.model('usersSned',usersGetsSchema)

export default UsersSend