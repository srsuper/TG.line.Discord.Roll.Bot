try {
    var rply = {
        default: 'on',
        type: 'text',
        text: ''
    };
    const records = require('../modules/records.js');
    records.get('trpgChoose', (msgs) => {
        rply.trpgChoosefunction = msgs
    })
    records.get('trpgChooseAllgroup', (msgs) => {
        rply.trpgChooseAllgroup = msgs
    })
    gameName = function () {
        return '(公測中)選擇圖書功能 .db(p) (add del show 自定關鍵字)'
    }
    gameType = function () {
        return 'trpgChoose:hktrpg'
    }
    prefixs = function () {
        return [/(^[.]db(p|)$)/ig, ]
    }
    getHelpMessage = function () {
        return "【選擇圖書功能】" + "\
        \n 這是根據關鍵字來顯示數據的,\
        \n 例如輸入 .db add 九大陣營 守序善良 (...太長省略) 中立邪惡 混亂邪惡 \
        \n 再輸入.db 九大陣營  守序善良 (...太長省略) 中立邪惡 混亂邪惡\
        \n add 後面第一個是關鍵字, 可以是漢字,數字,英文及emoji\
        \n P.S.如果沒立即生效 用.db show 刷新一下\
    \n 輸入.db add (關鍵字) (內容)即可增加關鍵字\
    \n 輸入.db show 顯示所有關鍵字\
    \n 輸入.db del(編號)或all 即可刪除\
    \n 輸入.db  (關鍵字) 即可顯示 \
    \n 如使用輸入.dbp 會變成全服版,全服可看, 可用add show功能 \
    \n "
    }
    /*
    設計
    A) 選擇圖書式
    可以使用{變數.A1}之類取代故事的某些字眼
    最後會給出頁數, 頁數可以隨機產生?
    可以擲骰?
    第一次通關前，只可以前進，不可後退
    99個變數
    變數: 名字 內容

    B)  問卷式
    根據選項，可以改變變數?
    變數運算
    顯示變數

    */
    initialize = function () {
        return rply;
    }

    rollDiceCommand = function (inputStr, mainMsg, groupid, userid, userrole, botname, displayname, channelid) {
        
        rply.text = '';
        switch (true) {
            case /^help$/i.test(mainMsg[1]) || !mainMsg[1]:
                rply.text = this.getHelpMessage();
                return rply;

                // .DB(0) ADD(1) TOPIC(2) CONTACT(3)
            case /(^[.]db$)/i.test(mainMsg[0]) && /^add$/i.test(mainMsg[1]) && /^(?!(add|del|show)$)/ig.test(mainMsg[2]):
                //增加選擇圖書
                //檢查有沒有重覆
                //if (!mainMsg[2]) return;
                //if (!mainMsg[3]) return;
                let checkifsamename = 0
                if (groupid && userrole >= 1 && mainMsg[3]) {
                    if (rply.trpgChoosefunction)
                        for (var i = 0; i < rply.trpgChoosefunction.length; i++) {
                            if (rply.trpgChoosefunction[i].groupid == groupid) {
                                // console.log('checked1')
                                if (rply.trpgChoosefunction[0] && rply.trpgChoosefunction[0].trpgChoosefunction[0])
                                    for (var a = 0; a < rply.trpgChoosefunction[i].trpgChoosefunction.length; a++) {
                                        if (rply.trpgChoosefunction[i].trpgChoosefunction[a].topic == mainMsg[2]) {
                                            //   console.log('checked')
                                            checkifsamename = 1
                                        }
                                    }
                            }
                        }
                    let temp = {
                        groupid: groupid,
                        trpgChoosefunction: [{
                            topic: mainMsg[2],
                            contact: inputStr.replace(/\.db\s+add\s+/i, '').replace(mainMsg[2], '').replace(/^\s+/, '')
                        }]
                    }
                    if (checkifsamename == 0) {
                        records.pushtrpgChoosefunction('trpgChoose', temp, () => {
                            records.get('trpgChoose', (msgs) => {
                                rply.trpgChoosefunction = msgs
                                // console.log(rply);
                            })

                        })
                        rply.text = '新增成功: ' + mainMsg[2]
                    } else rply.text = '新增失敗. 重複標題'
                } else {
                    rply.text = '新增失敗.'
                    if (!mainMsg[2])
                        rply.text += ' 沒有標題.'
                    if (!mainMsg[3])
                        rply.text += ' 沒有內容'
                    if (!groupid)
                        rply.text += ' 不在群組.'
                    if (groupid && userrole < 1)
                        rply.text += ' 只有GM以上才可新增.'
                }
                return rply;

            case /(^[.]db$)/i.test(mainMsg[0]) && /^del$/i.test(mainMsg[1]) && /^all$/i.test(mainMsg[2]):
                //刪除選擇圖書
                if (groupid && mainMsg[2] && rply.trpgChoosefunction && userrole >= 2) {
                    for (var i = 0; i < rply.trpgChoosefunction.length; i++) {
                        if (rply.trpgChoosefunction[i].groupid == groupid) {
                            let temp = rply.trpgChoosefunction[i]
                            temp.trpgChoosefunction = []
                            records.settrpgChoosefunction('trpgChoose', temp, () => {
                                records.get('trpgChoose', (msgs) => {
                                    rply.trpgChoosefunction = msgs
                                })
                            })
                            rply.text = '刪除所有關鍵字'
                        }
                    }
                } else {
                    rply.text = '刪除失敗.'
                    if (!groupid)
                        rply.text += '不在群組. '
                    if (groupid && userrole < 1)
                        rply.text += '只有GM以上才可刪除. '
                }

                return rply;
            case /(^[.]db$)/i.test(mainMsg[0]) && /^del$/i.test(mainMsg[1]) && /^\d+$/i.test(mainMsg[2]):
                //刪除選擇圖書
                if (groupid && mainMsg[2] && rply.trpgChoosefunction && userrole >= 1) {
                    for (var i = 0; i < rply.trpgChoosefunction.length; i++) {
                        if (rply.trpgChoosefunction[i].groupid == groupid && mainMsg[2] < rply.trpgChoosefunction[i].trpgChoosefunction.length && mainMsg[2] >= 0) {
                            let temp = rply.trpgChoosefunction[i]
                            temp.trpgChoosefunction.splice(mainMsg[2], 1)
                            //console.log('rply.trpgChoosefunction: ', temp)
                            records.settrpgChoosefunction('trpgChoose', temp, () => {
                                records.get('trpgChoose', (msgs) => {
                                    rply.trpgChoosefunction = msgs
                                })
                            })
                        }
                        rply.text = '刪除成功: ' + mainMsg[2]
                    }
                } else {
                    rply.text = '刪除失敗.'
                    if (!mainMsg[2])
                        rply.text += '沒有關鍵字. '
                    if (!groupid)
                        rply.text += '不在群組. '
                    if (groupid && userrole < 1)
                        rply.text += '只有GM以上才可刪除. '
                }
                return rply;

            case /(^[.]db$)/i.test(mainMsg[0]) && /^show$/i.test(mainMsg[1]):
                //顯示
                records.get('trpgChoose', (msgs) => {
                    rply.trpgChoosefunction = msgs
                })
                //console.log(rply.trpgChoosefunction)
                if (groupid) {
                    let temp = 0;
                    if (rply.trpgChoosefunction)
                        for (var i = 0; i < rply.trpgChoosefunction.length; i++) {
                            if (rply.trpgChoosefunction[i].groupid == groupid) {
                                rply.text += '選擇圖書列表:'
                                for (var a = 0; a < rply.trpgChoosefunction[i].trpgChoosefunction.length; a++) {
                                    temp = 1
                                    rply.text += ("\n") + a + '. ' + rply.trpgChoosefunction[i].trpgChoosefunction[a].topic
                                }
                            }
                        }
                    if (temp == 0) rply.text = '沒有已設定的關鍵字. '
                } else {
                    rply.text = '不在群組. '
                }
                //顯示選擇圖書
                rply.text = rply.text.replace(/^([^(,)\1]*?)\s*(,)\s*/mg, '$1: ').replace(/\,/gm, ', ')
                return rply
            case /(^[.]db$)/i.test(mainMsg[0]) && /\S/i.test(mainMsg[1]) && /^(?!(add|del|show)$)/ig.test(mainMsg[1]):
                //顯示關鍵字
                //let times = /^[.]db/.exec(mainMsg[0])[1] || 1
                //if (times > 30) times = 30;
                //if (times < 1) times = 1
                //console.log(times)
                if (groupid) {
                    //    console.log(mainMsg[1])
                    let temp = 0;
                    if (rply.trpgChoosefunction && mainMsg[1])
                        for (var i = 0; i < rply.trpgChoosefunction.length; i++) {
                            if (rply.trpgChoosefunction[i].groupid == groupid) {
                                // console.log(rply.trpgChoosefunction[i])
                                //rply.text += '選擇圖書列表:'
                                for (var a = 0; a < rply.trpgChoosefunction[i].trpgChoosefunction.length; a++) {
                                    if (rply.trpgChoosefunction[i].trpgChoosefunction[a].topic.toLowerCase() == mainMsg[1].toLowerCase()) {
                                        temp = 1
                                        rply.text = rply.trpgChoosefunction[i].trpgChoosefunction[a].topic + '\n' + rply.trpgChoosefunction[i].trpgChoosefunction[a].contact;

                                    }

                                }
                            }
                        }
                    if (temp == 0) rply.text = '沒有相關關鍵字. '
                } else {
                    rply.text = '不在群組. '
                }
                rply.text = rply.text.replace(/\,/mg, ' ')
                return rply;
            case /(^[.]dbp$)/i.test(mainMsg[0]) && /^add$/i.test(mainMsg[1]) && /^(?!(add|del|show)$)/ig.test(mainMsg[2]):
                //if (!mainMsg[2]) return;
                let checkifsamenamegroup = 0
                if (rply.trpgChooseAllgroup && mainMsg[2])
                    if (rply.trpgChooseAllgroup[0].trpgChooseAllgroup[0])
                        for (var i = 0; i < rply.trpgChooseAllgroup.length; i++) {
                            for (var a = 0; a < rply.trpgChooseAllgroup[i].trpgChooseAllgroup.length; a++) {
                                if (rply.trpgChooseAllgroup[i].trpgChooseAllgroup[a].topic.toLowerCase() == mainMsg[2].toLowerCase()) {
                                    checkifsamenamegroup = 1
                                }
                            }
                        }
                if (mainMsg[3]) {
                    let tempA = {
                        trpgChooseAllgroup: [{
                            topic: mainMsg[2],
                            contact: inputStr.replace(/\.dbp add /i, '').replace(mainMsg[2], '').replace(/^\s+/, '')
                        }]
                    }
                    if (checkifsamenamegroup == 0) {
                        records.pushtrpgChooseAllgroup('trpgChooseAllgroup', tempA, () => {
                            records.get('trpgChooseAllgroup', (msgs) => {
                                rply.trpgChooseAllgroup = msgs
                                // console.log(rply);
                            })
                        })
                        rply.text = '新增成功: ' + mainMsg[2]
                    } else {
                        rply.text = '新增失敗. 重複關鍵字'
                    }
                } else {
                    rply.text = '新增失敗.'
                    if (!mainMsg[2])
                        rply.text += ' 沒有關鍵字.'
                    if (!mainMsg[3])
                        rply.text += ' 沒有內容.'
                }
                return rply;
            case /(^[.]dbp$)/i.test(mainMsg[0]) && /^show$/i.test(mainMsg[1]):
                records.get('trpgChooseAllgroup', (msgs) => {
                    rply.trpgChooseAllgroup = msgs
                })
                let tempshow = 0;
                if (rply.trpgChooseAllgroup)
                    for (var i = 0; i < rply.trpgChooseAllgroup.length; i++) {
                        rply.text += '選擇圖書列表:'
                        for (var a = 0; a < rply.trpgChooseAllgroup[i].trpgChooseAllgroup.length; a++) {
                            tempshow = 1
                            rply.text += ("\n") + a + '. ' + rply.trpgChooseAllgroup[i].trpgChooseAllgroup[a].topic
                        }
                    }
                if (tempshow == 0) rply.text = '沒有已設定的關鍵字. '
                //顯示選擇圖書
                rply.text = rply.text.replace(/^([^(,)\1]*?)\s*(,)\s*/mg, '$1: ').replace(/\,/gm, ', ')
                return rply
            case /(^[.]dbp$)/i.test(mainMsg[0]) && /\S/i.test(mainMsg[0]) && /^(?!(add|del|show)$)/ig.test(mainMsg[1]):

                //let timesgp = /^[.]dbp/.exec(mainMsg[0])[1] || 1
                //  if (timesgp > 30) timesgp = 30;
                //  if (timesgp < 1) timesgp = 1
                let temp2 = 0;
                if (rply.trpgChooseAllgroup && mainMsg[1])
                    for (var i = 0; i < rply.trpgChooseAllgroup.length; i++) {
                        for (var a = 0; a < rply.trpgChooseAllgroup[i].trpgChooseAllgroup.length; a++) {
                            if (rply.trpgChooseAllgroup[i].trpgChooseAllgroup[a].topic.toLowerCase() == mainMsg[1].toLowerCase()) {
                                temp2 = 1
                                rply.text = rply.trpgChooseAllgroup[i].trpgChooseAllgroup[a].topic + '\n' + rply.trpgChooseAllgroup[i].trpgChooseAllgroup[a].contact;


                            }
                        }
                    }
                if (temp2 == 0) rply.text = '沒有相關關鍵字. '
                return rply;
            default:
                break;

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