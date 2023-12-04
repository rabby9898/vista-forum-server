const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
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
    await client.connect();
    const announcementCollection = client
      .db("vistaForum")
      .collection("announcement");
    // const postCollection = client.db("vistaForum").collection("posts");
    const usersCollection = client.db("vistaForum").collection("users");
    const addPostsCollection = client.db("vistaForum").collection("allPosts");

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
      const result = await addPostsCollection.find().toArray();
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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
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
