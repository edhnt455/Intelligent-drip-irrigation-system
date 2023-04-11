//index.js
//注意！基础库【2.9.0】起支持 2d 模式，如不显示请检查基础库版本！
import uCharts from '../../js_sdk/u-charts/u-charts.js';
Page({
    data: {
        checked: "",//pump的状态
        checked2: "",//自动模式的状态
        wendu:"",//温度值，默认为空
        shidu:"",//湿度值，默认为空
        light:"",
        mosi:"",
        pumpicon:"",//显示pump图标的状态。默认是关闭状态图标
        autoicon:"",
    }, 

    DBConnect(){
        var that = this
        wx.request({
            url: 'http://hejiale.club:5000/user/env', 
            method: "POST",
            success: function(resp)
            {
                console.log(resp.data)
                that.setData({ //数据赋值给变量
                    shidu:resp.data[0],//赋值温度
                    wendu:resp.data[1], //赋值湿度
                    // light:resp.data[2],
                    light:60,
                    mosi:resp.data[3],
                    checked: resp.data[4],
                    checked2: resp.data[5]
                })
            }
        })
        //如果点击前是打开状态，现在更换为关闭状态，并更换图标，完成状态切换
    },

    PumpSetting(){
        var that = this
        // console.log('灯状态：')
        // console.log(that.data.checked)
        if( that.data.checked == 1){
            that.setData({
                pumpicon: "/image/lighton.png",//设置led图片为off
            });
        }else{
            that.setData({
                pumpicon: "/image/lightoff.png",//设置led图片为on
            });
        }
    },

    AutoSetting(){
        var that = this
        // console.log('自动化状态：')
        // console.log(that.data.checked)
        if( that.data.checked2 == 1){
            that.setData({
                autoicon: "/image/open.png",
            });
        }else{
            that.setData({
                autoicon: "/image/off.png",
            });
        }
    },

    onLoad: function () {
        this.DBConnect()
    },
    onReady() {
        this.PumpSetting()
        this.AutoSetting()
    },
    //点击led图片执行的函数
    onChange2(){
        var that = this
        //如果点击前是打开状态，现在更换为关闭状态，并更换图标，完成状态切换
        if(that.data.checked == 1){
            wx.request({
                url: 'http://hejiale.club:5000/user/update_system',
                method: "POST",
                data:{
                    tag: "motor_state",
                    value: 0
                }
            })
            this.setData({
                pumpicon: "/image/lightoff.png",//设置led图片为off
                checked:false //设置led状态为false
            });
        }else{
            //如果点击前是关闭状态，现在更换为打开状态，并更换图标，完成状态切换
            wx.request({
                url: 'http://hejiale.club:5000/user/update_system',
                method: "POST",
                data:{
                    tag: "motor_state",
                    value: 1
                }
            })
            that.setData({
                pumpicon: "/image/lighton.png",//设置led图片为on
                checked:true//设置led状态为true
            });
        }
    },

    onChange(){
        var that = this
        //如果点击前是打开状态，现在更换为关闭状态，并更换图标，完成状态切换
        if(that.data.checked2 == 1){
            wx.request({
                url: 'http://hejiale.club:5000/user/update_system',
                method: "POST",
                data:{
                    tag: "automate_state",
                    value: 0
                }
            })
            this.setData({
                qutoicon: "/image/off.png",//设置led图片为off
                checked2:false //设置led状态为false
            });
        }else{
            //如果点击前是关闭状态，现在更换为打开状态，并更换图标，完成状态切换
            wx.request({
                url: 'http://hejiale.club:5000/user/update_system',
                method: "POST",
                data:{
                    tag: "automate_state",
                    value: 1
                }
            })
            that.setData({
                autoicon: "/image/open.png",//设置led图片为on
                checked2:true//设置led状态为true
            });
        }
    }
})