try {
    var rply = {
        default: 'on',
        type: 'text',
        text: '',
        save: ''
    };
    const records = require('../modules/records.js');
    records.get('trpgPollSystem', (msgs) => {
        rply.trpgPollSystemfunction = msgs
    })

    gameName = function () {
        return '(公測中)經驗值功能 .Poll (show config PollUpWord RankWord)'
    }
    gameType = function () {
        return 'trpgPollSystem:hktrpg'
    }
    prefixs = function () {
        return [/(^[.]Poll$)/ig, ]
    }
    getHelpMessage = function () {
        return "【投票功能】" + "\
        \n 這是一個簡單投票功能，有記名或不記名模式\
        \n 記名即是在群中投票，不記名即是私下對BOT對話\
        \n 可以設定指定人數投票後?，公佈結果 \
        \n 或指定時間公佈結果 另外發起者可以主動結束，公佈結果。\
        \n 可以允許多選。\
        \n 可以給190字的意見\
        \n 15個選項\
        \n \
        \n 輸入.Poll Vote  Doodle(N) Board (190字)  修改在這群組升級時彈出的升級語\
        \n 輸入.Poll Hide (內容) 修改在這群組查詢等級時的回應\
        \n 輸入.Poll RankWord/PollUpWord del 即使用預設字句\
        \n 輸入.Poll RankWord/PollUpWord show 即顯示現在設定\
        \n 輸入.Poll show 可以查詢你現在的等級\
        \n 修改內容可使用不同代碼\
        \n {user.name} 名字 {user.Poll} 等級 \
        \n {user.exp} 經驗值 {user.Ranking} 現在排名 \
        \n {user.RankingPer} 現在排名百分比 \
        \n {server.member_count} 現在頻道中總人數 \
        \n "
    }
    initialize = function () {
        return rply;
    }

    rollDiceCommand = function (inputStr, mainMsg, groupid, userid, userrole, botname, displayname, channelid) {

        rply.text = '';
        switch (true) {
            case /^help$/i.test(mainMsg[1]) || !mainMsg[1]:
                rply.text = this.getHelpMessage();
                if (botname == "Line")
                    rply.text += "\n因為Line的機制, 如擲骰時並無顯示用家名字, 請到下列網址,和機器人任意說一句話,成為好友. \n https://line.me/R/ti/p/svMLqy9Mik"
                return rply;
                // .Poll(0) PollUpWord(1) TOPIC(2) CONTACT(3)
            case /(^[.]Poll$)/i.test(mainMsg[0]) && /^PollUpWord$/i.test(mainMsg[1]):
                //console.log('mainMsg: ', mainMsg)
                //增加資料庫
                //檢查有沒有重覆
                let checkifsamename = 0
                if (groupid && userrole >= 2 && mainMsg[2] && inputStr.toString().match(/[\s\S]{1,1900}/g).length <= 1 && !mainMsg[2].match(/^show$/)) {
                    if (rply.trpgPollSystemfunction)
                        for (var i = 0; i < rply.trpgPollSystemfunction.length; i++) {
                            if (rply.trpgPollSystemfunction[i].groupid == groupid) {
                                // console.log('checked1')
                                if (rply.trpgPollSystemfunction[i].PollUpWord) {
                                    //   console.log('checked')
                                    checkifsamename = 1
                                }
                            }
                        }
                    let temp = {
                        groupid: groupid,
                        PollUpWord: inputStr.replace(mainMsg[0], "").replace(mainMsg[1], "").replace("  ", "")
                        //在這群組升級時的升級語
                    }
                    if (mainMsg[2].match(/^del$/ig)) {
                        checkifsamename = 0
                    }
                    if (checkifsamename == 0) {
                        rply.text = '新增成功: ' + '\n' + inputStr.replace(mainMsg[0], '').replace(mainMsg[1], '').replace(/^\s+/, '').replace(/^\s+/, '')
                        if (mainMsg[2].match(/^del$/ig)) {
                            temp.PollUpWord = ""
                            rply.text = "刪除成功."
                        }
                        records.settrpgPollSystemfunctionPollUpWord('trpgPollSystem', temp, () => {
                            records.get('trpgPollSystem', (msgs) => {
                                rply.trpgPollSystemfunction = msgs
                                //  console.log(rply.trpgPollSystemfunction)
                                // console.log(rply);
                            })

                        })

                    } else rply.text = '修改失敗. 已有升級語, 先使用.Poll PollUpWord del 刪除舊升級語'
                } else {
                    rply.text = '新增失敗.'
                    if (!mainMsg[2])
                        rply.text += ' 沒有內容.'
                    if (!groupid)
                        rply.text += ' 不在群組.'
                    if (groupid && userrole < 2)
                        rply.text += ' 只有GM以上才可新增.'
                    if (inputStr.toString().match(/[\s\S]{1,1900}/g).length > 1)
                        rply.text += ' 內容太長,只可以1900字元以內.'
                }
                if (mainMsg[2] && mainMsg[2].match(/^show$/)) {
                    if (groupid) {
                        let temp = 0;
                        if (rply.trpgPollSystemfunction)
                            for (var i = 0; i < rply.trpgPollSystemfunction.length; i++) {
                                if (rply.trpgPollSystemfunction[i].groupid == groupid && rply.trpgPollSystemfunction[i].PollUpWord) {
                                    rply.text = '現在升級語:'
                                    temp = 1
                                    rply.text += ("\n") + rply.trpgPollSystemfunction[i].PollUpWord
                                }
                            }
                        if (temp == 0) rply.text = '正在使用預設升級語. '
                    } else {
                        rply.text = '不在群組. '
                    }
                }
                return rply;
                //
                //
                //查詢語
                //
                //
            case /(^[.]Poll$)/i.test(mainMsg[0]) && /^RankWord$/i.test(mainMsg[1]):
                //console.log('mainMsg: ', mainMsg)
                //增加資料庫
                //檢查有沒有重覆
                let checkifsamenameRankWord = 0
                if (groupid && userrole >= 2 && mainMsg[2] && inputStr.toString().match(/[\s\S]{1,1900}/g).length <= 1 && !mainMsg[2].match(/^show$/)) {
                    if (rply.trpgPollSystemfunction)
                        for (var i = 0; i < rply.trpgPollSystemfunction.length; i++) {
                            if (rply.trpgPollSystemfunction[i].groupid == groupid) {
                                // console.log('checked1')
                                if (rply.trpgPollSystemfunction[i].RankWord) {
                                    //   console.log('checked')
                                    checkifsamenameRankWord = 1
                                }
                            }
                        }
                    let temp = {
                        groupid: groupid,
                        RankWord: inputStr.replace(mainMsg[0], "").replace(mainMsg[1], "").replace("  ", "")
                        //在這群組查詢等級時的回應
                    }
                    if (mainMsg[2].match(/^del$/ig)) {
                        checkifsamenameRankWord = 0
                    }
                    if (checkifsamenameRankWord == 0) {
                        rply.text = '新增成功: ' + '\n' + inputStr.replace(mainMsg[0], '').replace(mainMsg[1], '').replace(/^\s+/, '').replace(/^\s+/, '')
                        if (mainMsg[2].match(/^del$/ig)) {
                            temp.RankWord = ""
                            rply.text = "刪除成功."
                        }
                        records.settrpgPollSystemfunctionRankWord('trpgPollSystem', temp, () => {
                            records.get('trpgPollSystem', (msgs) => {
                                rply.trpgPollSystemfunction = msgs
                                //  console.log(rply.trpgPollSystemfunction)
                                // console.log(rply);
                            })

                        })

                    } else rply.text = '修改失敗. 已有查詢語, 先使用.Poll RankWord del 刪除舊查詢語'
                } else {
                    rply.text = '新增失敗.'
                    if (!mainMsg[2])
                        rply.text += ' 沒有內容.'
                    if (!groupid)
                        rply.text += ' 不在群組.'
                    if (groupid && userrole < 2)
                        rply.text += ' 只有GM以上才可新增.'
                    if (inputStr.toString().match(/[\s\S]{1,1900}/g).length > 1)
                        rply.text += ' 內容太長,只可以1900字元以內.'
                }
                if (mainMsg[2] && mainMsg[2].match(/^show$/)) {
                    if (groupid) {
                        let temp = 0;
                        if (rply.trpgPollSystemfunction)
                            for (var i = 0; i < rply.trpgPollSystemfunction.length; i++) {
                                if (rply.trpgPollSystemfunction[i].groupid == groupid && rply.trpgPollSystemfunction[i].RankWord) {
                                    rply.text = '現在查詢語:'
                                    temp = 1
                                    rply.text += ("\n") + rply.trpgPollSystemfunction[i].RankWord
                                }
                            }
                        if (temp == 0) rply.text = '正在使用預設查詢語. '
                    } else {
                        rply.text = '不在群組. '
                    }
                }
                return rply;

                //
                //
                //設定
                //
                //
            case /(^[.]Poll$)/i.test(mainMsg[0]) && /^config$/i.test(mainMsg[1]):
                //console.log('mainMsg: ', mainMsg)
                //增加資料庫
                //檢查有沒有重覆
                if (groupid && userrole >= 2 && mainMsg[2] && (mainMsg[2] == "00" || mainMsg[2] == "01" || mainMsg[2] == "10" || mainMsg[2] == "11")) {

                    let Switch, Hidden = 0;
                    if (mainMsg[2] == "00") {
                        Switch = 0;
                        Hidden = 0;
                    }
                    if (mainMsg[2] == "01") {
                        Switch = 0;
                        Hidden = 1;
                    }
                    if (mainMsg[2] == "10") {
                        Switch = 1;
                        Hidden = 0;
                    }
                    if (mainMsg[2] == "11") {
                        Switch = 1;
                        Hidden = 1;
                    }

                    let temp = {
                        groupid: groupid,
                        Switch: Switch,
                        Hidden: Hidden
                        //在這群組查詢等級時的回應
                    }
                    rply.text = '修改成功: ' + '\n開關: ';
                    if (Switch == 1) rply.text += '啓動\n通知: '
                    if (Switch == 0) rply.text += '關閉\n通知: '
                    if (Hidden == 1) rply.text += '啓動'
                    if (Hidden == 0) rply.text += '關閉'
                    records.settrpgPollSystemfunctionConfig('trpgPollSystem', temp, () => {
                        records.get('trpgPollSystem', (msgs) => {
                            rply.trpgPollSystemfunction = msgs
                            //  console.log(rply.trpgPollSystemfunction)
                            // console.log(rply);
                        })

                    })

                } else {
                    rply.text = '修改失敗.'
                    if (!mainMsg[2] || !(mainMsg[2] == "00" || mainMsg[2] == "01" || mainMsg[2] == "10" || mainMsg[2] == "11"))
                        rply.text += '\nconfig 11 代表啓動功能 \
                        \n 數字11代表等級升級時會進行通知，10代表不會自動通知，\
                        \n 00的話代表不啓動功能\n'
                    if (!groupid)
                        rply.text += ' 不在群組.'
                    if (groupid && userrole < 2)
                        rply.text += ' 只有GM以上才可新增.'
                }
                if (mainMsg[2] && mainMsg[2].match(/^show$/)) {
                    if (groupid) {
                        let temp = 0;
                        if (rply.trpgPollSystemfunction)
                            for (var i = 0; i < rply.trpgPollSystemfunction.length; i++) {
                                if (rply.trpgPollSystemfunction[i].groupid == groupid && rply.trpgPollSystemfunction[i].Switch) {
                                    rply.text = '現在設定:\n開關: '
                                    temp = 1
                                    if (rply.trpgPollSystemfunction[i].Switch == 1) rply.text += '啓動\n通知: '
                                    if (rply.trpgPollSystemfunction[i].Switch == 0) rply.text += '關閉\n通知: '
                                    if (rply.trpgPollSystemfunction[i].Hidden == 1) rply.text += '啓動'
                                    if (rply.trpgPollSystemfunction[i].Hidden == 0) rply.text += '關閉'

                                    //'\n開關: ' + rply.trpgPollSystemfunction[i].Switch.replace(1, '啓動').replace(0, '關閉')+ '\n通知: ' + rply.trpgPollSystemfunction[i].Hidden.replace(1, '啓動').replace(0, '關閉')
                                }
                            }
                        if (temp == 0) rply.text = '現在設定: \n開關: 關閉\n通知: 關閉'
                    } else {
                        rply.text = '不在群組. '
                    }
                }
                return rply;


            case /(^[.]Poll$)/i.test(mainMsg[0]) && /^show$/i.test(mainMsg[1]):
                //
                //顯示現在排名
                //1.    讀取 群組有沒有開啓功能
                //2.    ->沒有 告知開啓
                //3.    ->有   檢查有沒有個人資料
                //4.    沒有則新增一個, 隨機1-10 給經驗值.
                //5.    讀取群組的排名語
                //6.    ->沒有 使用預設排名語
                //7.    使用排名語, 根據內容進行替換.
                //8.    
                //{user.name} 名字 {user.Poll} 等級 \
                // { user.exp } 經驗值 { user.Ranking } 現在排名 \
                // { user.RankingPer} 現在排名百分比 \
                // { server.member_count } 現在頻道中總人數 \

                //console.log(rply.trpgPollSystemfunction)
                if (groupid) {
                    let temp = 0;
                    let tempHaveUser = 0;
                    //6.    ->沒有 使用預設排名語
                    //{user.name} 名字 {user.Poll} 等級 \
                    // {user.exp} 經驗值 {user.Ranking} 現在排名 \
                    // {user.RankingPer} 現在排名百分比 \
                    // {server.member_count} 現在頻道中總人數 \
                    let rankWord = "@{user.name}，你的克蘇魯神話知識現在是 {user.Poll}點！現在排名第{user.Ranking}名！"

                    if (rply.trpgPollSystemfunction)
                        for (var i = 0; i < rply.trpgPollSystemfunction.length; i++) {
                            if (rply.trpgPollSystemfunction[i].groupid == groupid) {
                                //rply.text += '資料庫列表:'
                                //1.    讀取 群組有沒有開啓功能
                                if (rply.trpgPollSystemfunction[i].Switch == 1) {
                                    temp = 1;
                                    //5.    讀取群組的排名語
                                    if (rply.trpgPollSystemfunction[i].RankWord) {
                                        rankWord = rply.trpgPollSystemfunction[i].RankWord
                                    }

                                    //3.    ->有   檢查有沒有個人資料
                                    for (var a = 0; a < rply.trpgPollSystemfunction[i].trpgPollSystemfunction.length; a++) {
                                        if (rply.trpgPollSystemfunction[i].trpgPollSystemfunction[a].userid == userid) {
                                            tempHaveUser = 1;
                                            let username = displayname || "無名"
                                            if (botname == "Discord" && userid) {
                                                username = userid
                                            }
                                            let userPoll = rply.trpgPollSystemfunction[i].trpgPollSystemfunction[a].Poll;
                                            let userexp = rply.trpgPollSystemfunction[i].trpgPollSystemfunction[a].EXP;
                                            //console.log('rply.trpgPollSystemfunction[i]',

                                            let userRanking = ranking(userid, rply.trpgPollSystemfunction[i].trpgPollSystemfunction);
                                            let userRankingPer = Math.ceil(userRanking / rply.trpgPollSystemfunction[i].trpgPollSystemfunction.length * 10000) / 100 + '%';
                                            let usermember_count = rply.trpgPollSystemfunction[i].trpgPollSystemfunction.length;
                                            //{user.name} 名字 {user.Poll} 等級 \
                                            // { user.exp } 經驗值 { user.Ranking } 現在排名 \
                                            // { user.RankingPer} 現在排名百分比 \
                                            // { server.member_count } 現在頻道中總人數 \
                                            if ((5 / 6 * (rply.trpgPollSystemfunction[i].trpgPollSystemfunction[a].Poll + 1) * (2 * (rply.trpgPollSystemfunction[i].trpgPollSystemfunction[a].Poll + 1) * (rply.trpgPollSystemfunction[i].trpgPollSystemfunction[a].Poll + 1) + 27 * (rply.trpgPollSystemfunction[i].trpgPollSystemfunction[a].Poll + 1) + 91)) <= rply.trpgPollSystemfunction[i].trpgPollSystemfunction[a].EXP) {
                                                //現EXP >於需求LV
                                                //LVUP
                                                let TMEPuserPoll = Number(userPoll) + 1
                                                rply.text = rankWord.replace(/{user.name}/ig, username).replace(/{user.Poll}/ig, TMEPuserPoll).replace(/{user.exp}/ig, userexp).replace(/{user.Ranking}/ig, userRanking).replace(/{user.RankingPer}/ig, userRankingPer).replace(/{server.member_count}/ig, usermember_count)
                                            } else {
                                                rply.text = rankWord.replace(/{user.name}/ig, username).replace(/{user.Poll}/ig, userPoll).replace(/{user.exp}/ig, userexp).replace(/{user.Ranking}/ig, userRanking).replace(/{user.RankingPer}/ig, userRankingPer).replace(/{server.member_count}/ig, usermember_count)
                                            }

                                        }

                                    } //2.    ->沒有 告知開啓
                                    if (tempHaveUser == 0) {
                                        //4.    沒有則新增一個, 隨機1-10 給經驗值.
                                        let username = displayname || "無名"
                                        let userPoll = 0;
                                        let userexp = Math.floor(Math.random() * 10) + 1
                                        //console.log('rply.trpgPollSystemfunction[i]',

                                        let userRanking = ranking(userid, rply.trpgPollSystemfunction[i].trpgPollSystemfunction);
                                        let userRankingPer = Math.ceil(userRanking / rply.trpgPollSystemfunction[i].trpgPollSystemfunction.length * 10000) / 100 + '%';
                                        let usermember_count = rply.trpgPollSystemfunction[i].trpgPollSystemfunction.length;
                                        //{user.name} 名字 {user.Poll} 等級 \
                                        // { user.exp } 經驗值 { user.Ranking } 現在排名 \
                                        // { user.RankingPer} 現在排名百分比 \
                                        // { server.member_count } 現在頻道中總人數 \
                                        rply.text = rankWord.replace(/{user.name}/ig, username).replace(/{user.Poll}/ig, userPoll).replace(/{user.exp}/ig, userexp).replace(/{user.Ranking}/ig, userRanking).replace(/{user.RankingPer}/ig, userRankingPer).replace(/{server.member_count}/ig, usermember_count)

                                    }
                                }

                            }
                        }

                    if (temp == 0) rply.text = '此群組並有沒有開啓Poll功能. \n.Poll config 11 代表啓動功能 \
                    \n 數字11代表等級升級時會進行通知，10代表不會自動通知，\
                    \n 00的話代表不啓動功能\n'
                } else {
                    rply.text = '不在群組. '
                }
                //顯示資料庫
                //rply.text = rply.text.replace(/^([^(,)\1]*?)\s*(,)\s*/mg, '$1: ').replace(/\,/gm, ', ')
                return rply


            default:
                break;

        }

        function ranking(who, data) {
            var array = [];
            let answer = "0"
            for (var key in data) {
                array.push(data[key]);

            }

            array.sort(function (a, b) {
                return b.EXP - a.EXP;
            });

            var rank = 1;
            //console.log('array.length', array.length)
            //console.log('array', array)
            for (var i = 0; i < array.length; i++) {
                if (i > 0 && array[i].EXP < array[i - 1].EXP) {
                    rank++;
                }
                array[i].rank = rank;
            }
            for (var b = 0; b < array.length; b++) {
                if (array[b].userid == who)
                    answer = b + 1;
                //  document.write(b + 1);

            }
            //console.log('answer', answer)
            return answer;
        }
    }


    module.exports = {
        rollDiceCommand: rollDiceCommand,
        initialize: initialize,
        getHelpMessage: getHelpMessage,
        prefixs: prefixs,
        gameType: gameType,
        gameName: gameName
    };
} catch (e) {
    console.log(e)
}

/*
var trpgPollSystemfunction = [{
        nickname: "Bob",
        EXP: 100
    },
    {
        nickname: "Amy",
        EXP: 200
    },
    {
        nickname: "Grant",
        EXP: 1300
    },
    {
        nickname: "Steve",
        EXP: 4200
    },
    {
        nickname: "Joe",
        EXP: 500
    }
];

function ranking(who) {
    var array = [];

    for (var key in trpgPollSystemfunction) {
        array.push(trpgPollSystemfunction[key]);

    }

    array.sort(function (a, b) {
        return b.EXP - a.EXP;
    });

    var rank = 1;
    for (var i = 0; i < array.length; i++) {
        if (i > 0 && array[i].EXP < array[i - 1].EXP) {
            rank++;
        }
        array[i].rank = rank;
    }
    for (var b = 0; b < array.length; b++) {
        if (array[b].nickname == who)
            document.write(b + 1);

    }


}
ranking('Joe');
*/