//CS3104 Jayesh Barhate (SHOPPER WEBSITE)
//frontend = npm start
//backend = nodemon index.js
//admin = npm run dev

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { log } = require("console");

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(express.json()); // Required for JSON body parsing

// Database Connection with MongoDB
mongoose.connect("mongodb+srv://jayeshbarhate:20043337@cluster0.sa03g.mongodb.net/e-commerce")
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch(err => console.error("❌ MongoDB connection error: ", err));

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, "upload/images");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// API Home Route
app.get("/", (req, res) => {
    res.send("Express App is Running");
});

// Image Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Serve Images Statistically
app.use('/images', express.static(uploadDir));

// ✅ Fixed Upload Route
app.post("/upload", upload.single("product"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: 0, message: "No file uploaded" });
    }

    console.log("✅ File uploaded:", req.file);

    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

// ✅ Product Schema
const Product = mongoose.model("Product", {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true },
});

// ✅ Fixed `/addproduct` Route
app.post('/addproduct', async (req, res) => {
    try {
        let products = await Product.find({}).sort({ id: -1 }).limit(1); // Fetch last product only
        let id = products.length > 0 ? products[0].id + 1 : 1; // Auto-increment ID

        const product = new Product({
            id: id, // Assigning the generated ID
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price
        });

        await product.save();
        console.log("✅ Product saved:", product);

        res.json({ 
            success: true,
            name: req.body.name,
            id: id
        });

    } catch (error) {
        console.error("❌ Error saving product:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

app.post('/removeproduct', async (req, res) =>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name,
        id:req.body.id
    })
})

// Creating API for getting all product
app.get('/allproducts',async(req, res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
}) 

// Schema Creating for User Model

const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

//Creating Endpoint for registering for User
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false, errors:"existing user found with same email address"})
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })
    await user.save();

    const data = {
        user:{
            id:user.id
        }
    }
    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token});
})

//creatin endpoint for user login
app.post('/login', async (req, res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {
                user:{
                    id : user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({success:true, token});
        }
        else{
            res.json({success:false,errors:"Wrong Password"});
        }
    }
    else{
        res.json({success:false, errors:"Wrong Email Id"});
    }
})
//Creating endpoint for newcollection data
app.get('/newcollections', async (req, res) =>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
    
}) 

//Creating  endpoint for popular in women section
app.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({category:"women"});
    let popular_in_women = products.slice(0,4);
    console.log("Popular in Women fetched");
    res.send(popular_in_women);
    
})

// create middleware to fetch user
    const fetchUser = async (req, res, next) =>{
        const token = req.header('auth-token');
        if(!token){
            res.status(401).send({errors:"Please authenticate using valid token"})
        }
        else{
            try{
                const data = jwt.verify(token, 'secret_ecom');
                req.user = data.user;
                next();
            }catch(error){
                res.status(401).send({errors:"Please authenticate using valid token"})
            }
        }
    }

//creating endpoint for adding product in cardData
app.post('/addtocart', fetchUser, async (req, res)=>{
    //console.log(req.body, req.user);
    console.log("Added",req.body.itemId);

    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added");
     
})
// creating endpoint to remove from cartData
app.post('/removefromcart',fetchUser, async (req, res) => {
    console.log("removed",req.body.itemId);
    
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed");
})


//creating endpoint to get cartData
app.post('/getcart',fetchUser,async(req, res) =>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
    
})

// Start Server
app.listen(port, (error) => {
    if (!error) {
        console.log(`🚀 Server is running on http://localhost:${port}`);
    } else {
        console.error("❌ Error starting server: ", error);
    }
});
