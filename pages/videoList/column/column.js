const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	this.setData({
		showBack:true,
		barTitle:'专栏',
		barHeight:app.globalData.statusBarHeight
	});
  }
})