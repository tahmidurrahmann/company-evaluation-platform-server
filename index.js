const SSLCommerzPayment = require('sslcommerz-lts')
const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT | 5000;
require("dotenv").config();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.glcj3l3.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASS;
const is_live = false //true for live, false for sandbox;

async function run() {
  try {
    const reviewCollection = client.db("iOne").collection("reviews");
    const userCollection = client.db("iOne").collection("users");
    const noticeCollection = client.db("iOne").collection("notices");
    const hrAndUserCollection = client.db("iOne").collection("hrAndUsers");
    const employeeCollection = client.db("iOne").collection("employee");
    const imployeeTasksCollection = client
      .db("iOne")
      .collection("imployeeTasks");
    const hrShareMeetCollection = client.db("iOne").collection("meetLink");
    const paymentCollection = client.db("iOne").collection("payments");
    const messageCollection = client.db("iOne").collection("messages");

    app.post("/messages", async (req, res) => {
      const messageInfo = req.body;
      const result = await messageCollection.insertOne(messageInfo);
      res.send(result);
    })

    app.get("/messages", async (req, res) => {
      const result = await messageCollection.find().toArray();
      res.send(result);
    })

    app.post("/imployeeTasks", async (req, res) => {
      const newTask = req.body;
      const result = await imployeeTasksCollection.insertOne(newTask);
      res.send(result);
    });

    app.get("/notice", async (req, res) => {
      const result = await noticeCollection.find().toArray();
      res.send(result);
    });

    app.get("/hrAndUsers", async (req, res) => {
      const result = await hrAndUserCollection.find().toArray();
      res.send(result);
    });

    app.get("/imployeeTasks", async (req, res) => {
      const result = await imployeeTasksCollection.find().toArray();
      res.send(result);
    });

    app.get("/imployeeTasks", async (req, res) => {
      const result = await imployeeTasksCollection.find().toArray();
      res.send(result);
    });

    app.get("/hrAndUsers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await hrAndUserCollection.findOne(query);
      res.send(result);
    });

    app.post("/noticeInfo", async (req, res) => {
      const notice = req.body;
      const result = await noticeCollection.insertOne(notice);
      res.send(result);
    });

    app.get("/imployeeTasks/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await imployeeTasksCollection.find(filter).toArray();
      res.send(result);
    });

    app.post("/likeTask/:id", async (req, res) => {
      const taskId = req.params.id;
      try {
        await imployeeTasksCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { liked: true } }
        );
        const updatedTask = await imployeeTasksCollection.findOne({
          _id: new ObjectId(taskId),
        });
        res.json({ message: "Task liked successfully", task: updatedTask });
      } catch (error) {
        console.error("Error liking task:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.post("/disLikeTask/:id", async (req, res) => {
      const taskId = req.params.id;
      try {
        await imployeeTasksCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { status: "doing" } }
        );
        const updatedTask = await imployeeTasksCollection.findOne({
          _id: new ObjectId(taskId),
        });
        res.json({ message: "Task liked successfully", task: updatedTask });
      } catch (error) {
        console.error("Error liking task:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.get("/hrAndUsers", async (req, res) => {
      const result = await hrAndUserCollection.find().toArray();
      res.send(result);
    });

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
      const result = await imployeeTasksCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    app.post("/user", async (req, res) => {
      const userInfo = req.body;
      const userEmail = userInfo?.email;
      const query = { email: userEmail };
      const findUser = await userCollection.findOne(query);
      if (findUser) {
        return res.send("user already exists");
      } else {
        const result = await userCollection.insertOne(userInfo);
        res.send(result);
      }
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const findUser = await userCollection.findOne(query);
      const isAdmin = findUser?.role === "admin";
      res.send({ isAdmin });
    });

    app.get("/users/employee/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const findEmployee = await employeeCollection.findOne(query);
      const isEmployee = findEmployee?.status === "checked";

      res.send({ isEmployee })
    })

    app.get("/users/hr/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const findUser = await userCollection.findOne(query);
      const isHr = findUser?.role === "hr";
      res.send({ isHr });
    });

    app.post("/formDetails", async (req, res) => {
      const formInfo = req?.body;
      const email = formInfo?.email;
      const query = { email: email };
      const findUser = await hrAndUserCollection.findOne(query);
      if (findUser) {
        return res.send("form user already exists");
      } else {
        const result = await hrAndUserCollection.insertOne(formInfo);
        res.send(result);
      }
    });

    app.post("/employee", async (req, res) => {
      const formInfo = req?.body;
      const email = formInfo?.email;
      const query = { email: email };
      const findUser = await employeeCollection.findOne(query);
      if (findUser) {
        return res.send("form user already exists");
      } else {
        const result = await employeeCollection.insertOne(formInfo);
        res.send(result);
      }
    });

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
      res.send({ result1, result2 });
    });

    app.delete("/rejectHrRequest/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await hrAndUserCollection.deleteOne(query);
      res.send(result);
    });

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
    });

    app.delete("/rejectUserRequest/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await employeeCollection.deleteOne(query);
      res.send(result);
    });

    // testing

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result1 = await hrAndUserCollection.findOne(query);
      const email = result1?.email;
      const filter = { email: email };
      const result2 = await userCollection.deleteOne(filter);
      const result = await hrAndUserCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/allAgreements", async (req, res) => {
      const result = await hrAndUserCollection.find().toArray();
      return res.send(result);
    });

    app.get("/allAgreements/:email", async (req, res) => {
      const userEmail = req.params.email;
      const email = { email: userEmail };
      const result = await hrAndUserCollection.findOne(email);
      res.send(result);
    });

    app.get("/employee/:email", async (req, res) => {
      const userEmail = req.params.email;
      const email = { email: userEmail };
      const result = await employeeCollection.findOne(email);
      res.send(result);
    });

    app.get("/employee", async (req, res) => {
      const result = await employeeCollection.find().toArray();
      return res.send(result);
    });

    app.post("/meetLink", async (req, res) => {
      const MeetLinks = req.body;
      const result = await hrShareMeetCollection.insertOne(MeetLinks);
      res.send(result);
    });

    app.get("/meetLink", async (req, res) => {
      const result = await hrShareMeetCollection.find().toArray();
      return res.send(result);
    });

    const tran_id = new ObjectId().toString();

    app.post("/salary", async (req, res) => {
      const allInfo = req?.body;
      const salary = parseInt(allInfo?.salary);
      const employeeInfo = allInfo?.myEmployee;
      const names = employeeInfo?.map(item => item.name);
      const emails = employeeInfo?.map(item => item.email);
      const data = {
        total_amount: salary,
        tran_id: tran_id, // use unique tran_id for each api call
        cus_name: names[0],
        cus_email: emails[0],
        success_url: `https://company-evaluation-platform-server.vercel.app/paymentSuccess/${tran_id}`,
        fail_url: `https://company-evaluation-platform-server.vercel.app/paymentFail/${tran_id}`,
        cancel_url: 'https://company-evaluation-platform-server.vercel.app/cancel',
        ipn_url: 'https://company-evaluation-platform-server.vercel.app/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
      };
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
      sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL;
        res.send({ url: GatewayPageURL })
        const allData = {
          employeeInfo,
          tranjectionId: tran_id,
          paymentSuccess: false,
          date: allInfo?.date,
          salary: data?.total_amount,
          email: allInfo?.hrEmail,
        }
        const result = paymentCollection.insertOne(allData)
      });

      app.post("/paymentSuccess/:tranId", async (req, res) => {
        const filter = { tranjectionId: req.params.tranId };
        const updateDoc = {
          $set: {
            paymentSuccess: true,
          }
        }
        const result = await paymentCollection.updateOne(filter, updateDoc);

        if (result?.modifiedCount > 0) {
          res.redirect(`https://evaluation-platform-client.web.app/dashboard/paymentSuccess/${tran_id}`)
        }
      })

      app.post("/paymentFail/:tranId", async (req, res) => {
        const tranId = req.params.tranId;
        const query = { tranjectionId: tranId };
        const result = await paymentCollection.deleteOne(query);
        if (result?.deletedCount > 0) {
          res.redirect(`https://evaluation-platform-client.web.app/dashboard/paymentFail/${tran_id}`)
        }
      })

    })

    app.get("/paymentss", async (req, res) => {
      try {
        const userEmail = req.query.email; // Get user's email from query parameter
        const page = parseInt(req.query.page) || 1; // Get page number from query parameter, default to 1
        const limit = parseInt(req.query.limit) || 10; // Get limit from query parameter, default to 10

        const skip = (page - 1) * limit;
        const payments = await paymentCollection
          .find({ "employeeInfo.email": userEmail })
          .skip(skip)
          .limit(limit)
          .toArray();

        res.json(payments);
      } catch (error) {
        console.error("Error fetching payment history:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.get("/payments", async (req, res) => {
      const result = await paymentCollection.find().toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Company Evaluation Platform is Running");
});

const server = app.listen(port, () => {
  console.log(`Company Evaluation Platform is Running on port ${port}`);
});

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  }
});

io.on("connection", (socket) => {
  socket.on("send-message", (data) => {
    io.emit("receive-message", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    // Handle any disconnection logic if needed
  });
});