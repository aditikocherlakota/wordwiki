var bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    express    = require("express"),
    app        = express(),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");


mongoose.connect("mongodb://localhost:27017/wordwiki", 
    { useNewUrlParser: true, useFindAndModify: false });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

var wordSchema = new mongoose.Schema({
    name: String,
    definition: {type: String, default: "No Definition Yet!"},
    example: String,
    modified: {type: Date, default: Date.now} 

})

var Word = mongoose.model("Word", wordSchema);


app.get("/", function(req, res){
    res.redirect("/words");
});

app.get("/words/new", function(req, res){
    res.render("new");
});

app.put("/words/:id", function(req, res){
    data = req.body.word;
    data.modified = Date.now;
    Word.findByIdAndUpdate(req.params.id, req.body.word, function(err, updatedBlog){
        if(err){
            res.redirect("/words");
        }
        else {
            res.redirect("/words/" + req.params.id)
        }
    });
})

app.delete("/words/:id", function(req, res){
    Word.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/words");
        }
        else {
            res.redirect("/words");
        }
    })
});

app.get("/words/:id/edit", function(req, res){
    Word.findById(req.params.id, function(err, foundWord){
        if(err){
            res.redirect("/words");
        }
        else {
            res.render("edit", {word:foundWord})
        }
    })
})

app.get("/words/:id", function(req, res){
    Word.findById(req.params.id, function(err, foundWord){
        if(err){
            res.redirect("/words");
        }
        else {
            res.render("show", {word:foundWord});
        }
    })
})

app.get("/words", function(req, res){
    Word.find({}, function(err, words){
        if (err)
            {console.log(err);}
        else 
            {res.render("index", {words: words});}
    })});

app.post("/words", function(req, res){
    data = req.body.word;
    req.body.word.definition = req.sanitize(req.body.word.definition);
    req.body.word.example = req.sanitize(req.body.word.example);

    Word.create(data, function(err, newWord){
        if(err){
            res.render("new");
        }
        else {
            res.redirect("/words");
        }
    })
})

app.listen(3000, function(){
    console.log("The WordWiki server has started!");
});

