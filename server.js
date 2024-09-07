const express = require("express");
const fileUpload=require('express-fileupload');
const app = express();
const fs=require('fs');
app.use(express.static(__dirname))
app.set("views","views");
app.set("view engine","ejs");
app.use(fileUpload());
app.use(express.static("public"));


//Reading the Json file which contains the Data for loading the video first time to the user
var videosDataJsonFile=fs.readFileSync("./UploadsInformation/UploadedVideosInformation.json");
var obj=JSON.parse(videosDataJsonFile);
var maximumVideos=4;
if (obj.totalVideos<maximumVideos) {
  maximumVideos=obj.totalVideos
}
var videosData=[];
for (let i = 0; i < maximumVideos; i++) {
  videosData.push(obj.videosData[i]);  
}
obj.totalVideos=maximumVideos;
obj.videosData=videosData;


//Converting the json data to string to send to the homepage.ejs file;
var videoData=JSON.stringify(obj);



app.get("/", function (req, res) {
  res.render("homepage",
      {videoDataFromServer:videoData}
      );
});
app.get("/video", function (req, res) {
  const fileName=req.query.videoSource;
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const videoPath = `./Uploads/${fileName}`;
  const videoSize = fs.statSync(videoPath).size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

var date=new Date();
app.post("/upload",(req,res)=>{

  try {
    var file=req.files.fileToUpload;
    var currentDate=date.getDate();
    var currentMonth=date.getMonth();
    var currentYear=date.getFullYear();
    var currentHour=date.getHours();
    var currentMinutes=date.getMinutes();
    var currentSeconds=date.getSeconds();
    var currentDateAndTime=currentDate+"-"+currentMonth+"-"+currentYear+"-"+currentHour+"-"+currentMinutes+"-"+currentSeconds
  var filename="youtube"+currentDateAndTime+file.name;
  var videoTitle=req.body.videoTitle;
  var videoDescription=req.body.videoDescription;
  var videoCategory=req.body.videoCategory;
  var audience=req.body.audience;
  file.mv(__dirname+"/Uploads/"+filename);
  var videosDataFile=fs.readFileSync("./UploadsInformation/UploadedVideosInformation.json");
  var videosDataObject=JSON.parse(videosDataFile);
  videosDataObject.totalVideos+=1
  videosDataObject.videosData.push({
    "videoTitle"        :videoTitle,
    "videoDescription"  :videoDescription,
    "videoCategory"     :videoCategory,
    "audience"          :audience,
    "videoSource"     :filename,
    "wordsMatched"    : 0
  })
  var currentVideoData=JSON.stringify(videosDataObject);
  fs.writeFileSync("./UploadsInformation/UploadedVideosInformation.json",currentVideoData);
  res.send({upload:"success"})
    
  }
   catch (err) {
    console.log(err);
    res.send({upload:"failed"});
  }



})


// Creating the search route which receives searchQuery from the user and send back a json object 
// which contains all the details about the matched videos data.
app.post("/search",(req,res)=>{
 try {
        var searchQuery=req.body.searchQuery.toLowerCase().trim();
        var searchQueryArray=searchQuery.split(" ").filter((eachWord)=>eachWord.trim().length>0);
        var file=fs.readFileSync("./UploadsInformation/UploadedVideosInformation.json")
        var videosData=JSON.parse(file);
        var length=videosData.totalVideos;
        var searchQueryArrayLength=searchQueryArray.length;
        var totalVideos=0;
        var matchedVideosData=[];
        
        // for loop to get the videosData from the UploadedVideosInformation file one by one
        for (let i = 0; i < length; i++) {
        var currentVideoData=videosData.videosData[i];
        var videoTitle=currentVideoData.videoTitle.toLowerCase().trim();

        // Running the search using the searchQueryArray items one by one to check if the current video contains
        // any of the searchQueryArray items. and increasing the wordsMatched by one if a searchQuery word matches with a word in videoTitle
        for (let i = 0; i < searchQueryArrayLength; i++) {
          var currentSearchQuery=searchQueryArray[i];
          if (videoTitle.includes(currentSearchQuery)) {
            currentVideoData.wordsMatched+=1;
          }
        }
        if (currentVideoData.wordsMatched>0) {
          matchedVideosData.push(currentVideoData);
          totalVideos+=1;
        }

        }

      //sorting the matchedVideosData based on the wordsMatched 
      matchedVideosData.sort(function(a,b){
        return b.wordsMatched - a.wordsMatched;
      })

      // Sending user data that, there is no video to display
      if (totalVideos==0) {
        res.send({status:`Your search    ${req.body.searchQuery}   did not match any content.`})
        return;
      }
      videosData.totalVideos=totalVideos;
      videosData.videosData=matchedVideosData;
      
      // Sending user the matchedVideosData to be used to render video elements
      res.send(videosData)

 } catch (err) {
      //sending error to the user in case if any error happens while reading the UploadedVideosInformation file.
      res.send({status:"failed to search"})
 }

})





app.listen(443, function () {
  console.log("Listening on port 443!");
});
