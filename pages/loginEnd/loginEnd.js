var app = getApp();

Page({

	  /**
	   * 页面的初始数据
	   */
    data: {
		animationPhone:{},
		animationPass:{},
		phoneType:false,
		passwType:false,
		phone:'',
		passw:''
    },
	// 登录 接口
	loginHandler:function(){
		wx.showLoading({
			title:'正在登陆',
			mask:true
		})
		let {phone,passw} = this.data;
		app.postRequest('/rest/user/login',{
			phone:phone,
			password:passw
		},data=>{
			wx.hideLoading();
			if(data.messageCode==900){
				app.globalData.myUserInfo = data.data;
				app.globalData.tokenStatus = false;
				
				if(app.globalData.navigateBackUrl){
					wx.reLaunch({
						url:app.globalData.navigateBackUrl
					})
					app.globalData.navigateBackUrl = null;
				}else{
					wx.reLaunch({
						url:"/pages/toPromote/toPromote"
					})
				}
				app.postRequest('/rest/user/open_bind_unbundled',{
					wechat:app.globalData.unionId,
					unionId:app.globalData.unionId,
					id:data.data.id,
					action:0
				},resd=>{
					if(resd.messageCode==900){
						console.log('静默式绑定成功');
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
	// 绑定手机 验证吗 密码
	bindAllInput:function(e){
		let status = e.currentTarget.dataset.status
		this.setData({
			[status]:e.detail.value
		})
	},
	// 点击电话的时候
	phoneClick:function(){
		let that = this;
		that.animation.scale(0.8,0.8).translate(0,-40).step();
		this.setData({
			phoneType:true,
			animationPhone:that.animation.export()
		})
	},
	// 点击密码部分
	passwClick:function(){
		let that = this;
		that.animation.scale(0.8,0.8).translate(0,-40).step();
		this.setData({
			passwType:true,
			animationPass:that.animation.export()
		})
	},
	// 密码失去焦点
	passwBlur:function(e){
		this.setData({
			passwType:false
		})
		if(e.type=='blur' && e.detail.value) return;
		let that = this;
		that.animation.scale(1,1).translate(0,0).step();
		this.setData({
			animationPass:that.animation.export()
		})
	},
	// 电话失去焦点
	phoneBlur:function(e){
		this.setData({
			phoneType:false
		})
		if(e.type=='blur' && e.detail.value) return;
		let that = this;
		that.animation.scale(1,1).translate(0,0).step();
		this.setData({
			animationPhone:that.animation.export()
		})
	},
	  /**
	   * 生命周期函数--监听页面加载
	   */
	onLoad: function (options) {
		
	},
	  /**
	   * 生命周期函数--监听页面显示
	   */
	onShow: function () {
			 this.animation = wx.createAnimation({
		  duration: 200,
				transformOrigin:'0% 50% 0',
		  timingFunction: 'ease',
		})
	}
})