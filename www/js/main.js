$(function(){
  var chat = new Chat();
  chat._init();
});

//定义我们的chat类
var Chat = function(){
  this.socket = null;
}

//向原型添加业务方法
Chat.prototype = {
  //此方法初始化程序
  _init: function(){
    var that = this;
    this.socket = io.connect();//建立到服务器的socket连接
    //监听connect事件，此事件表示连接已经建立
    this.socket.on('connect',function(){
      //连接到服务器后，显示昵称输入框
      setTimeout(() => {
        $('.loginTitle').text('请输入您的昵称');
        $('#loginName').show();
        $('#loginBtn').show();
        $('#loginName').focus();
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
      },1000);
      //点击提交昵称
      $('#loginBtn').click(function(){
        var name = $('#loginName').val();
        //检查昵称输入框是否为空
        if(name.trim().length > 0){
          //不为空，则发起一个login事件并将输入的昵称发送到服务器
          that.socket.emit('login',name);
        }else{
          //为空，输入框获得焦点
          $('#loginName').focus();
        }
      });
      //enter提交昵称
      $('#loginName').keydown(function(event){
        if (event.keyCode == 13) {
          var name = $('#loginName').val();
          //检查昵称输入框是否为空
          if(name.trim().length > 0){
            //不为空，则发起一个login事件并将输入的昵称发送到服务器
            that.socket.emit('login',name);
          }else{
            //为空，输入框获得焦点
            $('#loginName').focus();
          }
        }
      });
      //点击发送消息
      $('#sendBtn').click(function(){
        var msg = $('#newMsg').html();
        var color = $('#thisColor').val();
        //检查输入框是否为空
        if(msg.trim().length > 0){
          //不为空，则发送到服务器
          that.socket.emit('postMsg', msg, color);
          that._displayNewMsg('1','me', msg, color);
          $('#newMsg').text('');
        }else{
          //为空，输入框获得焦点
          $('#newMsg').focus();
        }
      });
      //enter发送消息
      $('#newMsg').keydown(function(event){
        //发送
        if(event.keyCode == 13){
          //阻止enter默认事件
          event.cancelBubble = true;
          event.preventDefault();
          event.stopPropagation();
          //进入换行操作
          var msg = $('#newMsg').html();
          var color = $('#thisColor').val();
          //检查输入框是否为空
          if(msg.trim().length > 0){
            //不为空，则发送到服务器
            that.socket.emit('postMsg', msg, color);
            that._displayNewMsg('1','me', msg, color);
            $('#newMsg').html('');
          }else{
            //为空，输入框获得焦点
            $('#newMsg').focus();
          }
        }
      });
    });
    //用户名被占用
    this.socket.on('nickExisted',function(){
      $('.loginTitle').text('用户名被占用！');
    });
    //登录成功
    this.socket.on('loginSuccess',function(){
      $('.loginBox').hide();
      $('#newMsg').focus();
      $('title').text('chat | ' + $('#loginName').val());
    });
    //断开连接的用户系统提示
    this.socket.on('system',function(user,userCount,type){
      var msg = (type === 'login'?'加入群聊':'离开群聊');
      that._displayNewMsg('0', user, msg, 'red');
      $('#count').text(userCount);
    });
    //接收新消息
    this.socket.on('newMsg',function(user,msg,color){      
      that._displayNewMsg('1', user, msg, color);
    });
    //接收新图片
    this.socket.on('newImg',function(user,imgData){      
      that._displayImg(user, imgData);
    });
    //加载表情
    this._initEmoji();
    $('#thisEmoji').click(function(event){
      event.stopPropagation();
      $('.emojiBox').show();
    });
    $('body').click(function(event){
      if(event.target != $('.emojiBox')){
        $('.emojiBox').hide();
      }
    });
    $('.thisLi').click(function(){
      var src = $(this).children('img').attr('src');
      insertImg(`<img src="${src}" alt="" />`);
    });
    //清屏
    $('#clean').click(function(){
      $('#historyMsg').empty();
    });
    //光标位置插入表情图片
    function insertImg(html){
      $('#newMsg').focus();
      var sel, range;
      if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();
          var el = document.createElement("div");
          el.innerHTML = html;
          var frag = document.createDocumentFragment(),
            node, lastNode;
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);
          //保存光标
          if (lastNode) {
            range = range.cloneRange();
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      } else if (document.selection && document.selection.type != "Control") {
        // IE < 9  
        document.selection.createRange().pasteHTML(html); 
      }  
    }
    //发送图片
    $('#thisImg').change(function(){
      //判断是否选中图片
      if (this.files.length > 0) {
        var file = this.files[0],
          reader = new FileReader();
        if (!reader) {
          that._displayNewMsg('system','your browser doesn\'t support fileReader!', 'red');//不支持fileReader
          $(this).val('');
          return false;
        }
        reader.onload = function(e){
          $(this).val('');
          that.socket.emit('img',e.target.result);
          that._displayImg('me',e.target.result);
        }
        reader.readAsDataURL(file);
      }
    });
  },
  //定义消息样式
  _displayNewMsg: function(type, user, msg, color){  //type: 0为系统消息 1为聊天消息
    var date = new Date().toTimeString().substr(0,8);
    var thisColor = color || '#000';
    if (type === '0') {
      $('#historyMsg').append(`<p class="pInfo t_c" style="color:${thisColor};">${user}<span class="dateInfo">(${date})</span>${msg}</p>`);
    } else if (type === '1') {
      $('#historyMsg').append(`<p class="pInfo t_l clearfix" style="color:${thisColor};"><span class="fl">${user}</span><span class="dateInfo fl">(${date}):</span><span class="msgInfo">${msg}<i class="point"></i></span></p>`);
    }
    $('#historyMsg').scrollTop($('#historyMsg')[0].scrollHeight);
  },
  //定义图片样式
  _displayImg: function(user, imgData, color){
    var date = new Date().toTimeString().substr(0,8);
    var thisColor = color || '#000';
    $('#historyMsg').append(`<p class="pInfo t_l clearfix" style="color:${thisColor};"><span class="fl">${user}</span><span class="dateInfo fl">(${date}):</span><span class="msgInfo"><img src="${imgData}" alt="" style="display:block;" /><i class="point"></i></span></p>`);
    setTimeout(() => {
      $('#historyMsg').scrollTop($('#historyMsg')[0].scrollHeight);
    },20);
  },
  //初始化表情
  _initEmoji: function(){
    var li = '';
    for(var i = 1; i < 69; i++){
      li += '<li class="thisLi"><img src="img/emoji/'+ i +'.gif" title="'+ i +'" alt=""></li>';
    }
    $('.emojiBox').empty().append(li);
  }
}