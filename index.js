var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

app.get('/form', function (req, res) {
    res.send('<style type="text/css">input.larger { width: 40px; height: 40px }</style><form name="form "action="/form" method="post" style="font-size: 40px">預約日期：<input type="date" name="date" style="font-size: 40px" /><br>預約時段：<input type="time" name="time" style="font-size: 40px" /><br>預約人數：<input type="number" name="number" min="1" max="10" style="font-size: 40px" /><br>使用臉書姓名預約？<input type="checkbox" name="who" value="yes" class="larger" />沒錯！<br><input type="submit" value="Submit" style="font-size: 40px" /></form>')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'Aha_Moment_Labs_simple') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})


// API End Point - added by Stefan

app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        if (event.message && event.message.text) {
            text = event.message.text
            if (text === 'hi') {
                sendGenericMessage(sender)
                continue
            }
            sendTextMessage(sender, "pirate: " + text.substring(0, 200))
        }
        if (event.postback) {
            text = JSON.stringify(event.postback)
            sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
            continue
        }
    }
    res.sendStatus(200)
})

var token = "EAAFqRvZCrYtUBAKor2uuChMRsagVq51ru88zqHgxhaRFCgjmRCLAZC6xHqgK66Djj7dnsuaAvZBrAfwlPDZBLFDBWQrDHqg2XJjU06yg2qikhIRmxm0Bz5GVZANRQjclnFpRgJArB9H2dcsDuidUn55sErt1rqqc12XZAzEYZCFJAZDZD"

// function to echo back messages - added by Stefan

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}


// Send an test message back as two cards.

function sendGenericMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "懶人預約餐廳，一指搞定！",
                    "subtitle": "快沒位子囉！！",
                    "image_url": "https://tctechcrunch2011.files.wordpress.com/2016/04/facebook-chatbots.png?w=738",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://desolate-refuge-77663.herokuapp.com/form",
                        "title": "立即預約餐廳",
                        webview_height_ratio: 'tall'
                    }]
                }]
            } 
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

