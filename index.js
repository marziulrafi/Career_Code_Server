const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000

app.use(cors({
    origin: ['http://localhost:5173/'],
    credentials: true
}))
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


        // JWT
        app.post('/jwt', async (req, res) => {
            const { email } = req.body
            const user = { email }

            const token = jwt.sign(user, 'sec', { expiresIn: '1h' })
            res.send({ token })
        })




        // Jobs
        app.get('/jobs', async (req, res) => {

            const email = req.query.email;
            const query = {};
            if (email) {
                query.hr_email = email;
            }

            const cursor = JobsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });


        app.get('/jobs/applications', async (req, res) => {
            const email = req.query.email
            const query = { hr_email: email }
            const jobs = await JobsCollection.find(query).toArray()


            for (const job of jobs) {
                const applicationQuery = { jobID: job._id.toString() }
                const application_count = ApplicationsCollection.countDocuments(applicationQuery)

                job.application_count = application_count
            }

            res.send(jobs)
        })

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }

            const result = await JobsCollection.findOne(query)
            res.send(result)
        })


        app.post('/jobs', async (req, res) => {
            const newJob = req.body
            console.log(newJob)

            const result = await JobsCollection.insertOne(newJob)
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
                const jobQuery = { _id: new ObjectId(jobID) }
                const job = await JobsCollection.findOne(jobQuery)

                application.company = job.company
                application.company_logo = job.company_logo
                application.title = job.title
            }


            res.send(result)
        })




        app.get('/applications/job/:job_id', async (req, res) => {
            const job_id = req.params.job_id
            const query = { jobID: job_id }
            const result = await ApplicationsCollection.find(query).toArray()

            res.send(result)
        })


        app.post('/applications', async (req, res) => {
            const application = req.body
            const result = await ApplicationsCollection.insertOne(application)
            res.send(result)
        })


        app.patch('/applications/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: req.body.status
                }
            }

            const result = await ApplicationsCollection.updateOne(filter, updatedDoc)
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