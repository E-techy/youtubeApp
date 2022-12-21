


var menu=document.getElementById("menu");
var menuUl=document.getElementById("menuUl");
var menuBar=document.getElementById("menuBar");
var videosList=document.getElementById("videosList");
var openMenu=document.getElementById("openMenu");



//Creating the sliding effect for the menu 
menu.addEventListener("mouseover",()=>{
    if (menu.style.width!="25%") {
        menu.style.width="25%";
        menuBar.style.width="75%";
        videosList.style.width="75%"
        menuUl.style.display="block";
        openMenu.innerText="X"
    }
})
menu.addEventListener("mouseout",()=>{
    menu.style.width="5%";
    menuBar.style.width="95%";
    videosList.style.width="95%"
    menuUl.style.display="none"; 
    openMenu.innerText=">"
})
menu.addEventListener("click",()=>{
    if (menu.style.width!="25%") {
        menu.style.width="25%";
        menuBar.style.width="75%";
        videosList.style.width="75%"
        menuUl.style.display="block";
        openMenu.innerText="X"
    }
    else{
        menu.style.width="5%";
        menuBar.style.width="95%";
        videosList.style.width="95%"
        menuUl.style.display="none"; 
        openMenu.innerText=">"
    }
},{useCapture:true})





//Creating a function which will take 4 parameters videoSource, videoTitle, videoSubtitle, videoLength 
// to display the videos in the videosList <div>
function createVideoElement(videoSource,videoTitle,videoDescription,videoCategory) {

    // creating a container to hold the video and the videoInfo
    var videoContainer=document.createElement("div");
    videoContainer.className="videoContainer";
    var video=document.createElement("video");
    

    //passing the source of the video element with a query "videoSource" to be used by the server
    video.src="/video?videoSource="+videoSource;
    video.controls=false;
    videoContainer.appendChild(video);
    var videoInfo=document.createElement("div")
    videoInfo.className="videoInfo"
    var videotitle=document.createElement("h1");
    videotitle.innerText=videoTitle
    videoInfo.appendChild(videotitle)
    var videodescription=document.createElement("h5")
    videodescription.innerText=videoDescription
    videoInfo.appendChild(videodescription)
    var videocategory=document.createElement("h3")
    videocategory.innerText=videoCategory
    videoInfo.appendChild(videocategory)
    videoContainer.appendChild(videoInfo)
    document.getElementById("videosList").appendChild(videoContainer)
    video.addEventListener("click",()=>{
        video.requestFullscreen();
    })

    //Implementation for the play and pause of videos on click and 
    var videoState=document.createElement("p");
    videoState.innerText="Paused";
    videoState.id=`${videoSource}`
    videoContainer.addEventListener("mouseenter",()=>{
        videoInfo.appendChild(videoState);
    })
    videoContainer.addEventListener("mouseleave",()=>{
        if (!video.paused) {
            video.pause();
            document.getElementById(`${videoSource}`).innerText="Paused"
        }
        videoInfo.removeChild(document.getElementById(`${videoSource}`))
    })
    videoContainer.addEventListener("click",()=>{
        if (!video.paused) {
            video.pause();
            document.getElementById(`${videoSource}`).innerText="Paused"
        }else{
            video.play();
            document.getElementById(`${videoSource}`).innerText="Playing"
        }
    })

}

// Parsing the data of the html element #videoDataFromServer which is receiver from the server
var serverData=JSON.parse(document.getElementById("videoDataFromServer").innerHTML);
var totalVideos=serverData.totalVideos;
if (totalVideos==0) {
    console.log("hello world");
    var videosList=document.getElementById("videosList");
    var message=document.createElement("h1");
    message.innerHTML="Nothing to display. But you can upload your own video in the server and watch it anytime and anywhere. "
    videosList.appendChild(message);
}

//Function to display all the videos the server sends randomly by using the serverData;
for(let i=0;i<totalVideos;i++){
    var data=serverData.videosData[i];
    createVideoElement(
        data.videoSource,
        data.videoTitle,
        data.videoDescription,
        data.videoCategory
        )
}



//Sliding effect for opening the  video uploading Form
var uploadVideos=document.getElementById("uploadVideos")
uploadVideos.addEventListener("click",function openUploadingForm() {
    document.getElementById("main").style.display="none";
    document.getElementById("uploadMenu").style.display="block"
})

//closing the videouploading form
var closeUploadMenu=document.getElementById("closeUploadMenu")
closeUploadMenu.addEventListener("click",()=>{
    document.getElementById("main").style.display="block";
    document.getElementById("uploadMenu").style.display="none";
})

//Uploading the video uploading form data to the server on the /upload router
var uploadToServerButton=document.getElementById("uploadToServerButton");
var uploadingAnimation=document.getElementById("uploadingAnimation")
uploadToServerButton.addEventListener("click",(e)=>{
    e.preventDefault();
    uploadingAnimation.style.display="block";
    var formData=document.getElementById("videoUploadingForm");
    var uploadingText=document.getElementById("uploadingAnimationText")
    fetch("/upload",{
        method:"post",
        body: new FormData(formData)
    }).then(res=>res.json())
        .then(res=>{
            if (res.upload=="success") {
                console.log("File Uploaded Successfully");
                uploadingText.style.color="rgb(58, 207, 58)";
                uploadingText.innerText="File Uploaded Successfully"
                setTimeout(() => {
                    uploadingAnimation.style.display="none";
                    closeUploadMenu.click();
                    uploadingText.innerText="Uploading..."
                    uploadingText.style.color="white"
                }, 5000);
             }
             if (res.upload=="failed") {
                console.warn("File Upload Failed");
                setTimeout(() => {
                    uploadingText.style.color="red";
                    uploadingText.innerText="Upload Failed."
                }, 2000);
                setTimeout(() => {
                    uploadingText.innerText="Uploading";
                    uploadingText.style.color="white"
                    uploadingAnimation.style.display="none"; 
                }, 4000); 
                
            }
            })
            .catch(err=>{console.log("failed");
            uploadingText.style.color="red";
            uploadingText.innerText="Upload Failed"
            setTimeout(() => {
                uploadingAnimation.style.display="none"; 
                uploadingText.style.color="white"
                uploadingText.innerText="Uploading";
            }, 2000);
        })
})


//Sending search query Data to the server
var searchButton=document.getElementById("searchButton");
var videosList=document.getElementById("videosList");
searchButton.addEventListener("click",(e)=>{
    e.preventDefault();
    var searchData=document.getElementById("searchForm");
    fetch("/search",{
        method:"post",
        body: new FormData(searchData)
    })
        .then(res=>res.json())
            .then(res=>{
                            if (res.status!=undefined) {
                                console.log(res.status);
                                videosList.innerHTML="";
                                var message=document.createElement("h1");
                                message.innerText=res.status;
                                videosList.appendChild(message);
                                return;
                            }
                            console.log(res)
                            videosList.innerHTML="";
                            for (let i = 0; i < res.totalVideos; i++) {
                                var data=res.videosData[i];
                                createVideoElement(
                                    data.videoSource,
                                    data.videoTitle,
                                    data.videoDescription,
                                    data.videoCategory
                                    )
                            }

                        })
                 .catch(err=>{
                        console.log(err.json().status)
                        videosList.innerHTML="";
                        var message=document.createElement("h1");
                        message.innerText=err.json().status;
                        videosList.appendChild(message);
                    })
})


