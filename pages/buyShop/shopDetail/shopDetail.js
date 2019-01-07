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
	// 获取详细数据的
	getDetailData:function(options){
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
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		if(options.id){
			if(app.globalData.myUserInfo){
				this.getDetailData(options);
			}else{
				app.userInfoReadyCallback = res =>{
				 this.getDetailData(options);
				}
			}
		}
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
	let {v_hospital,v_package} = this.data.shopDetail;
	return{
		title: v_hospital.name,
		path: 'pages/buyShop/shopDetail/shopDetail?id='+ v_package.id,
		success: function (res) {
			
		},
		fail: function (res) {
		  // 转发失败
		}
	}
  }
})