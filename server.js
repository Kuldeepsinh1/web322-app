/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: kuldeepsinh sandipsinh mahida Student ID: 167547215 Date: 19 feb 2023
*
*  Online (Cyclic) Link: https://real-gray-harp-seal-hose.cyclic.app
*
********************************************************************************/ 

var express = require("express");
var path = require("path");
var app = express();
const { initialize, getAllPosts, getPublishedPosts, getCategories } = require("./blog-service.js");
var posts = require("./data/posts.json");
var categories = require("./data/categories.json");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
cloudinary.config({
    cloud_name: 'dywoi9nwc',
    api_key: '678284761954798',
    api_secret: 'V0ABFI_u-g0cWTJuj1n5Ve86Vj4',
    secure: true
});
app.use(express.static("public"));

var HTTP_PORT = process.env.PORT || 8080;

const upload= multer();

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
  });
app.get("/", function (req, res) {
    res.redirect("/about");
});

app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", function (req, res) {
    getPublishedPosts().then((data) => {
        res.send(data);
    })
        .catch((err) => {
            res.send(err);
        })
});

app.get("/posts", function (req, res) {
    getAllPosts().then((data) => {
        res.send(data);
    })
        .catch((err) => {
            res.send(err);
        })
});

app.get("/categories", function (req, res) {
    getCategories().then((data) => {
        res.send(data);
    })
        .catch((err) => {
            res.send(err);
        })
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart);
})


app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
  
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
  
    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }
  
    upload(req)
      .then((uploaded) => {
        req.body.featureImage = uploaded.url;
        let blogPost = {};
  
        blogPost.body = req.body.body;
        blogPost.title = req.body.title;
        blogPost.postDate = Date.now();
        blogPost.category = req.body.category;
        blogPost.featureImage = req.body.featureImage;
        blogPost.published = req.body.published;
  
        if (blogPost.title) {
          addPost(blogPost);
        }
        res.redirect("/posts");
      })
      .catch((err) => {
        res.send(err);
      });
  });