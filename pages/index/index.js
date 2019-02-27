const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
	bannerList:[],
	indicatorDots: true,
    autoplay: true,
    interval: 4000,
    duration: 500
  },
  // 接触开始
  touchMove:function(e){
	let index = e.currentTarget.dataset.index;
	let len = this.data.bannerList.length-1;
	let endX = e.changedTouches[0].clientX;
	if(index===len){
		if(this.startX-endX>30){
			clearInterval(this.timePage);
			this.goToIndex();
		}
	}
  },
  // 去到主页
  goToIndex:function(){
	  if(app.globalData.navigateBackUrl){
			wx.reLaunch({
				url:app.globalData.navigateBackUrl
			})
			app.globalData.navigateBackUrl = null;
		}else{
			wx.reLaunch({
				url:'/pages/pageIndex/pageIndex'
			})
		}
  },
  // 接触移动
  touchStart:function(e){
	this.startX = e.changedTouches[0].clientX;
  },
  // 改变点数
  changeBanner:function(e){
	  let index = e.detail.current;
	  let len = this.data.bannerList.length-1;
	  if(index===len){
		  this.goToSharePages();
	  }else{
		  clearInterval(this.timePage);
	  }
  },
  // 页面跳转
  goToSharePages:function(){
	clearInterval(this.timePage);
	if(!this.powerStatus) return;
	this.timePage = setTimeout(()=>{
		this.goToIndex();
	},3000)
  },
  onHide:function(){
	  clearInterval(this.timePage);
  },
  onLoad:function  () {
	  this.setData({
		  barHeight:app.globalData.statusBarHeight+1
	  })
	  app.postRequest('/rest/banner/list',{
		  position:6
	  },data=>{
		   if(data.messageCode==900){
			   if(data.data && data.data.length>0){
				    this.setData({
						bannerList:data.data.map((el,key)=>{
							return el.banner
						})
					}) 
			   }
		   }
	  })
	  if(app.globalData.myUserInfo){
			this.powerStatus = true;
	  }else{
		app.userInfoReadyCallback = res =>{
			this.powerStatus = true;
		}	
	  }
    },
	// 小程序没有授权允许的情况下
    getUserInfo: function(e) {
		clearInterval(this.timePage);
		if(this.powerStatus){
			wx.reLaunch({
				url:'/pages/pageIndex/pageIndex'
			})
			return;
		}
		if(e.detail.errMsg=='getUserInfo:ok'){
			app.loginFun(e.detail,(data)=>{
				if(data.messageCode==900){
					app.globalData.openId = data.data.openid;
					app.globalData.myUserInfo = data.data.user;
					app.globalData.tokenStatus = false;
					this.goToIndex();
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
