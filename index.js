const express=require('express');
const app=express();
const cors=require('cors');
const bodyParser=require('body-parser');

//api

const user=require('./first');

app.use(cors());
app.use(bodyParser.json());

app.use('/user',user);


const port = process.env.PORT || 8080;

app.listen((port), () => console.log("App is running on port " + port));