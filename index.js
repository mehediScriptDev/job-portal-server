const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors());
app.use(express.json());


app.get('/',(req,res)=>{
    res.send('job is fallen from the sky');
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wld9ndi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
   

    const jobCollections = client.db('chakri').collection('mela');
    const applicationCollections = client.db('chakri').collection('abedon');

    app.get('/jobs', async(req,res)=>{
      const cursor = jobCollections.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    
    app.get('/jobs/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await jobCollections.findOne(query);
      res.send(result)
    })

    app.post('/jobapplications', async(req,res)=>{
      const application = req.body;
      const result = await applicationCollections.insertOne(application);
      res.send(result);
    })


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log("pinged");
})