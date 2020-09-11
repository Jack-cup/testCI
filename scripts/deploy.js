const shelljs = require('shelljs');
const Rsync = require('rsync');
const path = require('path');
const colors = require('colors');
const argv = require('yargs').argv;
console.log(argv);
const [
    targetName,
] = argv._;

const host_map = {
    staging001: 'root@140.143.1.235:/data',
};

if (!host_map[targetName]) {
    shelljs.echo(colors.red('目标主机不存在'));
    shelljs.exit(1);
}

function sendNotify(message) {
    shelljs.exec(`curl 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=bce19711-62fa-4f9f-9f90-1dfc6f10b557' -H 'Content-Type: application/json' -d '{"msgtype": "text", "text": {"content": "${message}"}}'`);
}

// 通知 开始构建
// curl 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=d273427f-8f19-453c-bf7f-a3bfa098f5bc' - H 'Content-Type: application/json' - d '{"msgtype": "text","text": {"content": "hello world"}}'
// sendNotify('王辉部署测试');
// 安装依赖
// sendNotify('安装依赖');
console.log(colors.yellow('🐛️ 安装依赖'));
if (shelljs.exec('npm i').code !== 0) {
    shelljs.echo('error: npm install error.');
    shelljs.exit(1);
}

// 测试
// sendNotify('开始测试');
console.log(colors.yellow('🐛️ 进行测试'));
if (shelljs.exec('npm run test').code !== 0) {
    shelljs.echo('error: npm install error.');
    shelljs.exit(1);
}

// 构建
// sendNotify('开始构建');
console.log(colors.yellow('☕️ 开始构建'));
if (shelljs.exec('npm run build').code !== 0) {
    shelljs.echo('error: npm install error.');
    shelljs.exit(1);
}

// 部署
console.log(colors.yellow('🐛️ 开始部署'));
// sendNotify('开始部署');
const rsync = Rsync.build({
    source: path.join(__dirname, '../', '.vuepress/dist/*'),
    destination: host_map[targetName],
    flags: 'avz',
    shell: 'ssh',
});

rsync.execute((err, code, cmd) => {
    console.log(err, code, cmd);
    console.log(colors.green('🚀 部署完成'));
    // sendNotify('部署完成');
});