import mongoose from "mongoose";

const tasksSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['privet', 'public'],
        default: 'public'
    },
    open: Boolean,
    deliveryGuy:String,
    saved: Boolean,
    source: String,
    destination : String,
    sender: String,
    price: Number,
    notes: String,
    receiverPhone: String,
    vehicleType: {
        type: String,
        enum: ['station', 'motor', 'car', ''],
        default: ''
    },
    pickupTime:Number,
    deliveryTime:{
        type:String,
        enum:['now','long']
    },
    weight:Number,
    deliveryGuy:String,
    itemType:String,
    paymentMethod:{ type: String, enum: ['cash', 'app'],default:'cash' },
    senderName:String,
    reciverName:String,
    blockedUsers:Array
});


const Tasks = mongoose.model('alltasks', tasksSchema);

export default Tasks;
