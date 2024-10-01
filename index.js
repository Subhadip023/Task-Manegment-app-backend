import express from 'express'
import dotenv from 'dotenv'
import { mongoose,connect } from 'mongoose';
import userRoute from './routes/userRoutes.js'
import taskRouter from './routes/taskRoutes.js'
import teamRouter from './routes/teamRoutes.js'


dotenv.config()
const app =express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))    


app.get('/',(req,res)=>{
    res.send('Hello World')
})


app.use('/api/users',userRoute)
app.use('/api/tasks',taskRouter)
app.use('/api/team',teamRouter)


// Connect to MongoDB Atlas
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB Atlas', err));


app.listen(process.env.PORT,()=>console.log(`Server is running on port http://localhost:${process.env.PORT}`))