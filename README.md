# youtubeApp
A application somewhat similar to youtube
This application works somewhat similar to original Youtube.

In this app, user can uploads videos in the server and add all video related information such as videoTitle, video 
description, video category.
This uploaded information is stored as a json file in the server. 


There is a search bar in the application which can be used to get the videos which are uploaded in the server by ,everyone.
The searchQuery is passed to the server and the server splits the search query into an array of words and then matches this array
with all videos data based on their videoTitle. and give points to videos if any of the words matches with their video title.
Then these points are used to set which video will be shown at the top and which will be shown at the bottom to the user.
