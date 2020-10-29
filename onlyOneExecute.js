const exec = require("child_process").execSync;
const fs = require("fs");
const download = require("download");
const smartReplace = require("./smartReplace");

// 公共变量
const Secrets = {
    JD_COOKIE: process.env.JD_COOKIE, //cokie,多个用&隔开即可
    SyncUrl: process.env.SYNCURL, //签到地址,方便随时变动
    PUSH_KEY: process.env.PUSH_KEY, //server酱推送消息
    BARK_PUSH: process.env.BARK_PUSH, //Bark推送
    TG_BOT_TOKEN: process.env.TG_BOT_TOKEN, //TGBot推送Token
    TG_USER_ID: process.env.TG_USER_ID, //TGBot推送成员ID
    MarketCoinToBeanCount: process.env.JDMarketCoinToBeans, //京小超蓝币兑换京豆数量
    JoyFeedCount: process.env.JDJoyFeedCount, //宠汪汪喂食数量
    FruitShareCodes: process.env.FruitShareCodes, //京东农场分享码
    Unsubscribe: process.env.UNSUBSCRIBE, //取关商铺
    LOCATION: process.env.LOCATION, //第几个yml
};

async function downFile() {
    await download(Secrets.SyncUrl, "./", { filename: "temp.js" });
    console.log("下载代码完毕");
}

async function changeFiele() {
    let content = await fs.readFileSync("./temp.js", "utf8");
    content = await smartReplace.replaceWithSecrets(content, Secrets);
    await fs.writeFileSync("./execute.js", content, "utf8");
    console.log("替换变量完毕");
}

async function start() {
    console.log(`当前执行时间:${new Date().toString()}`);
    let CookieJDs = [];
    CookieJDs = Secrets.JD_COOKIE.split('&');
    if (Secrets.LOCATION) {	
    	Secrets.JD_COOKIE = CookieJDs[Number(Secrets.LOCATION)-1]
    }
    if (!Secrets.JD_COOKIE) {
        console.log("请填写 JD_COOKIE 后在继续");
        return;
    }
    if (!Secrets.SyncUrl) {
        console.log("请填写 SYNCURL 后在继续");
        return;
    }
    if (Secrets.LOCATION) {	
    	console.log(`当前共${CookieJDs.length}个账号需要签到,只执行第${Number(Secrets.LOCATION)}个`);
    }
    else{
    	console.log(`当前共${CookieJDs.length}个账号需要签到`);
    }
    function startTime(){
        let targetTimezone = -8 ; // 目标时区，东9区
        let _dif = new Date().getTimezoneOffset();   // 当前时区与中时区时差，以min为维度
        // 本地时区时间 + 时差  = 中时区时间
        // 目标时区时间 + 时差 = 中时区时间
        // 目标时区时间 = 本地时区时间 + 本地时区时差 - 目标时区时差
        let east8time = new Date().getTime() + _dif * 60 * 1000 - (targetTimezone * 60 * 60 * 1000) // 东8区时间
        let today=new Date(east8time);
        const start_run = new Date(new Date().toLocaleDateString());
        start_run.setTime(start_run.getTime() + 3600 * 1000 * 24 * 1);
        let wait_time = start_run - today;
        return wait_time;
    }
	
    function sleep(delay)
    {
        let start = new Date().getTime();
	while (new Date().getTime() < start + delay);
    }
    let waiting_time = 0;
    if (Secrets.LOCATION) {	
    	waiting_time = startTime()
    }
    
    if (waiting_time <= 300000) {
	console.log("检测到离零点只有不到五分钟，脚本将等待" + waiting_time / 1000 + "s，到零点再执行");
	sleep(waiting_time);
    }
	    
    try {
        await downFile();
        await changeFiele();
        await exec("node execute.js", { stdio: "inherit" });
    } catch (e) {
        console.log("执行异常:" + e);
    }
    console.log("执行完毕");
}

start();
