try {
    var rply = {
        default: 'on',
        type: 'text',
        text: '',
        save: ''
    };
    const records = require('../modules/records.js');
    records.get('trpgVoteSystem', (msgs) => {
        rply.trpgVoteSystemfunction = msgs
    })

    gameName = function () {
        return '(公測中)經驗值功能 .Vote (show config VoteUpWord RankWord)'
    }
    gameType = function () {
        return 'trpgVoteSystem:hktrpg'
    }
    prefixs = function () {
        return [/(^[.]Vote$)/ig, ]
    }
    getHelpMessage = function () {
        return "【投票功能】" + "\
        \n 這是一個簡單投票功能，有記名或不記名模式\
        \n 記名即是在群中投票，不記名即是私下對BOT對話\
        \n 可以設定指定人數投票後，公佈結果 \
        \n 或指定時間公佈結果 另外發起者可以主動結束，公佈結果。\
        \n 可以允許多選。\
        \n \
        \n \
        \n \
        \n\
        \n 輸入.Vote VoteUpWord (內容) 修改在這群組升級時彈出的升級語\
        \n 輸入.Vote RankWord (內容) 修改在這群組查詢等級時的回應\
        \n 輸入.Vote RankWord/VoteUpWord del 即使用預設字句\
        \n 輸入.Vote RankWord/VoteUpWord show 即顯示現在設定\
        \n 輸入.Vote show 可以查詢你現在的等級\
        \n 修改內容可使用不同代碼\
        \n {user.name} 名字 {user.Vote} 等級 \
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
                // .Vote(0) VoteUpWord(1) TOPIC(2) CONTACT(3)
            case /(^[.]Vote$)/i.test(mainMsg[0]) && /^VoteUpWord$/i.test(mainMsg[1]):
                //console.log('mainMsg: ', mainMsg)
                //增加資料庫
                //檢查有沒有重覆
                let checkifsamename = 0
                if (groupid && userrole >= 2 && mainMsg[2] && inputStr.toString().match(/[\s\S]{1,1900}/g).length <= 1 && !mainMsg[2].match(/^show$/)) {
                    if (rply.trpgVoteSystemfunction)
                        for (var i = 0; i < rply.trpgVoteSystemfunction.length; i++) {
                            if (rply.trpgVoteSystemfunction[i].groupid == groupid) {
                                // console.log('checked1')
                                if (rply.trpgVoteSystemfunction[i].VoteUpWord) {
                                    //   console.log('checked')
                                    checkifsamename = 1
                                }
                            }
                        }
                    let temp = {
                        groupid: groupid,
                        VoteUpWord: inputStr.replace(mainMsg[0], "").replace(mainMsg[1], "").replace("  ", "")
                        //在這群組升級時的升級語
                    }
                    if (mainMsg[2].match(/^del$/ig)) {
                        checkifsamename = 0
                    }
                    if (checkifsamename == 0) {
                        rply.text = '新增成功: ' + '\n' + inputStr.replace(mainMsg[0], '').replace(mainMsg[1], '').replace(/^\s+/, '').replace(/^\s+/, '')
                        if (mainMsg[2].match(/^del$/ig)) {
                            temp.VoteUpWord = ""
                            rply.text = "刪除成功."
                        }
                        records.settrpgVoteSystemfunctionVoteUpWord('trpgVoteSystem', temp, () => {
                            records.get('trpgVoteSystem', (msgs) => {
                                rply.trpgVoteSystemfunction = msgs
                                //  console.log(rply.trpgVoteSystemfunction)
                                // console.log(rply);
                            })

                        })

                    } else rply.text = '修改失敗. 已有升級語, 先使用.Vote VoteUpWord del 刪除舊升級語'
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
                        if (rply.trpgVoteSystemfunction)
                            for (var i = 0; i < rply.trpgVoteSystemfunction.length; i++) {
                                if (rply.trpgVoteSystemfunction[i].groupid == groupid && rply.trpgVoteSystemfunction[i].VoteUpWord) {
                                    rply.text = '現在升級語:'
                                    temp = 1
                                    rply.text += ("\n") + rply.trpgVoteSystemfunction[i].VoteUpWord
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
            case /(^[.]Vote$)/i.test(mainMsg[0]) && /^RankWord$/i.test(mainMsg[1]):
                //console.log('mainMsg: ', mainMsg)
                //增加資料庫
                //檢查有沒有重覆
                let checkifsamenameRankWord = 0
                if (groupid && userrole >= 2 && mainMsg[2] && inputStr.toString().match(/[\s\S]{1,1900}/g).length <= 1 && !mainMsg[2].match(/^show$/)) {
                    if (rply.trpgVoteSystemfunction)
                        for (var i = 0; i < rply.trpgVoteSystemfunction.length; i++) {
                            if (rply.trpgVoteSystemfunction[i].groupid == groupid) {
                                // console.log('checked1')
                                if (rply.trpgVoteSystemfunction[i].RankWord) {
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
                        records.settrpgVoteSystemfunctionRankWord('trpgVoteSystem', temp, () => {
                            records.get('trpgVoteSystem', (msgs) => {
                                rply.trpgVoteSystemfunction = msgs
                                //  console.log(rply.trpgVoteSystemfunction)
                                // console.log(rply);
                            })

                        })

                    } else rply.text = '修改失敗. 已有查詢語, 先使用.Vote RankWord del 刪除舊查詢語'
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
                        if (rply.trpgVoteSystemfunction)
                            for (var i = 0; i < rply.trpgVoteSystemfunction.length; i++) {
                                if (rply.trpgVoteSystemfunction[i].groupid == groupid && rply.trpgVoteSystemfunction[i].RankWord) {
                                    rply.text = '現在查詢語:'
                                    temp = 1
                                    rply.text += ("\n") + rply.trpgVoteSystemfunction[i].RankWord
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
            case /(^[.]Vote$)/i.test(mainMsg[0]) && /^config$/i.test(mainMsg[1]):
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
                    records.settrpgVoteSystemfunctionConfig('trpgVoteSystem', temp, () => {
                        records.get('trpgVoteSystem', (msgs) => {
                            rply.trpgVoteSystemfunction = msgs
                            //  console.log(rply.trpgVoteSystemfunction)
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
                        if (rply.trpgVoteSystemfunction)
                            for (var i = 0; i < rply.trpgVoteSystemfunction.length; i++) {
                                if (rply.trpgVoteSystemfunction[i].groupid == groupid && rply.trpgVoteSystemfunction[i].Switch) {
                                    rply.text = '現在設定:\n開關: '
                                    temp = 1
                                    if (rply.trpgVoteSystemfunction[i].Switch == 1) rply.text += '啓動\n通知: '
                                    if (rply.trpgVoteSystemfunction[i].Switch == 0) rply.text += '關閉\n通知: '
                                    if (rply.trpgVoteSystemfunction[i].Hidden == 1) rply.text += '啓動'
                                    if (rply.trpgVoteSystemfunction[i].Hidden == 0) rply.text += '關閉'

                                    //'\n開關: ' + rply.trpgVoteSystemfunction[i].Switch.replace(1, '啓動').replace(0, '關閉')+ '\n通知: ' + rply.trpgVoteSystemfunction[i].Hidden.replace(1, '啓動').replace(0, '關閉')
                                }
                            }
                        if (temp == 0) rply.text = '現在設定: \n開關: 關閉\n通知: 關閉'
                    } else {
                        rply.text = '不在群組. '
                    }
                }
                return rply;


            case /(^[.]Vote$)/i.test(mainMsg[0]) && /^show$/i.test(mainMsg[1]):
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
                //{user.name} 名字 {user.Vote} 等級 \
                // { user.exp } 經驗值 { user.Ranking } 現在排名 \
                // { user.RankingPer} 現在排名百分比 \
                // { server.member_count } 現在頻道中總人數 \

                //console.log(rply.trpgVoteSystemfunction)
                if (groupid) {
                    let temp = 0;
                    let tempHaveUser = 0;
                    //6.    ->沒有 使用預設排名語
                    //{user.name} 名字 {user.Vote} 等級 \
                    // {user.exp} 經驗值 {user.Ranking} 現在排名 \
                    // {user.RankingPer} 現在排名百分比 \
                    // {server.member_count} 現在頻道中總人數 \
                    let rankWord = "@{user.name}，你的克蘇魯神話知識現在是 {user.Vote}點！現在排名第{user.Ranking}名！"

                    if (rply.trpgVoteSystemfunction)
                        for (var i = 0; i < rply.trpgVoteSystemfunction.length; i++) {
                            if (rply.trpgVoteSystemfunction[i].groupid == groupid) {
                                //rply.text += '資料庫列表:'
                                //1.    讀取 群組有沒有開啓功能
                                if (rply.trpgVoteSystemfunction[i].Switch == 1) {
                                    temp = 1;
                                    //5.    讀取群組的排名語
                                    if (rply.trpgVoteSystemfunction[i].RankWord) {
                                        rankWord = rply.trpgVoteSystemfunction[i].RankWord
                                    }

                                    //3.    ->有   檢查有沒有個人資料
                                    for (var a = 0; a < rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction.length; a++) {
                                        if (rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction[a].userid == userid) {
                                            tempHaveUser = 1;
                                            let username = displayname || "無名"
                                            if (botname == "Discord" && userid) {
                                                username = userid
                                            }
                                            let userVote = rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction[a].Vote;
                                            let userexp = rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction[a].EXP;
                                            //console.log('rply.trpgVoteSystemfunction[i]',

                                            let userRanking = ranking(userid, rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction);
                                            let userRankingPer = Math.ceil(userRanking / rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction.length * 10000) / 100 + '%';
                                            let usermember_count = rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction.length;
                                            //{user.name} 名字 {user.Vote} 等級 \
                                            // { user.exp } 經驗值 { user.Ranking } 現在排名 \
                                            // { user.RankingPer} 現在排名百分比 \
                                            // { server.member_count } 現在頻道中總人數 \
                                            if ((5 / 6 * (rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction[a].Vote + 1) * (2 * (rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction[a].Vote + 1) * (rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction[a].Vote + 1) + 27 * (rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction[a].Vote + 1) + 91)) <= rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction[a].EXP) {
                                                //現EXP >於需求LV
                                                //LVUP
                                                let TMEPuserVote = Number(userVote) + 1
                                                rply.text = rankWord.replace(/{user.name}/ig, username).replace(/{user.Vote}/ig, TMEPuserVote).replace(/{user.exp}/ig, userexp).replace(/{user.Ranking}/ig, userRanking).replace(/{user.RankingPer}/ig, userRankingPer).replace(/{server.member_count}/ig, usermember_count)
                                            } else {
                                                rply.text = rankWord.replace(/{user.name}/ig, username).replace(/{user.Vote}/ig, userVote).replace(/{user.exp}/ig, userexp).replace(/{user.Ranking}/ig, userRanking).replace(/{user.RankingPer}/ig, userRankingPer).replace(/{server.member_count}/ig, usermember_count)
                                            }

                                        }

                                    } //2.    ->沒有 告知開啓
                                    if (tempHaveUser == 0) {
                                        //4.    沒有則新增一個, 隨機1-10 給經驗值.
                                        let username = displayname || "無名"
                                        let userVote = 0;
                                        let userexp = Math.floor(Math.random() * 10) + 1
                                        //console.log('rply.trpgVoteSystemfunction[i]',

                                        let userRanking = ranking(userid, rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction);
                                        let userRankingPer = Math.ceil(userRanking / rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction.length * 10000) / 100 + '%';
                                        let usermember_count = rply.trpgVoteSystemfunction[i].trpgVoteSystemfunction.length;
                                        //{user.name} 名字 {user.Vote} 等級 \
                                        // { user.exp } 經驗值 { user.Ranking } 現在排名 \
                                        // { user.RankingPer} 現在排名百分比 \
                                        // { server.member_count } 現在頻道中總人數 \
                                        rply.text = rankWord.replace(/{user.name}/ig, username).replace(/{user.Vote}/ig, userVote).replace(/{user.exp}/ig, userexp).replace(/{user.Ranking}/ig, userRanking).replace(/{user.RankingPer}/ig, userRankingPer).replace(/{server.member_count}/ig, usermember_count)

                                    }
                                }

                            }
                        }

                    if (temp == 0) rply.text = '此群組並有沒有開啓Vote功能. \n.Vote config 11 代表啓動功能 \
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
var trpgVoteSystemfunction = [{
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

    for (var key in trpgVoteSystemfunction) {
        array.push(trpgVoteSystemfunction[key]);

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