import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import User from './models/User.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';

const app = express();

app.use(cors({
    credentials: true,
    origin : 'http://localhost:3000'
}))
app.use(morgan('dev'));
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)

app.get('/' , (req,res) => {
    return res.send('hello from express chat api')
})

app.post('/register' ,  async(req,res) => {
    try {
        let { username, password } = req.body;
        //create user
        let user = await User.create({
            username,
            password : await bcrypt.hash(password,5)
        });
        
        //create jwt token
        let token = jwt.sign({
            id:user._id,
            username,
        },process.env.JWT_SECRET);
        
        //set token on client with response
        return res.cookie('token', token).status(201).json({
            _id : user._id
        });
    }catch(e) {
        return res.status(500).json({ message : 'getting error on server'});
    }
})

app.listen(process.env.PORT,() => {
    console.log('app is running on localhost:'+process.env.PORT);
})