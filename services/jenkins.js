var api = require('zenircbot-api');
var bot_config = api.load_config('../bot.json');
var zen = new api.ZenIRCBot(bot_config.redis.host,
                            bot_config.redis.port,
                            bot_config.redis.db);
var sub = zen.get_redis_client();
var color = require('./lib/colors');
var jenkins_config = api.load_config('./jenkins.json');


zen.register_commands("jenkins.js", []);
sub.subscribe('web_in');
sub.on('message', function(channel, message){

	// This handler works with the current (broken) implementation of Jenkins notification JSON

	// https://wiki.jenkins-ci.org/display/JENKINS/Notification+Plugin
	// https://github.com/jenkinsci/notification-plugin
	// TODO: clone and patch Jenkins 'Notifiation Plugin' to fix their JSON

	// extract the substring body as a string, prior to JSON.parse
	// ugly hack for Jenkins improper JSON
	var subsbody = message.substring(25, message.length - 5);

	var message = JSON.parse(message);

    if (message.app != 'jenkins') {
        return null;
    }

	// parse the substring body to fetch the actual Jenkins notification object
	var body = JSON.parse(JSON.parse(subsbody));

	if (body.build.phase == 'COMPLETED') {
		return null;
	}

	var msg = '';
	msg = body.name + ': ' + color.blue + body.build.full_url + color.reset + ' -- Build ';

	if (body.build.status == 'FAILURE') {
		msg = msg + color.red + body.build.status + color.cyan + body.build.phase + color.reset;
	} else if (body.build.status == 'SUCCESS') {
			msg = msg + color.green + body.build.status + ' ' + color.cyan + body.build.phase + color.reset;
	} else {
			msg = msg + color.cyan + body.build.phase + color.reset;
	}

	zen.send_privmsg(jenkins_config.channels, msg);

});
