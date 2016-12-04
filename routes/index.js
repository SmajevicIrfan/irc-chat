var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.username)
    isSet = true;
  else
    isSet = false;

  req.session.smrdo = "Ja sam smrdo";

  res.render('index', { title: 'Public Chat Room', usernameSet: isSet });
});

module.exports = router;
