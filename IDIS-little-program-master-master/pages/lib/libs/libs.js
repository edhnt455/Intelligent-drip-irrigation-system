// pages/lib/libs/libs.js
var app = getApp()
var hander = require('../../../utils/dataHander.js')
Page({
  data: {
    windowHeight: 0,
    items: [],
    modalHidden: true,
    selectLib: '',
    actionSheetHidden: true,
    alterShow: false,
    name: '',
    touchstart: null,
    touchend: null
  },
  itemtap: function (e) {
    var that = this;
    // app.globalData.selectLib = e.currentTarget.id;
    if(e.currentTarget.id == '自适应推荐功能'){
      if(app.globalData.userclass == 2){
        wx.showModal({
          title: '提示',
          content: '您还未完成摸底测试，请完成或选择冷启动模式！',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
      else{
        wx.showLoading({
          title: '试题正在生成中，请耐心等待喔...',
        })
        wx.request({
          url: 'http://hejiale.club:5000/user/recommend_exam',
          method: "POST",
          data: {  
            username: app.globalData.username
          }, 
          success: function(res)
          {  
            // console.log(res.data); 
            if(res.data.code==400)
            { 
              wx.showToast({
                title: '返回错误',
                icon: 'none',
                duration: 2000  //持续的时间
              })  
            } 
            else
            {     // 调用globaldata
              app.globalData.questionList = res.data; 
              app.globalData.isleng=false;
              console.log(app.globalData.questionList)
              wx.navigateTo({
                url: '/pages/recommend/recommend'
                })   
            }   
          },
          complete(){
            wx.hideLoading()
          }
        })
      }
    }
    else if(e.currentTarget.id == '考试检验啦')
    {
      wx.request({
        url: 'http://skyhook.cloud:5000/user/final_exam',
        method: "POST",
        success: function(res)
        { 
        console.log(res.data); 
          if(res.data['access']==1){
            app.globalData.questionList = res.data['ques_list']; 
            console.log(app.globalData.questionList)
            wx.navigateTo({
              url: '/pages/finalexam/finalexam'
              })
          }
          else{
            wx.showModal({
              title: '提示',
              content: '您还未完成推荐或冷启动，请先完成！',
              success(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }
        }
      })
    }
    else if(e.currentTarget.id == '摸底测试'){
      if(app.globalData.userclass == 1)
      {
        wx.showModal
        ({
          title: '提示',
          content: '您已完成摸底测试，请选择推荐模式！',
          success(res) 
          {
            if (res.confirm) 
            {
              console.log('用户点击确定')
            } else if (res.cancel) 
            {
              console.log('用户点击取消')
            }
          }

        })
      }
       else{
            wx.request({
              url: 'http://skyhook.cloud:5000/user/exam',
              method: "POST",
              // data: {  
              //   username: that.data.username,
              //   password: that.data.password
              // }, 
              success: function(res)
              { 
                // console.log(res.data); 
                if(res.data.code==400)
                { 
                  wx.showToast({
                    title: '错误',
                    icon: 'none',
                    duration: 2000  //持续的时间
                  })  
                }  
                else
                {     // 调用globaldata
                  app.globalData.questionList = res.data['ques']; 
                  app.globalData.ques_id = res.data['id']; 
                  console.log(app.globalData.questionList)
                  console.log(app.globalData.ques_id)
                  wx.navigateTo({
                    url: '/pages/exam/exam'
                    })
                }
              }
            })
          }
        }
    else{//冷启动模式
      if(app.globalData.userclass == 1)
      {
        wx.showModal
        ({
          title: '提示',
          content: '您已完成摸底测试，请选择推荐模式！',
          success(res) 
          {
            if (res.confirm) 
            {
              console.log('用户点击确定')
            } else if (res.cancel) 
            {
              console.log('用户点击取消')
            }
          }

        })
      }
      else
      {
        wx.showLoading({
          title: '试题正在生成中，请耐心等待喔...',
        })
        
        wx.request({
          url: 'http://skyhook.cloud:5000/user/leng_exam',
          method: "POST",
          data: {  
            username: app.globalData.username
          }, 
          success: function(res)
          { 
            // console.log(res.data); 
            if(res.data.code==400)
            { 
              wx.showToast({
                title: '错误',
                icon: 'none',
                duration: 2000  //持续的时间
              })
            }  
            else
            {     // 调用globaldata
              app.globalData.questionList = res.data; 
              app.globalData.isleng=true;
              console.log(app.globalData.questionList)
              wx.navigateTo({
                url: '/pages/leng_exam/leng_exam'
                })
              
            }
          },
          complete(){
            wx.hideLoading()
          }
        
        })
      }
    }
    
  },
  
  onLoad: function () {
    this.setData({ windowHeight: app.globalData.windowHeight }),
      console.log("libs...onLoading")
  },
  onShow: function () {
    this.setData({
      // items: hander.getLibsName(),
      items: ['摸底测试','冷启动模式','自适应推荐功能','考试检验啦'],
      alterShow: false,
    })
    console.log("lins...showing")
  },
  btnStart: function () {
    wx.navigateTo({
      url: '../lib/libs/libs',
    })
  }
})