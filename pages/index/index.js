const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function (options) {
	app.userInfoReadyCallback = res =>{
		if(app.globalData.navigateBackUrl){
			wx.reLaunch({
				url:app.globalData.navigateBackUrl
			})
		}else{
			wx.reLaunch({
				url:'/pages/toPromote/toPromote'
			})
		}
	}	
  },
	// 小程序没有授权允许的情况下
  getUserInfo: function(e) {
		if(e.detail.errMsg=='getUserInfo:ok'){
			app.loginFun(e.detail,(data)=>{
				if(data.messageCode==900){
					app.globalData.openId = data.data.openid;
					app.globalData.myUserInfo = data.data.user;
					console.log(app.globalData.navigateBackUrl);
					if(app.globalData.navigateBackUrl){
						wx.reLaunch({
							url:app.globalData.navigateBackUrl
						})
					}else{
						wx.reLaunch({
							url:'/pages/toPromote/toPromote'
						})
					}
				}else if(data.messageCode==132){
					// app没有绑定微信小程序的时候
					this.globalData.unionId = data.data.unionid;
					app.globalData.openId = data.data.openid;
					wx.reLaunch({
						url:'/pages/login/login'
					})
					
				}
			})
		}
  }
})
