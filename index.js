const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT | 5000;
require('dotenv').config()
const cors = require('cors');

//iOne = DB_USER
//Aj8wWbIwwYpRwc5v = DB_PASS

app.use(cors());
app.use(express.json());


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

    app.get("/reviews", async (req, res) => {
        const result = await reviewCollection.find().toArray();
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