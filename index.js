const express = require('express');
// const jwt = require('jsonwebtoken')
// const cookieParser = require('cookie-parser')
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT | 5000;
require('dotenv').config()
const cors = require('cors');

// app.use(cors({
//   origin: [
//     'http://localhost:5173',
//     'https://company-evaluation-platform-server.vercel.app'
//   ],
//   credentials: true
// }))

app.use(cors());
app.use(express.json());

// app.use(cookieParser())
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

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
    const noticeCollection = client.db("iOne").collection("notices");
    const hrAndUserCollection = client.db("iOne").collection("hrAndUsers");
    const employeeCollection = client.db("iOne").collection("employee");
    const imployeeTasksCollection = client.db("iOne").collection("imployeeTasks");
    const hrShareMeetCollection = client.db("iOne").collection("meetLink");

    app.post('/imployeeTasks', async (req, res) => {
      const newTask = req.body;
      const result = await imployeeTasksCollection.insertOne(newTask)
      res.send(result)
    })

    app.get("/notice", async (req, res) => {
      const result = await noticeCollection.find().toArray();
      res.send(result);
    })

    app.get("/hrAndUsers", async (req, res) => {
      const result = await hrAndUserCollection.find().toArray();
      res.send(result);
    })

    app.get('/imployeeTasks', async (req, res) => {
      const result = await imployeeTasksCollection.find().toArray()
      res.send(result)
    })

    app.get("/hrAndUsers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await hrAndUserCollection.findOne(query);
      res.send(result);
    })

    app.post("/noticeInfo", async (req, res) => {
      const notice = req.body;
      const result = await noticeCollection.insertOne(notice);
      res.send(result);
    })

    app.get('/imployeeTasks/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await imployeeTasksCollection.find(filter).toArray()
      res.send(result)
    })

    app.put("/moveTask", async (req, res) => {
      const task = req.query.task;
      const id = req.query.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: task,
        },
      };
      const result = await imployeeTasksCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    // app.post('/jwt', async (req, res) => {
    //   const user = req.body
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
    //   res
    //     .cookie('token', token, {
    //       httpOnly: true,
    //       secure: false
    //     })
    //     .send({ success: true })
    // })


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

    app.get("/users/hr/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const findUser = await userCollection.findOne(query);
      const isHr = findUser?.role === "hr";
      res.send({ isHr })
    })

    app.post("/formDetails", async (req, res) => {
      const formInfo = req?.body;
      const email = formInfo?.email;
      const query = { email: email };
      const findUser = await hrAndUserCollection.findOne(query);
      if (findUser) {
        return res.send("form user already exists");
      }
      else {
        const result = await hrAndUserCollection.insertOne(formInfo);
        res.send(result);
      }
    })

    app.post("/employee", async (req, res) => {
      const formInfo = req?.body;
      const email = formInfo?.email;
      const query = { email: email };
      const findUser = await employeeCollection.findOne(query);
      if (findUser) {
        return res.send("form user already exists");
      }
      else {
        const result = await employeeCollection.insertOne(formInfo);
        res.send(result);
      }
    })

    app.patch("/makeHr/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "checked",
        },
      };
      const result1 = await hrAndUserCollection.updateOne(filter, updateDoc);
      const findUser = await hrAndUserCollection.findOne(filter);
      const userEmail = findUser?.email;
      const filter1 = { email: userEmail };
      const updateDoc1 = {
        $set: {
          role: "hr",
        },
      };
      const result2 = await userCollection.updateOne(filter1, updateDoc1);
      res.send({ result1, result2 })
    })

    app.delete('/rejectHrRequest/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await hrAndUserCollection.deleteOne(query);
      res.send(result);
    })

    app.patch("/makeUser/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "checked",
        },
      };
      const result = await employeeCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.delete("/rejectUserRequest/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await employeeCollection.deleteOne(query);
      res.send(result);
    })

    // testing 

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result1 = await hrAndUserCollection.findOne(query);
      const email = result1?.email;
      const filter = { email: email };
      const result2 = await userCollection.deleteOne(filter);
      const result = await hrAndUserCollection.deleteOne(filter);
      res.send(result);
    })

    app.get("/allAgreements", async (req, res) => {
      const result = await hrAndUserCollection.find().toArray();
      return res.send(result);
    })

    app.get('/allAgreements/:email', async (req, res) => {
      const userEmail = req.params.email;
      const email = { email: userEmail };
      const result = await hrAndUserCollection.findOne(email);
      res.send(result);
    })

    app.get('/employee/:email', async (req, res) => {
      const userEmail = req.params.email;
      const email = { email: userEmail };
      const result = await employeeCollection.findOne(email);
      res.send(result);
    })

    app.get("/employee", async (req, res) => {
      const result = await employeeCollection.find().toArray();
      return res.send(result);
    })

    app.post('/meetLink', async (req, res) => {
      const MeetLinks = req.body;
      const result = await hrShareMeetCollection.insertOne(MeetLinks)
      res.send(result)
    })

    app.get("/meetLink", async (req, res) => {
      const result = await hrShareMeetCollection.find().toArray();
      return res.send(result);
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