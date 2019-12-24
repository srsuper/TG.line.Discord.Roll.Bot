var rply = {
	default: 'on',
	type: 'text',
	text: ''
}; //type是必需的,但可以更改
//heroku labs:enable runtime-dyno-metadata -a <app name>


gameName = function () {
	return '(公測中)Log 系統'
}

gameType = function () {
	return 'LOG:hktrpg'
}
prefixs = function () {
	return [/^[.]LOG$/i, ]

}

getHelpMessage = function () {
	return "【Log】.wiki .image .tran .tran.(目標語言)\
		\n 1) Wiki功能: .wiki (條目)  \
		"
}
initialize = function () {
	return rply;
}

rollDiceCommand = async function (inputStr, mainMsg, groupid, userid, userrole, botname, displayname, channelid) {
	rply.text = '';
	//let result = {};
	switch (true) {
		case /^help$/i.test(mainMsg[1]) || !mainMsg[1]:
			rply.text = this.getHelpMessage();
			return rply;
		case /\S+/.test(mainMsg[1]) && /[.]log/.test(mainMsg[0]):
			rply.type = "image"
			rply.text = "A"
			return rply;
		default:
			break;
	}
}
/*
telegram.sendDocument(chatId, doc, [extra])



var file = new Blob([enc_data], {type: 'text/plain'});
var formData = new FormData();
formData.append('chat_id', '<id>');
formData.append('document', file);

var request = new XMLHttpRequest();
request.open('POST', 'https://api.telegram.org/bot<token>/sendDocument');
request.send(FormData);
*/

module.exports = {
	rollDiceCommand: rollDiceCommand,
	initialize: initialize,
	getHelpMessage: getHelpMessage,
	prefixs: prefixs,
	gameType: gameType,
	gameName: gameName
};