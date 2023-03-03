import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import User from './models/User.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    credentials: true,
    origin : 'http://localhost:3000'
}))
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URL)

app.get('/' , (req,res) => {
    return res.send('hello from express chat api')
})

app.get('/me', (req,res) => {
    let {token} = req.cookies;
    if(token){
        let payload = jwt.verify(token,process.env.JWT_SECRET);
        return res.status(200).json(payload);
    }else {
        return res.json(null);
    }
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
            _id:user._id,
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

app.post('/login' , async (req,res) => {
    try {
        let { username , password } = req.body;
        let user = await User.findOne({username});
        if(user) {
            let hashPassword = user.password;
            let isPasswordOk = await bcrypt.compare(password,hashPassword);
            if(isPasswordOk) {
                //create jwt token
                let token = jwt.sign({
                    _id:user._id,
                    username,
                },process.env.JWT_SECRET);
                return res.cookie('token', token).status(201).json({
                    _id : user._id
                });
            }else {
                return res.status(422).json({ message : 'password is something wrong.'});
            }
        }else {
            return res.status(422).json({ message : 'user not found'});
        }
    }catch(e) {
        console.log(e)
        return res.status(500).json({ message : 'getting error on server'});
    }
})

app.listen(process.env.PORT,() => {
    console.log('app is running on localhost:'+process.env.PORT);
})