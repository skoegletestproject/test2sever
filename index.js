require("dotenv").config();


const express = require("express");
const cors = require("cors"); 
const morgan = require("morgan");
const connectDB = require("mb64-connect");


const app = express();


app.use(cors());
app.use(morgan("dev")); 
app.use(express.json()); 


connectDB(process.env.MONGODB_URI);


const TestVideo = connectDB.validation("tests");




app.get("/fetch-urls", async (req, res) => {
  try {
    const urls = await TestVideo.find(); 
    res.status(200).json(urls); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get("/findbydate", async (req, res) => {
  const { fromdate, todate } = req.query;

  if (!fromdate || !todate) {
    return res.status(400).json({ message: "Both fromdate and todate are required" });
  }

  try {
  
    const urls = await TestVideo.find({
      date: {
        $gte: fromdate, 
        $lte: todate,   
      },
    });
    res.status(200).json(urls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
















































app.get("/findbydateandtime", async (req, res) => {
  const { fromdate, todate, fromtime, totime } = req.query;

  if (!fromdate || !todate) {
    return res.status(400).json({ message: "Both fromdate and todate are required" });
  }

  try {
  
    const query = {
      date: {
        $gte: fromdate, 
        $lte: todate,  
      },
    };

  
    if (fromtime && totime) {
      query.$and = [
        { fromtime: { $gte: fromtime } },
        { totime: { $lte: totime } },   
      ];
    }

    const urls = await TestVideo.find(query);
    res.status(200).json(urls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




app.get("/find", async (req, res) => {

  const { fromdate, todate, fromtime, totime,divisename } = req.query;
  
 
  if (!fromdate || !todate) {
    return res.status(400).json({ message: "Both fromdate and todate are required" });
  }

  try {
   
    const query = {
      date: {
        $gte: fromdate, 
        $lte: todate,   
      },
    };

   
    if (fromtime && totime) {
      query.$and = [
        { fromtime: { $gte: fromtime } }, 
        { totime: { $lte: totime } },   
      ];
    }

  
    if (divisename) {
      query.divisename = divisename;
    }

    const urls = await TestVideo.find(query);
    res.status(200).json(urls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
