app.service('queryKeywordService', ['$log', 'dtFormatterService', 'tagPredictionService', function ($log, dtFormatterService, tagPredictionService) {

    var self = this;

    var keywords = [];

    function keyword(name, regex, singleton = true, uiEncode, urlEncode) {
        this.name = name;
        this.regex = regex;
        this.singleton = singleton;
        this.uiEncode = uiEncode;
        this.urlEncode = urlEncode;
    }

    //date
    var date = new keyword('date', /\d{1,2}\/\d{1,2}\/\d{4}/g, true, function (date) {
        return Promise.resolve(dtFormatterService.dateDecode(date))
    }, function (date) {
        return Promise.resolve(dtFormatterService.dateEncode(date))
    });
    keywords.push(date);
    //time
    var time = new keyword('timeStamp', /(?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]/g, true, function (time) {
        return Promise.resolve(dtFormatterService.timeDecode(time))
    }, function (time) {
        return Promise.resolve(dtFormatterService.timeEncode(time))
    });
    keywords.push(time);
    //tag
    var tag = new keyword('tags', /\b[a-z]{1,20}\b/g, false, function (tag) {
        return Promise.resolve(tag)
    }, function tagUiEncode(tag) {
        return new Promise(function (resolve, reject) {
            tagPredictionService.getTag(tag).then(function (result) {
                console.log(result);
                if (result.data.length > 0 != undefined) {
                    resolve(result.data[0]._id);
                }
            })
        })
    });
    keywords.push(tag);


    self.getKeywords = function () {
        return keywords;
    }

    self.uiEncode = function (keyword, value) {
        for (var i = 0, n = keywords.length; i < n; i++) {
            if (keyword === keywords[i]) {
                if (keywords[i].hasOwnProperty('uiEncode')) {
                    return uiEncode(value);
                }
            }
        }
        return value;
    }

    self.urlEncode = function (keyword, value) {
        return new Promise(function (resolve, reject) {
            for (var i = 0, n = keywords.length; i < n; i++) {
                if (keyword == keywords[i].name) {
                    if (keywords[i].singleton) {
                        value = [value[0]];
                    }
                    const promisesToResolve = value.map(keywords[i].urlEncode);
                    Promise.all(promisesToResolve).then(function (result) {
                        resolve(result);
                    })
                }
            }
        })
    }


    var queryTypes = [];

    function query(name, regex, single = true) {
        this.name = name;
        this.regex = regex;
        this.single = single;
    }

    var date = new query('date', /\d{1,2}\/\d{1,2}\/\d{4}/g, true);
    queryTypes.push(date);

    //time
    var time = new query('timeStamp', /(?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]/g, true);
    queryTypes.push(time);

    //tag
    var tag = new keyword('tags', /\b[a-z]{1,20}\b/g, false);
    queryTypes.push(tag)

    self.extractQueries = function (search) {
        var queryArray = [];

        for (var i = 0, n = queryTypes.length; i < n; i++) {
            var regexResult = search.match(queryTypes[i].regex);

           
            if (regexResult != null) {
                if (queryTypes[i].single) {
                    regexResult = [regexResult[0]];
                }
                queryArray.push({
                    name: queryTypes[i].name,
                    value: regexResult
                })
            }
        }

        return queryArray;
    }

    self.extractQuery = function (queryType) {
        for (var i = 0, n = queryTypes.length; i < n; i++) {
            if (queryTypes[i].name === queryType) {
                var regexResult = search.match(queryTypes[i].regex);
                if (queryTypes[i].single) {
                    return regexResult[0];
                } else {
                    return regexResult;
                }
            }
        }
    }







}])