const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const cheerio = require('cheerio');
const axios = require('axios');
const mongoose = require('mongoose');
const Article = require('./models/articleModel.js');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json())

const mongoConn = process.env.mongodb || "mongodb://localhost/scrappyscrapper";
mongoose.connect(mongoConn);

app.get('/api/scrape', (req, res, next) => {
    axios.get("http://www.nytimes.com")
        .then(data => {
            const $ = cheerio.load(data.data)

            const results = [];
            const articles = $("div.collection article");
            articles.each( (i, article) => {
                var result = {};

                result.headline = $("h2 a", article).text();
                result.uri = $("h2 a", article).attr("href");
                result.summary = $("p.summary", article).text();

                if(result.headline && result.uri && result.summary){
                    results.push(result)
                }

            })
            return res.json(results)
        })
        .catch( err => {
            return res.send(err);
        })
})


app.post('/api/article/save', (req, res, next) => {
    const article = req.body;
    const {headline, uri, summary} = req.body;
    options = {
        upsert: true
    }
    conditions = {
        headline,
    };

    story = {
        headline,
        uri,
        summary,
    };

    Article.findOneAndUpdate(conditions, story, options, (err, doc) => {
        if (err){
            console.log(err);
            res.status(500);
            res.json({"error":"internal server error"})
        }
        res.status(200);
        res.json({"status":"ok"})
    })
})

app.get('/api/article/:id', (req, res, next) => {
    const id = req.params.id;
    const query = Article.findOne({"_id": id});
    query.exec( (err, article) => {
        if(err){
            console.log(err);
            res.status(500);
            res.json({"status":"internal server error"});
        }
        return res.json(article);
    })
})

app.get('/api/saved', (req, res, next) => {
    artQuery = Article.find().sort({"created": -1});
    artQuery.exec( (err, articles) => {
            return res.json(articles);
    })
})

app.post('/api/comment/add', (req, res, next) => {
    const {articleId, comment} = req.body;

    Article.update(
        {_id: articleId},
        {$push: {comments: {comment}}},
        (err, data) => {
            if(err){
                throw err;
            }
            res.statusCode = 200;
            return res.json({"status":"ok"});
        }
    )
})

app.delete('/api/article/:articleId/comment/delete/:commentId', (req, res, next) => {
    const articleId = req.params.articleId;
    const commentId = req.params.commentId;

    Article.findOne({'_id': articleId}, (err, result) => {
        result.comments.id(commentId).remove();
        result.save();
        res.statusCode = 200;
        return res.json({"status":"ok"});
    });

})

app.delete('/api/article/delete/:articleId', (req, res, next) => {
    const articleId = req.params.articleId;
    Article.remove({'_id': articleId}, (err, result) => {
        if(err){
            console.log(err)
            res.statusCode = 500;
            return res.json({"status":"internal server error"});
        }
        return res.json({"status":"ok"});
    })
})

app.listen(PORT, () => {
    return console.log(`Server listening on: http://localhost: ${PORT}`);
});