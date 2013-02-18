var api = require('zenircbot-api');
var bot_config = api.load_config('../bot.json');
var zen = new api.ZenIRCBot(bot_config.redis.host,
                            bot_config.redis.port,
                            bot_config.redis.db);
var sub = zen.get_redis_client();
var color = require('./lib/colors');
var gitlab_config = api.load_config('./gitlab.json');


zen.register_commands("gitlab.js", []);

sub.subscribe('web_in');
sub.on('message', function(channel, message){
    message = JSON.parse(message);

    if (message.app != 'gitlab') {
        return null;
    }
    var branch = message.body.ref.substr(11);
    var repo = message.body.repository.name;
    var name_str = '';

    console.log(message.body.total_commits_count);
    var msg = '';
    if (message.body.total_commits_count > 1) {
	msg = color.pink + message.body.total_commits_count + color.green + ' Committed Changes' + color.reset;
    } else {
	msg = color.pink + message.body.total_commits_count + color.green + ' Committed Change' + color.reset;
    }
    zen.send_privmsg(gitlab_config.channels, msg);

    for (var i=0; i< message.body.total_commits_count; i++) {
        var commit = message.body.commits[i];
        if (commit.author.username) {
            name_str = ' - ' + commit.author.username + ' (' + commit.author.name + ')';
        } else if (commit.author.name) {
            name_str = ' - ' + commit.author.name;
        } else {
            name_str = '';
        }
        var cmsg = repo + ': ' + commit.id.substr(0,7) + ' *' + color.green + branch + color.reset + '* ' + color.navy + commit.message + color.reset + name_str;
        zen.send_privmsg(gitlab_config.channels, cmsg);
//        console.log(branch + ': ' + commit.author.username);
    }
});
