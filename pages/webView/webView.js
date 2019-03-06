// pages/webView/webView.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
	url:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	if(options.url){
		this.setData({
			url:decodeURIComponent(options.url)
		})
	}
	
  },
	onShareAppMessage:function(){
		const share = app.allShareData();
		return share;
	}
})