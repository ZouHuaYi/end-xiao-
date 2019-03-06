const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
	scrollStatus:false
  },
  // 滚动事件
  scrollVideo:function(e){
	  console.log(e)
	  const top = e.detail.scrollTop;
	  if(top<=60){
		  this.setData({
			scrollStatus:false
		  })
	  }else{
		  this.setData({
		  	scrollStatus:true
		  })
	  }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	this.setData({
		showBack:true,
		barTitle:'视频详情',
		barHeight:app.globalData.statusBarHeight
	});
	
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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