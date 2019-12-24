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

https://stackoverflow.com/questions/45664114/getting-temporary-file-path-using-javascript

https://stackoverflow.com/questions/49764610/send-buffer-for-file-in-discord-js

https://ourcodeworld.com/articles/read/297/how-to-create-a-file-using-the-filesystem-fs-module-in-node-js

https://www.npmjs.com/package/fs-temp

https://github.com/bruce/node-temp

telegram.sendDocument(chatId, doc, [extra])
sendPhoto
sendAnimation
https://telegraf.js.org/#/?id=sendanimation

var chat_id = 3934859345; // replace with yours
var enc_data = "This is my default text";
var token = "45390534dfsdlkjfshldfjsh28453945sdnfnsldfj427956345"; // from botfather

var blob = new Blob([enc_data], { type: 'plain/text' });

var formData = new FormData();
formData.append('chat_id', chat_id);
formData.append('document', blob, 'document.txt');

var request = new XMLHttpRequest();
request.open('POST', `https://api.telegram.org/bot${token}/sendDocument`);
request.send(formData);
*/

module.exports = {
	rollDiceCommand: rollDiceCommand,
	initialize: initialize,
	getHelpMessage: getHelpMessage,
	prefixs: prefixs,
	gameType: gameType,
	gameName: gameName
};