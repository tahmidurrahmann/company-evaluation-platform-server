const express = require('express');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT | 5000;
require('dotenv').config()
const cors = require('cors');


app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://evaluation-platform-client.web.app'
  ],
  credentials: true
}))
app.use(express.json());
app.use(cookieParser())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.glcj3l3.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const reviewCollection = client.db("iOne").collection("reviews");
    const userCollection = client.db("iOne").collection("users");

    app.post('/jwt', async (req, res) => {
      const user = req.body
      console.log(user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      console.log(token)
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: false
        })
        .send({ success: true })
    })


    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })

    app.post("/user", async (req, res) => {
      const userInfo = req.body;
      const userEmail = userInfo?.email;
      const query = { email: userEmail };
      const findUser = await userCollection.findOne(query);
      if (findUser) {
        return res.send("user already exists");
      }
      else {
        const result = await userCollection.insertOne(userInfo);
        res.send(result);
      }
    })

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const findUser = await userCollection.findOne(query);
      const isAdmin = findUser?.role === "admin";
      res.send({ isAdmin })
    })

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Company Evaluation Platform is Running")
})

app.listen(port, () => {
  console.log(`Company Evaluation Platform is Running on port ${port}`);
})