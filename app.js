import wxValidate from 'utils/wxValidate';
import {postRequest,getRequest} from './utils/ajax.js'; 

App({
	//优雅的表单验证
	wxValidate: (rules, messages) => new wxValidate(rules, messages),
    onLaunch: function (e) {
    // 登录
	console.log('hello this is first step');
	// 登陆路径的白名单
	const PRIVATE_URL = ["index","login","register"];
	this.globalData.navigateBackUrl = PRIVATE_URL.indexOf(e.path.split('/')[1]) == -1 ? '/'+e.path : '/pages/toPromote/toPromote';
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 如果已经授权直接登陆
				wx.showLoading({
					title:"正在加载",
					mask:true
				})
				this.loginFun(res,(data)=>{
					wx.hideLoading();
					if(data.messageCode==900){
							this.globalData.myUserInfo = data.data.user;
							this.globalData.openId = data.data.openid;
						if (this.userInfoReadyCallback) {
							 this.userInfoReadyCallback(data.data.user)
						}
					}else if(data.messageCode==132){
						// app没有绑定微信小程序的时候
						this.globalData.unionId = data.data.unionid;
						this.globalData.openId = data.data.openid;
						wx.reLaunch({
							url:'/pages/login/login'
						})
					} else {
						// 没有授权的情况下
						if(e.path!="pages/index/index"){
								wx.reLaunch({
								url:'/pages/index/index'
							}) 
						}
					}
				})
            },
			fail:err=>{
				if(e.path!="pages/index/index"){
						wx.reLaunch({
						url:'/pages/index/index'
					})
				}
			}
          })
        }else{
			// 在没有授权的情况下 主动跳转到 index页
			if(e.path!="pages/index/index"){
					wx.navigateTo({
					url:'/pages/index/index'
				})
			}
		}
      }
    })
  },
  postRequest:postRequest,
	getRequest:getRequest,
	// 小程序授权登陆
	loginFun:function(val,callback){
		let formData = {};
		formData['encryptedData'] = val.encryptedData;
		formData['iv'] = val.iv;
		wx.login({
			success:res=> {
				if(res.code){
					formData['code'] = res.code;
					this.postRequest('/rest/user/getAppletUnionId',formData,res=>{
						callback&&callback(res);
					})
				}
			},
			fail:function(err){
				wx.showToast({
					title: '通讯失败',
					icon: 'none',
					duration: 2000
				})
			}
		})
	},
	globalData: {
		root_url:'https://test.topmei3mei.com',
		userInfo: null,
		unionId:null,
		openId:null,
		token:null,
		navigateBackUrl:null,
		myUserInfo:null,
		shopList:null,
		areaSelect:null,
		orderPlace:null,
		recommended:null
    }
})