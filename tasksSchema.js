import mongoose from "mongoose";

const tasksSchema = new mongoose.Schema({
    id: String,
    type: {
        type: String,
        enum: ['privet', 'public'],
        default: 'public'
    },
    open: Boolean,
    deliveryGuy:String,
    saved: Boolean,
    close: Boolean,
    source: String,
    destination : String,
    sender: String,
    price: Number,
    notes: String,
    receiverPhone: String,
    wehicleType: {
        type: String,
        enum: ['station', 'motor', 'car', ''],
        default: ''
    },
    pickUpTime:Number,
    deliveryTime:{
        type:String,
        enum:['now','long']
    },
    weight:Number,
    itemType:String,
    paymentMethod:{ type: String, enum: ['cash', 'app'],default:'cash' },
    senderName:String,
    reciverName:String
});


const Tasks = mongoose.model('alltasks', tasksSchema);

export default Tasks;
