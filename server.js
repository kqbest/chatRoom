// var http = require('http'),//引入http模块
//   //创建一个服务器
//   server = http.createServer(function(req, res){
//   res.writeHead(200,{
//     'contentType':'text/html'
//   });
//   res.write('<h1>Hello World!<h1>');
//   res.end();
// });
// //监听2020端口
// server.listen(2020);
// console.log('server started');

var express = require('express'),//引入express模块
        app = express(),
     server = require('http').createServer(app),
         io = require('socket.io').listen(server),//引入socket.io模块并绑定到服务器
      users = [];//保存所有在线用户的昵称

app.use('/',express.static(__dirname + '/www'));//指定静态HTML文件的位置
server.listen(2000);
console.log('////////////////////////////////////////////////'+'\n'+
            '                    _ooOoo_                     '+'\n'+
            '                   o8888888o                    '+'\n'+
            '                   88" . "88                    '+'\n'+
            '                   (| ^_^ |)                    '+'\n'+
            '                   O\\  =  /O                   '+'\n'+
            '                ____/`---`\\____                '+'\n'+
            '              .`  \\\\|     |//  `.             '+"\n"+
            '             /  \\\\|||  :  |||//  \\           '+'\n'+
            '            /  _||||| -:- |||||-  \\            '+'\n'+
            '            |   | \\\\\\  -  /// |   |          '+'\n'+
            '            | \\_|  ``\\---/``  | _/|           '+'\n'+
            '            \\  .-\\__  `-`  ___/-. /           '+'\n'+
            '          ___`. .`  /--.--\\  `. . ___          '+'\n'+
            '       ."" `<  `.___\\_<|>_/___.`  >`"".        '+'\n'+
            '      | | :  `- \\`.;`\\ _ /`;.`/ - ` : | |     '+'\n'+
            '      \\  \\ `-.   \\_ __\\ /__ _/   .-` /  /   '+'\n'+
            '=======`-.____`-.___\\_____/___.-`____.-`======='+'\n'+
            '                    `=---=`                     '+'\n'+
            '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^'+'\n'+
            '      佛祖保佑       永不宕机     永无BUG         '+'\n'+
            '////////////////////////////////////////////////');

//socket部分
io.on('connection',function(socket){
  //昵称设置
  socket.on('login',function(name){
    if(users.indexOf(name) > -1){
      socket.emit('nickExisted');
    }else{
      socket.userIndex = users.length;
      socket.name = name;
      users.push(name);
      socket.emit('loginSuccess');
      io.sockets.emit('system', name, users.length , 'login');//向所有连接到服务器的客户端发送当前登陆用户的昵称
    }
  });

  //断开连接的事件
  socket.on('disconnect',function(){
    //将断开连接的用户从users中删除
    users.splice(socket.userIndex,1);
    //通知除自己以外的所有人
    socket.broadcast.emit('system', socket.name, users.length, 'loginOut');
  });

  //接收新消息
  socket.on('postMsg',function(msg,color){
    //将消息发送到除自己外的所有用户
    socket.broadcast.emit('newMsg', socket.name, msg, color);
  });
  
  //接收图片
  socket.on('img',function(imgData){
    //将消息发送到除自己外的所有用户
    socket.broadcast.emit('newImg', socket.name, imgData);
  });
});