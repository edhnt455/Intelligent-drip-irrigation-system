// app.js
App({
  onLaunch() {
    
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    //获取屏幕高度
    var windowHeight = 0;
    wx.getSystemInfo({
      success: function (res) {
        windowHeight = res.windowHeight;
      }
    })
    this.globalData.windowHeight = windowHeight;

     // 获取系统状态栏信息
     wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })
  },
  
  globalData: {
    chart_data: null,  // 拿到图表数据
    ques_id: null,  //题目id
    userid: 1,  // 用户名
  }  
})
