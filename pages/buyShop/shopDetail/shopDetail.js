const  app = getApp();

Page({
    /**
    * 页面的初始数据
    */
    data: {
		niceGlod:false,
		shopDetail:{},
		grade:['无','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
    },
	//去购买详情页 
	gotoBuy:function(){
		app.globalData.shopList = this.data.shopDetail;
		wx.navigateTo({
			url:"../shopPay/shopPay?visible=" + this.options.visible
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
		
		wx.showLoading({
			title:"正在加载",
			mask:true
		})
		app.globalData.navigateBackUrl = null;
		app.postRequest('/rest/distribution/packageAndHospital',{
			packageId:options.id,
			token:app.globalData.myUserInfo.token
		},data=>{
			wx.hideLoading();
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
		this.setData({
			isHome:options.share?true:false,
			barHeight:app.globalData.statusBarHeight
		})
		if(app.loginTest()) return;
		if(options.id){
			if(app.globalData.myUserInfo){
				this.getDetailData(options);
			}else{
				app.userInfoReadyCallback = res =>{
				 this.getDetailData(options);
				}
			}
			this.options = options;
		}else{
			wx.showToast({
				title: '医院id不能为空',
				icon: 'none',
				duration: 2000
			})
		}
  },
    /**
    * 用户点击右上角分享
    */
    onShareAppMessage: function () {
	let {v_hospital,v_package} = this.data.shopDetail;
	return{
		title: v_hospital.name,
		path: `pages/buyShop/shopDetail/shopDetail?id=${v_package.id}&share=true`,
		success: function (res) {
			
		},
		fail: function (res) {
		  // 转发失败
		}
	}
  }
})