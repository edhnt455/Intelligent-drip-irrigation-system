var app = getApp()
Page({
  data: {
    username: '',
    password: '',
    url: ''
  },
 
  // 获取输入账号 
  phoneInput: function (e) {
    this.setData({
      username: e.detail.value
    })
  },
 
  // 获取输入密码 
  passwordInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
 
  // 登录 
  login: function () 
  {
    var that = this;
    if (that.data.username.length == 0) {
      wx.showToast({
        title: '用户名不能为空',
        icon: 'loading',
        duration: 1000
      })
    } else if (that.data.password.length == 0) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'loading',
        duration: 1000
      })
    }
    else {
      wx.request({
        url: 'http://hejiale.club:5000/user/login',
        method: "POST",
        data: {
          username: that.data.username,
          password: that.data.password
        },
 
        success: function(res)
        {
          if(res.data.code==200)
          {     // 调用globaldata
            app.globalData.userid = res.data.msg;
            console.log(app.globalData.userid);
            wx.navigateTo({
              url: '../home/home'
            }) 
          } 
          else if(res.data.code==400)
          {
            wx.showToast({
              title: '账号或密码错误',
              icon: 'error', 
              duration: 2000  //持续的时间
            })
          }
          else if(res.data.code==300)
          {
            app.globalData.userclass = 2;
            console.log(app.globalData.userclass)
            wx.navigateTo({
              url: '../home/home'
            })
          }
          else    
          {  
            wx.showToast({  
              title: '请先注册！',  
              icon: 'error',
              duration: 2000  //持续的时间
            })
            // wx.navigateTo({  
            //   url: '/pages/register/register'
            //   })
          }
          
        }
      })
    }
  },
  // 注册 
  register: function () {
    wx.navigateTo({
      url: '/pages/register/register',
    })
  },

  
})