const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qczjssr.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const announcementCollection = client
      .db("vistaForum")
      .collection("announcement");
    // const postCollection = client.db("vistaForum").collection("posts");
    const usersCollection = client.db("vistaForum").collection("users");
    const addPostsCollection = client.db("vistaForum").collection("allPosts");

    // middleware
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "forbidden access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "forbidden access" });
        }
        req.decoded = decoded;
        next();
      });
    };

    // verify admin
    // const verifyAdmin = async (req, res, next) => {
    //   const email = req.decoded.email;
    //   const query = { email: email };
    //   const user = await usersCollection.findOne(query);
    //   const isAdmin = user?.role == "admin";
    //   if (!isAdmin) {
    //     return res.status(403).send({ message: "Unauthorized access" });
    //   }
    //   next();
    // };

    // jwt api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ token });
    });
    //   announcement collection
    app.get("/announcements", async (req, res) => {
      const result = await announcementCollection.find().toArray();
      res.send(result);
    });
    // all posts
    // app.get("/posts", async (req, res) => {
    //   const result = await postCollection
    //     .find()
    //     .sort({ posted_time: -1 })
    //     .toArray();
    //   res.send(result);
    // });
    // post details get method
    app.get("/allPosts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addPostsCollection.findOne(query);
      res.send(result);
    });
    // all post get method
    app.get("/posts", async (req, res) => {
      const result = await addPostsCollection
        .find()
        .sort({ posted_time: -1 })
        .toArray();
      res.send(result);
    });
    app.get("/allPosts", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await addPostsCollection.find(query).toArray();
      res.send(result);
    });
    // all users get method
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    // users post method
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existUser = await usersCollection.findOne(query);
      if (existUser) {
        return res.send({ message: "User already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // Add posts post method
    app.post("/allPosts", async (req, res) => {
      const post = req.body;
      const result = await addPostsCollection.insertOne(post);
      res.send(result);
    });
    // post delete method
    app.delete("/allPosts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addPostsCollection.deleteOne(query);
      res.send(result);
    });
    // admin role apis
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      // if (email !== req.decoded.email) {
      //   console.log("admin:false");
      // }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let admin = false;

      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });
    // // admin api
    // app.patch("/users/admin/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const updatedDoc = {
    //     $set: {
    //       role: "admin",
    //     },
    //   };
    //   const result = await usersCollection.updateOne(filter, updatedDoc);
    //   res.send(result);
    // });
    // make announcement api
    app.post("/makeAnnounce", async (req, res) => {
      const announce = req.body;
      const result = await announcementCollection.insertOne(announce);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
