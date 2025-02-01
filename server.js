let express=require('express');
let cors=require('cors');
let mongoose=require("mongoose");
let jwt=require("jsonwebtoken");
let {model}=require("./Model");
const nodemailer = require('nodemailer');
let app=express();
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
function encoding(email,password){
    return jwt.sign(password,email);
}
app.post('/login',async (req,res)=>{
    let data={
        email:req.body.email,
        password:req.body.password
    }
    console.log(data.email+"><><><>"+data.password);
    try{
    let results=await model.findOne({email:data.email,password:encoding(data.email,data.password)});
    console.log(results);
    (results)?res.status(200).json({email:results.email,fl:results.email.charAt(0)}):res.status(404).json({"message":"Invalid Authentication"});
    }catch(err){
        console.log(err)
        res.status(500).json({"message":"Server Error"})
    }
})
app.post('/signUp',async (req,res)=>{
    console.log("signUp Data");
    let data={
        email:req.body.email,
        password:req.body.password
    }
    console.log(data);
    try{
    let check=await model.findOne({email:data.email})
    console.log(check);
    if(!check){await model.create({email:data.email,password:encoding(data.email,data.password)});res.sendStatus(200);}else{res.status(404).json({"message":"user Already Exists"});}
    }catch(err){
        res.sendStatus(500);
    }
});
// Forgot password route
app.post('/forgot', async (req, res) => {
    console.log("requesting", req.body);
    let user = await model.findOne({ email: req.body.email });
    try {
        if (user) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'sanj25524@gmail.com',
                    pass: 'jidj oapr hkgi bnpv' // Use the 16-character app password generated from Google
                }
            });

            async function main(email, password) {
                const info = await transporter.sendMail({
                    from: '"From Sanjay Password Regarding..." <sanj25524@gmail.com>',
                    to: email,
                    subject: "Password Recovery",
                    text: `Your password is: ${password}`,
                    html: `<b>Your password is: ${password}</b>`,
                });

                console.log("Message sent: %s", info.messageId);
            }

            main(req.body.email, jwt.verify(user.password, user.email));
            res.status(201).json({ "message": "Email sent successfully" });
        } else {
            res.status(401).json({ "message": "User not found" });
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});
mongoose.connect("mongodb+srv://sanjaysoman46:sanjay123@aspirenex.ibkw6hj.mongodb.net/?retryWrites=true&w=majority&appName=AspireNex").then(()=>app.listen(8011,()=>console.log("Login Server COnnected"))).catch(err=>console.log(err,"Login Server Error"))
