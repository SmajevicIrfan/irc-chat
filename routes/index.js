var express = require('express');
var router = express.Router();

var Channel = require('../config/channel-client');

/* GET home page. */
router.get('/', function(req, res, next) {
  Channel.find({}, 'name publicID', function(err, rooms) {
    if (err) {
      console.error(err);
      next(err);
    }

    res.render('index', { title: 'IRC Chat (I♥UMA)', chat: rooms });
  });
});

router.get('/chat/new', function(req, res, next) {
  res.render('newChannel', { title: 'Create new chat room (I♥UMA)', message: '' });
});

router.post('/chat/new', function(req, res, next) {
  var name = req.body.name;
  name = name.replace(/\s/g, ' ');

  var adminPassword = req.body.adminPassword;
  var isLogged = req.body.isLogged;
  var isPrivate = req.body.isPrivate
  var password = req.body.password;

  Channel.findOne({ name: name }, function(err, chatRoom) {
    if (err) {
      console.error(err);
      next(err);
    }

    if (chatRoom) {
      res.render('newChannel', { title: 'Create new chat room (I♥UMA)', message: 'Chat room with the same name already exists' });
      next();

      return;
    }
    else {
      var newChannel = new Channel();

      newChannel.name = name.toLowerCase();
      newChannel.publicID = newChannel.name.replace(/\s/g, '-');

      if (isLogged)
        newChannel.isLogged = isLogged;

      if (isPrivate) {
        newChannel.isPrivate = isPrivate;

        if (/\S/g.test(password))
          if (password.length >= 4 && password.length <= 32)
            newChannel.generateHash('regular', password);
          else {
            res.render('newChannel', { title: 'Create new chat room (I♥UMA)', message: 'Passwords have to be between 4 and 32 characters long' });
            next();

            return;
          }
        else {
          res.render('newChannel', { title: 'Create new chat room (I♥UMA)', message: 'Please enter password for regular users' });
          next();

          return;
        }
      }

      if (/\S/g.test(adminPassword))
        if (adminPassword.length >= 4 && adminPassword.length <= 32)
          newChannel.generateHash('admin', adminPassword);
        else {
          res.render('newChannel', { title: 'Create new chat room (I♥UMA)', message: 'Passwords have to be between 4 and 32 characters long' });
          next();

          return;
        }
      else {
        res.render('newChannel', { title: 'Create new chat room (I♥UMA)', message: 'Please enter password for admins' });
        next();

        return;
      }

      newChannel.save(function(err) {
        if (err) {
          res.render('newChannel', { title: 'Create new chat room (I♥UMA)', message: 'An Error Occured' });
          next();

          return;
        }
        else
          res.redirect('/chat/' + newChannel.publicID);
        console.log('done');
      });
    }
  });
});

module.exports = router;
