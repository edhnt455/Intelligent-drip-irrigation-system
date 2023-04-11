//index.js
//注意！基础库【2.9.0】起支持 2d 模式，如不显示请检查基础库版本！
import uCharts from '../../js_sdk/u-charts/u-charts.js';
var uChartsInstance = {};
var app = getApp()
Page({
  data: {
    cWidth: 750,
    cHeight: 500,
    pixelRatio: 2,
      codeUrl:''
  }, 
 
  onReady() {
    //这里的第一个 750 对应 css .charts 的 width
    const cWidth = 750 / 750 * wx.getSystemInfoSync().windowWidth;
    //这里的 500 对应 css .charts 的 height
    const cHeight = 500 / 750 * wx.getSystemInfoSync().windowWidth;
    const pixelRatio = wx.getSystemInfoSync().pixelRatio;
    this.setData({ cWidth, cHeight, pixelRatio });
    this.getServerData();
    this.getPhoto();
  },
    getPhoto(){  
      var that = this
        wx.request({
                url: "http://hejiale.club:5000/user/photos", //获取图片的URL
                method:"post",
            responseType: 'arraybuffer',    //ArrayBuffer涉及面比较广，我的理解是ArrayBuffer代表内存之中的一段二进制数据，一旦生成不能再改。可以通过视图（TypedArray和DataView）进行操作。
            success (res) {
            let url ='data:image/png;base64,'+wx.arrayBufferToBase64(res.data)
            that.setData({
                codeUrl : url,     //设置data里面的图片url
                show:true
            })
        },
        fail(res){
            Toast.clear();
        }
    })
    },
  getServerData() {
      let res = app.globalData.chart_data;
      this.drawCharts('afMCYQMEmXXVAjNQFJvvfxbLSHuxNEOL', res);
  },
  drawCharts(id,data){
    const query = wx.createSelectorQuery().in(this);
    query.select('#' + id).fields({ node: true, size: true }).exec(res => {
      if (res[0]) {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        canvas.width = res[0].width * this.data.pixelRatio;
        canvas.height = res[0].height * this.data.pixelRatio;
        uChartsInstance[id]=new uCharts({
            fontSize: 13,
            rotate: false,
            animation: true,
            timing: "easeOut",
            background: "#FFFFFF",
            canvas2d: false,
            duration: 1000,
            categories: data.categories,
            color: ["#1890FF","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
            enableScroll: false,
            touchMoveLimit: 60,
            enableMarkLine: false,
            dataLabel: true,
            dataPointShape: true,
            dataPointShapeType: "solid",
            tapLegend: true,
            context: ctx,
            extra: {
              column: {
                type: "group",
                width: 30,
                activeBgColor: "#000000",
                activeBgOpacity: 0.08
              }
            },
            height: this.data.cHeight * this.data.pixelRatio,
            legend: {},
            padding: [15,15,0,5],
            pixelRatio: this.data.pixelRatio,
            series: data.series,
            type: "line",
            width: this.data.cWidth * this.data.pixelRatio,
            xAxis: {
                disabled: false,
                axisLine: true,
                axisLineColor: "#CCCCCC",
                calibration: false,
                fontColor: "#666666",
                fontSize: 13,
                rotateLabel: false,
                itemCount: 5,
                boundaryGap: "center",
                disableGrid: true,
                gridColor: "#CCCCCC",
                gridType: "solid",
                dashLength: 4,
                gridEval: 1,
                scrollShow: false,
                scrollAlign: "left",
                scrollColor: "#A6A6A6",
                scrollBackgroundColor: "#EFEBEF",
                format: ""
            },
            yAxis: {
                disabled: false,
                disableGrid: false,
                splitNumber: 5,
                gridType: "dash",
                dashLength: 2,
                gridColor: "#CCCCCC",
                padding: 10,
                showTitle: false,
              data: [
                {
                  min: 0
                }
              ]
            }
          });
      }else{
        console.error("[uCharts]: 未获取到 context");
      }
    });
  },
  tap(e){
    uChartsInstance[e.target.id].touchLegend(e);
    uChartsInstance[e.target.id].showToolTip(e);
  }
})