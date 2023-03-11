import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import User from './models/User.js'
import Message from './models/Message.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import {WebSocketServer} from 'ws';

const app = express();

app.use(cors({
    credentials: true,
    origin : 'http://localhost:3000'
}))
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());


let authenticated = (req,res,next) => {
    let {token} = req.cookies;
    if(token){
        let payload = jwt.verify(token,process.env.JWT_SECRET);
        req.user = payload;
        next();
    }else {
        res.json({message : 'not authenticated'})
    }
}

mongoose.connect(process.env.MONGO_URL)

app.get('/' , (req,res) => {
    return res.send('hello from express chat api')
})

app.get('/people',authenticated,async(req,res) => {
    let users = await User.find({}, ['_id','username']);
    return res.status(200).json(users);
});

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

app.get('/messages/:userId' , authenticated ,async (req,res) => {
    try {
        let {userId}  = req.params;
        //fetch conversations between two users
        let messages = await Message.find({
            sender : {$in : [userId,req.user._id]},
            recipient : {$in : [userId,req.user._id]},
        }).sort({
            createdAt : 'asc'
        })
        return res.status(200).json(messages);
    }catch (e) {
        res.json({message : e.message})
    }
});

app.post('/logout' , (req,res) => {
    return res.cookie('token', '').status(201).json('user logged out');
});

const server = app.listen(process.env.PORT,() => {
    console.log('app is running on localhost:'+process.env.PORT);
})

const wss = new WebSocketServer({server});


wss.on('connection' , (connection,req,res) => {

    let notifyAboutOnlineUsers = () => {
        let onlineUsers = [];
            [...wss.clients].forEach(c => {
                onlineUsers.push({_id : c._id, username : c.username});
            })
            connection.send(JSON.stringify({
                onlineUsers
            }));
    }


    //kill broken connections and notify about online users every 3 secs
    connection.isAlive =  true;
    connection.timer = setInterval(() => {
        connection.ping()
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false;
            connection.terminate();
        }, 1000);
        notifyAboutOnlineUsers();
    }, 3000);

      connection.on('pong' , () => {
        clearTimeout(connection.deathTimer);
    })
    try {
        let { cookie } = req.headers;
        //handle logged in user
        if(cookie) {
            const [_,token] = cookie.split('token=')
            let payload = jwt.verify(token,process.env.JWT_SECRET);
            //add in connection instance because need to get online clients from ws clients array
            connection._id = payload._id;
            connection.username = payload.username;

        }
        //send client back for onelines user
        notifyAboutOnlineUsers();

        //listen and handle client side sent messages
        connection.on('message', async (buffer) => {
            //change toString because we receive as a buffer
            let {recipient , text}= JSON.parse(buffer.toString())
            console.log(recipient)
            if(recipient && text) {
                // store message
                let message = await Message.create({
                    recipient  : recipient._id,
                    sender : connection._id,
                    text
                });
                
                [...wss.clients]
                .filter(c => c._id === recipient._id) // check all same clients(mobile,web) connected to socket
                .forEach(c => {
                    //send to specific clients
                    c.send(JSON.stringify({message}))
                })
            }
        })
    }catch(e){
        console.log(e)
        console.log('something went wrong in web socket')
    }
})

