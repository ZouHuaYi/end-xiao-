const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
		scrollStatus:false,
		members:-1,
		detailData:{},
		chargeStatus:-1,
		commentList:[]
  },
	// 获取视频详细页的数据
	getDetailData:function(opt){
		if(this.data.members==0){
			// 没有选集
			const {id,token} = app.globalData.myUserInfo;
			app.postRequest('/rest/train/detail',{
				id:opt.id,
				userId:id,
				token:token				
			},res=>{
					if(res.messageCode==900){
						const chargeStatus = res.data.priceTag=='免费'||res.data.price==0||res.data.price==0.0?0:1;
						this.setData({
							detailData:res.data,
							chargeStatus:chargeStatus
						})
						this.getCommnetData(id,opt.id);
					}else{
						wx.showToast({
							title: res.message,
							icon: 'none',
							duration: 2000
						})
					}
			})
			
		}else if(opt.members==1){
			// 有选集
			
		}
	},
	// 购买视频的函数
	pay:function(e){
		const {id} = e.currentTarget.dataset;
		app.postRequest('/rest/train/buy',{
			userId:app.globalData.myUserInfo.id,
			trainId:id,
			payType:6,
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
											this.setData({
												chargeStatus:0
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
  // 获取评论
	getCommnetData:function(userId,postId){
		app.postRequest('/rest/comment/list',{
			page:1,
			rows:100,
			userId:userId,
			postId:postId,
			type:12,
		},res=>{
				console.log(res)
				if(res.messageCode==900){
					this.setData({
						commentList:res.data
					})
				}
		})
	},
	// 滚动事件
  scrollVideo:function(e){
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
			barHeight:app.globalData.statusBarHeight,
			members:options.members?options.members:0
		});
		if(app.loginTest()) return;
		if(app.globalData.myUserInfo){
			this.getDetailData(options);
		}else{
			app.userInfoReadyCallback = info => {		
				this.getDetailData(options);
			}
		}
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})