const  app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
		niceGlod:false,
		shopDetail:{},
		grade:['无','A','B','C','D','E','F','G','H','I','K','L','M','N']
  },
	//去购买详情页 
	gotoBuy:function(){
		app.globalData.shopList = this.data.shopDetail;
		wx.navigateTo({
			url:"../shopPay/shopPay"
		})
	},
	// 显示美丽金额
	niceGlodShow:function(){
		let niceGlod = this.data.niceGlod;
		this.setData({
			niceGlod:!niceGlod
		})
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		if(options.id){
			app.postRequest('/rest/distribution/packageAndHospital',{
				packageId:options.id,
				token:app.globalData.myUserInfo.token
			},data=>{
				if(data.messageCode==900){
					this.setData({
						shopDetail:data.data
					})
				}else{
					wx.showToast({
						title: data.message,
						icon: 'none',
						duration: 2000
					})
				}
			})
		}
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})