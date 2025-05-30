const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lpvyvs2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        // await client.connect();


        const JobsCollection = client.db('CareerCode').collection('jobs')
        const ApplicationsCollection = client.db('CareerCode').collection('applications')



        app.get('/jobs', async (req, res) => {
            const cursor = JobsCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }

            const result = await JobsCollection.findOne(query)
            res.send(result)
        })





        app.get('/applications', async (req, res) => {
            const email = req.query.email

            const query = {
                applicant: email
            }

            const result = await ApplicationsCollection.find(query).toArray()
            
            
            for (const application of result) {
                const jobID = application.jobID
                const jobQuery = {_id: new ObjectId(jobID)}
                const job = await JobsCollection.findOne(jobQuery)

                application.company = job.company
                application.company_logo = job.company_logo
                application.title = job.title
            }
            
            
            res.send(result)
        })



        app.post('/applications', async (req, res) => {
            const application = req.body
            const result = await ApplicationsCollection.insertOne(application)
            res.send(result)
        })


        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Welcome to Career Code')
})

app.listen(port, () => {
    console.log(`Career Code server is running on port ${port}`)
})