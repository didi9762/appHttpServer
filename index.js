import express from 'express';
import ClientRouter from './clientRouter.js';
import ServerRouter from './serverRouter.js';
import cors from 'cors'
import dotenv from 'dotenv';
import mongoose from 'mongoose';


dotenv.config();
const app = express();
const PORT = 12345;
app.use(cors());


app.use(express.json());
app.use('/client',ClientRouter)
app.use('/server',ServerRouter)

app.get('/aa',(req,res)=>{
  res.send('ok')
})

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
console.log('Connected to MongoDB');
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



