const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  // 页面跳转
  goToSharePages:function(){
	setTimeout(()=>{
		if(app.globalData.navigateBackUrl){
			wx.reLaunch({
				url:app.globalData.navigateBackUrl
			})
			app.globalData.navigateBackUrl = null;
		}else{
			wx.reLaunch({
				url:'/pages/toPromote/toPromote'
			})
		}
	},2000)
  },
  onLoad: function (options) {
	  if(app.globalData.myUserInfo){
		  this.goToSharePages()
	  }else{
		app.userInfoReadyCallback = res =>{
			this.goToSharePages()
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
					app.globalData.tokenStatus = false;
					
					if(app.globalData.navigateBackUrl){
						wx.reLaunch({
							url:app.globalData.navigateBackUrl
						})
						app.globalData.navigateBackUrl = null;
					}else{
						wx.reLaunch({
							url:'/pages/toPromote/toPromote'
						})
					}
					
				}else if(data.messageCode==132){
					// app没有绑定微信小程序的时候
					app.globalData.tokenStatus = true;
					wx.reLaunch({
						url:'/pages/loginEnd/loginEnd',
						success:(res)=>{
							app.globalData.unionId = data.data.unionid;
							app.globalData.openId = data.data.openid;
						}
					})
				}
			})
		}
    }
})
