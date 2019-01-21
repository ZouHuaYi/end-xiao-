const app = getApp();

Page({
   /**
    * 页面的初始数据
   */
    data: {
		shopDetail:{},
		orderPlace:null,
		agreeStatus:false
    },
	// 选择同意协议
   selectAgree:function(){
	let agreeStatus = this.data.agreeStatus;
	this.setData({
		agreeStatus:!agreeStatus
	})
   },
   // 跳转到协议的位置
   goToWebVip:function(){
	   let root_url = app.globalData.root_url+'/agree/agree.html';
	   wx.navigateTo({
			url:'/pages/webView/webView?url='+encodeURIComponent(root_url)
	   })
   },
  // 支付金额 
  payMonney:function(){
	  if(!this.data.agreeStatus && this.data.visible){
		wx.showToast({
			title: '请先同意美上美套餐协议',
			icon: 'none',
			duration: 2000
		}) 
		return;
	  }
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
						  setTimeout(()=>{
							  wx.reLaunch({
								url:"/pages/toPromote/toPromote"
							  }) 
						  },2000)
						  /*
						  wx.reLaunch({
						  	url:`/pages/promteCode/promteCode?pId=${this.options.userId}&hospitalId=${this.options.hospitalid}&myApp=myApp`
						  })
						  */
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
		
		this.setData({
			visible:options.visible==1?true:false
		})
		
  }
})