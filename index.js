const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middlewares
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json());
app.use(cookieParser());

// middleware functions
// const logger = (req,res,next)=>{
//   console.log("rafi the superstar");
//   next();
// }
const verifyToken = (req,res,next)=>{
  const token = req.cookies.token;
  if(!token){
    return res.status(401).send({message:"Unauthorized"})
  }


  

  jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
  if(err){
    return res.status(401).send({message: "Unauthorized"})
  }
  checkingMail = decoded.email;
  next();
})

}

app.get("/", (req, res) => {
  res.send("job is fallen from the sky");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wld9ndi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const jobCollections = client.db("chakri").collection("mela");
    const applicationCollections = client.db("chakri").collection("abedon");

    app.get("/jobs", async (req, res) => {
      const cursor = jobCollections.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollections.findOne(query);
      res.send(result);
    });

    app.post("/jobapplications", async (req, res) => {
      const application = req.body;
      const result = await applicationCollections.insertOne(application);
      res.send(result);
    });

    // jwt token

    app.post("/jwt", (req, res) => {
      const {email} = req.body;
      const user = {email};
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie("token",token,{
        httpOnly:true,
        secure:false
      }).send({success:true})
    });

    app.post("/logout",(req,res)=>{
      res.clearCookie("token", {
        httpOnly:true,
        secure:false
      }).send({success:true})
    })

    app.get("/job-application", verifyToken, async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };

      if(email !== checkingMail){
        return res.status(401).send({message:"unAuthorized"})
      }
      // console.log(req.cookies)
      // console.log("cuk cuk ", req.cookies);
      const result = await applicationCollections.find(query).toArray();

      // fokkira way
      for (const application of result) {
        const query1 = { _id: new ObjectId(application.job_id) };
        const job = await jobCollections.findOne(query1);
        if (job) {
          application.title = job.title;
          application.jobType = job.jobType;
          application.category = job.category;
          application.company = job.company;
          application.company_logo = job.company_logo;
        }
      }
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("pinged");
});
