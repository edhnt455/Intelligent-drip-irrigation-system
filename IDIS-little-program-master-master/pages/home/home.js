// pages/Home/home/home.js

const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    swiperList: [{
      id: 0,
      type: 'image',
      url: 'https://img1.baidu.com/it/u=2825378576,344799449&fm=253&fmt=auto&app=138&f=JPEG?w=729&h=500'
    }, {
      id: 1,
      type: 'image',
        url: 'https://img1.baidu.com/it/u=2195380403,344134507&fm=253&fmt=auto&app=138&f=JPEG?w=1036&h=500',
    }],
    elements: [
      {
        title: '系统设置',
        name: 'Settings',
        color: 'blue',
        icon: 'settings',
        url: '/pages/setting/setting' 
      },
      {
        title: '扫描绑定',
        name: 'Scan',
        color: 'yellow',
        icon: 'scan',
        url: "/pages/learn/learn"
      },
      {
      title: '环境监测',
      name: 'History',
      color: 'green', 
      icon: 'rankfill',
      url:"/pages/chart/chart"
    },
    {
      title: '使用说明',
        name: 'introduce',
        color: 'pink',
        icon: 'search',
        url:"/pages/introduce/introduce"
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: 'http://hejiale.club:5000/user/chart',
      method: "POST",
      // data: {
      //   userid: app.globalData.userid
      // },
      success: function(resp)
      {
        app.globalData.chart_data = resp.data['ans']
        console.log(app.globalData.chart_data)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: this.data.cooperation_img // 需要预览的图片http链接列表  
    })
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
        
  }
})