var api = require('zenircbot-api');
var bot_config = api.load_config('../bot.json');
var zen = new api.ZenIRCBot(bot_config.redis.host,
                            bot_config.redis.port,
                            bot_config.redis.db);
var redis = zen.get_redis_client();
var web_config = api.load_config('./web-proxy.json');
var express = require('express');
var app = express();


zen.register_commands('web-proxy.js', []);

app.use(express.bodyParser());

app.post('/', function(req, res) {
  console.log(req.body.payload);
  redis.publish('out', req.body.payload);
  res.send('ok', 200);
});

app.post('/:channel', function(req, res) {
  console.log(req.params.channel + ": " + req.body.message);
  zen.send_privmsg(req.params.channel, req.body.message);
  res.send('ok', 200);
});

app.listen(web_config.port);

console.log("Listening on "+web_config.port);
