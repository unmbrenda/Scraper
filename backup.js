                    options = {
                        upsert: true
                    }
                    conditions = {
                        "headline":result.headline
                    };
                    Article.findOneAndUpdate(conditions, result, options, (err, doc) => {
                        if (err){
                            console.log(err);
                            res.status(500);
                            res.json({"error":"internal server error"})
                        }
                    })

                    withComQuery = Article.find({"comments": {$ne: null}}).sort({"created": -1});
                    withComQuery.exec( (err, withComArts) => {
                        withoutQuery = Article.find({"comments": null}).sort({"created": -1});
                        withoutQuery.exec( (err, withoutComArts) => {
                            return res.json({"with": withComArts, "without": withoutComArts});
                        })
                    })