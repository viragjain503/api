const express = require("express");
const router = express.Router();
const { default: slugify } = require("slugify");
const cors = require("cors");
const bodyParser = require("body-parser");

router.use(cors());
router.use(bodyParser.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// const apiData = require('../blogs.json');
const ArticleModel = require("../schemas/article");
const TagsModel = require("../schemas/tags");

router.get("/title/:url", async (req, res) => {
  var result = await ArticleModel.findOne({ url: req.params.url }).populate("tags");
  var article = await ArticleModel.findOne({ url: req.params.url })
  
  if (article) {
    console.log(article)
    await article.incrementViews();
  }
  res.send(result);
});

router.get("/titles", async (req, res) => {
  console.log("titles")
  const titles = await ArticleModel.distinct("title");
  res.send(titles);
});

router.get("/:type", async (req, res) => {
  // console.log(req.params.type);
  if(req.params.type == "all"){
    var result = await ArticleModel.find({}).exec();
    res.send(result);
  }else if(req.params.type == "latest"){
    var result = await ArticleModel.find({}).sort({ published: -1 }).limit(5).exec();
    res.send(result);
  }else if(req.params.type == "top"){
    var result = await ArticleModel.find({}).sort({ published: -1 }).limit(1).exec();
    res.send(result);
  }else{
    result = [];
    res.send(result);
  }
});

router.post("/create", async (req, res) => {
  console.log(req.body);

  const tag_ids = [];
  for (let index = 0; index < req.body.tags.length; index++) {
    var already = await TagsModel.find({name: req.body.tags[index]});
    if(already.length == 0){
      const tag = new TagsModel({ name: req.body.tags[index] });
      await tag.save();
      tag_ids.push(tag._id);
    }else{
      tag_ids.push(already[0]._id);
    }
  }

  // for a single tag
  //   const tag = new TagsModel({ name: "technology" });
  //   await tag.save();

  const article = await ArticleModel.create({
    title: req.body.title,
    minsRead: req.body.minsRead,
    tags: tag_ids,
    url: slugify(req.body.title, { lower: true }),
  });

  res.send(article);
});

router.get("/tagsbyarticle", async (req, res) => {
  try {
    var result = await ArticleModel.find({
      title: "How to make a blog",
    }).populate("tags");
  } catch (error) {
    console.log(error);
  }
  console.log(result);
  res.send(result);
});

router.get("/articlesbytag/:tag", async (req, res) => {
  console.log(req.params.tag)
  const reqtag = await TagsModel.findOne({ name: req.params.tag});
  try {
    if(reqtag != null){
      var result = await ArticleModel.find({ tags: { $in: [reqtag._id] } }).populate("tags","name");
    }
  } catch (error) {
    console.log(error);
  }
  console.log(result);
  res.send(result);
});

module.exports = router;
