require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const port = process.env.port || 3001;

//API security
app.use(helmet());

//handle CORS errors
app.use(cors());

//MongoDB Connection Setup
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

if (process.env.NODE_ENV !== "production") {
    const mDb = mongoose.connection;
    mDb.on("open", () => {
        console.log("MongoDB is connected");
    });

    mDb.on("error", () => {
        console.log(error);
    });

    //Logger
    app.use(morgan("tiny"));
}

//Body Parser
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const userRouter = require("./src/routers/user-router");
const ticketRouter = require("./src/routers/ticket-router");
const tokenRouter = require("./src/routers/token-router");

//Use Router
app.use("/v1/user", userRouter);
app.use('/v1/ticket', ticketRouter);
app.use('/v1/tokens', tokenRouter);

//Error handler
const handleError = require("./src/utils/errorHandler");

app.use((req, res, next)=> {
    const error = new Error("Resource not found!");
    error.status = 404;    
    next(error);
});

app.use((error, req, res, next)=>{
    console.log(error);
    handleError(error, res);
});

app.listen(port, () => {
    console.log(`API is ready on http://localhost:${port}`);
});