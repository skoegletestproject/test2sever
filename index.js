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


const TestVideo = connectDB.validation("testvidios");




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


app.get('/check-live', async (req, res) => {
  const divisename = "Device-2"
  try {
    const now = new Date();
    const currentDate = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().slice(0, 8); 
    const oneMinuteAgo = new Date(now.getTime() - 1.5 * 60 * 1000);
    const oneMinuteAgoTime = oneMinuteAgo.toTimeString().slice(0, 8); 
    const formatDate = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
  };

 const datt= formatDate(currentDate)
    // console.log(datt,oneMinuteAgoTime,currentTime)

    const fromdate=datt,todate=datt,fromtime=oneMinuteAgoTime ,totime=currentTime
   
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
// console.log(urls)
    if(urls.length===0){
    return  res.send({isLive:false})
    }
    res.send({isLive:true,urls})
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
