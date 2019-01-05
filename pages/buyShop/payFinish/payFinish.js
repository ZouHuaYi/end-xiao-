const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
		shopDetail:{},
		orderPlace:null
  },
  // 支付金额 
  payMonney:function(){
	  app.postRequest('/rest/order/buy',{
		  token:app.globalData.myUserInfo.token,
		  subject:"医院套餐购买",
		  body:"医院套餐购买",
		  orderNumber:this.data.orderPlace.orderNumber,
		  payType:0,
		  wechatType:1,
		  openid:app.globalData.openId
	  },data=>{
		  if(data.messageCode==900){
			  console.log(data.data,'pay')
			  let {timestamp,total_fee,noncestr,partnerid,prepayid,sign} = data.data;
			    wx.requestPayment({
					  timeStamp: String(timestamp),
					  nonceStr: noncestr,
					  package: `prepay_id=${prepayid}`,
					  signType: 'MD5',
					  paySign: sign,
					  total_fee:total_fee,
					success:res=> { 
						  wx.showToast({
						  	title: '支付成功',
						  	icon: 'none',
						  	duration: 2000
						  }) 
						  wx.navigateTo({
						  	url:`/pages/promteCode/promteCode?pId=${this.options.userId}&hospitalId=${this.options.hospitalid}&myApp=myApp`
						  })
						  
					  },
					 fail:res=> {
						   wx.showToast({
						  	title: '支付失败',
						  	icon: 'none',
						  	duration: 2000
						  }) 
					}
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
	  if(options.userId){
		  this.options = options;
	  }
	if(app.globalData.orderPlace){
		this.setData({
			orderPlace:app.globalData.orderPlace,
			shopDetail:app.globalData.shopList,
			recommended:app.globalData.recommended
		})
		app.globalData.recommended = null;
		app.globalData.orderPlace = null;
	}
  }
})