var app = getApp()
var hander = require('../../utils/dataHander.js')

Page({
  data: {
    PageCur: 'Home',

  },

  onLoad: function () {
    // wx.switchTab({
    //   url: '/pages/lib/libs/libs'
    // })
    console.log("index...onLoading")
  },
  onShow: function () {
    this.setData({
      items: hander.getLibsName(),
      alterShow: false,
    })
    console.log("index...showing")

    
  },
  NavChange(e) {
    this.setData({
      PageCur: e.currentTarget.dataset.cur
    })
  }
})
