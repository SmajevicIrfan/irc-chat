// Event Listener
var observe;
if (window.attachEvent) {
    observe = function (element, event, handler) {
        element.attachEvent('on'+event, handler);
    };
}
else {
    observe = function (element, event, handler) {
        element.addEventListener(event, handler, false);
    };
}

// Sort function
function compare(a, b) {
  if (a.toLowerCase() < b.toLowerCase())
    return -1;

  return 1;
}

(function() {
  // Connecting to socket
  var socket = io();

  // Check if on phone
  var isMobile = false; //initiate as false

  if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
      || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

  var bodyHeight = document.body.offsetHeight - 70;
  var messages = document.getElementById('messages');

  // Focus on prompt
  document.getElementById('username-input').focus();
  // Set fixed prompt length
  document.getElementById('username-prompt').style.width = document.getElementById('username-prompt').offsetWidth+'px';

  // Submit username
  observe(document.querySelector('#username-prompt form'), 'submit', function(e) {
    e.preventDefault();

    var validation = /^\w[a-zA-Z0-9.\-_]{3,15}$/g;
    var username = document.getElementById('username-input').value;

    if (validation.test(username) && document.getElementById('user_' + username.toLowerCase()) == null) {
      socket.emit('joined', username);
      document.getElementById('overlay').style.display = "none";
      document.getElementById('message-input').focus();

      document.getElementById('username-display').innerHTML = username;
      document.getElementById('username-display').style.visibility = "visible";
    }
    else {
      document.querySelector('#username-prompt .alert').style.display = "initial";
    }

    return false;
  });

  // Resize textarea
  var messageBox = document.querySelector('#message-input');
  function resize () {
      var msgBoxStyle = (window.getComputedStyle) ?
            window.getComputedStyle(messageBox) : messageBox.currentStyle;

      if (Math.floor(messageBox.scrollHeight / parseInt(msgBoxStyle.lineHeight)) <= 3) {
        messageBox.style.height = 'auto';
        messageBox.style.height = messageBox.scrollHeight+'px';

        messageBox.style.overflowY = 'hidden';
      }
      else {
        messageBox.style.height = (parseInt(msgBoxStyle.lineHeight) * 3)+'px';

        messageBox.style.overflowY = 'scroll';
      }
  }
  /* 0-timeout to get the already changed text */
  function delayedResize () {
      window.setTimeout(resize, 0);
  }

  observe(messageBox, 'change',  resize);
  observe(messageBox, 'cut',     delayedResize);
  observe(messageBox, 'paste',   delayedResize);
  observe(messageBox, 'drop',    delayedResize);
  observe(messageBox, 'keydown', delayedResize);

  // Submit message function
  function submitMsg() {
    var msg = document.getElementById('message-input').value;
    if (/\S/.test(msg)) {
      socket.emit('message-sent', msg);
      document.getElementById('message-input').value = '';

      if (!isMobile)
        document.getElementById('message-input').focus();

      messageBox.style.minHeight = null;
    }
  }

  // Submit message on enter pressed
  observe(messageBox, 'keypress', function(e) {
    if ((e.keyCode || e.which) == 13 && !e.shiftKey) { // 13 -> enter
      submitMsg();
      e.preventDefault();
    }
  });

  // Msg submission event listener
  observe(document.querySelector('#message-form form'), 'submit', function(e) {
    submitMsg();

    e.preventDefault();
    return false;
  });

  function addMsg(msg) {
    var newMsg = document.createElement("LI");
    var msgText = document.createTextNode(msg);

    newMsg.appendChild(msgText);
    messages.querySelector('ul').appendChild(newMsg);
  }

  function scrollToBottom() {
    var curScrollPos = messages.scrollTop + bodyHeight;
    if (curScrollPos >= messages.scrollHeight - 100) {
      messages.scrollTop = messages.scrollHeight;
    }
  }

  // Receiving info from server
  socket.on('message-received', function(user, msg) {
    addMsg('[' + user + ']: ' + msg);
    scrollToBottom();
  });

  socket.on('update', function(update) {
    addMsg(update);
    scrollToBottom();
  });

  socket.on('new-person', function(users) {
    if (typeof users === 'string') {
      var inserted = false;
      var list = document.getElementById('online-list').childNodes;

      [].forEach.call(list, function(user_element) {
        if (user_element.innerHTML.toLowerCase() > users.toLowerCase() && !inserted) {
          var newUser = document.createElement("LI");
          newUser.id = "user_" + users.toLowerCase();

          newUser.appendChild(document.createTextNode(users));
          document.getElementById('online-list').insertBefore(newUser, user_element);

          inserted = true;
        }
      });

      if (!inserted) {
        var newUser = document.createElement("LI");
        newUser.id = "user_" + users.toLowerCase();

        newUser.appendChild(document.createTextNode(users));
        document.getElementById('online-list').appendChild(newUser);
      }
    }
    else {
      var people = [];
      for (var socketId in users)
        if (users.hasOwnProperty(socketId))
          people.push(users[socketId]);

      people.sort(compare);
      console.log(people);

      people.forEach(function(user) {
        var newUser = document.createElement("LI");
        newUser.id = "user_" + user.toLowerCase();

        newUser.appendChild(document.createTextNode(user));
        document.getElementById('online-list').appendChild(newUser);
      });
    }
  });
})();
