const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routers/user.router");
const companyRouter = require("./routers/company.router");
const addressRouter = require("./routers/address.router");
const customerRouter = require("./routers/customer.router");
const countryRouter = require("./routers/country.router");
const projectRouter = require("./routers/project.router");
const consumptionprofile = require("./routers/consumptionprofile.router");
const solarpanels = require("./routers/solarpanels.router");
const app = express();
var cors = require('cors')
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true, parameterLimit: 500000 }));

app.use(cors())

const dbURI =
  "mongodb+srv://mongocuBiraderler:y3M7FAVqf8yCAlFa@solarenergyapp.ph7woum.mongodb.net/?retryWrites=true&w=majority";
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => app.listen(3003))
  .catch((err) => console.log(err));


app.use(express.json());
app.use(userRouter);
app.use(companyRouter);
app.use(addressRouter);
app.use(customerRouter);
app.use(countryRouter);
app.use(projectRouter);
app.use(consumptionprofile);
app.use(solarpanels);



const port = process.env.PORT || 3002
;
app.listen(port);
