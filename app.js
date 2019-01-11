import wxValidate from 'utils/wxValidate';

App({
	//优雅的表单验证
	wxValidate: (rules, messages) => new wxValidate(rules, messages),
    onLaunch: function (e) {
	// 登陆路径的白名单
		let query = "";
		for(let key in e.query){
			query += key+'='+e.query[key]+'&'	
		}
		const PRIVATE_URL = ["index","enLogin"];

		this.globalData.navigateBackUrl = PRIVATE_URL.indexOf(e.path.split('/')[1]) == -1 ? '/'+e.path+'?'+ query : '/pages/toPromote/toPromote';
	
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
								this.globalData.tokenStatus = false;
							if (this.userInfoReadyCallback) {
								 this.userInfoReadyCallback(data.data.user)
							}
						}else if(data.messageCode==132){
							// app没有绑定微信小程序的时候
							this.globalData.tokenStatus = true;
							this.globalData.unionId = data.data.unionid;
							this.globalData.openId = data.data.openid;

							wx.reLaunch({
								url:'/pages/enLogin/enLogin'
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
	postRequest:function(url,data,callback){
		let datas = data;
		if(datas && Object.keys(datas).length>0){
			let keys =  Object.keys(datas);
			datas = encodeURI(keys.map(name => `${name}=${datas[name]}`).join("&"));
		}else{
			datas = {}
		}
		wx.request({
			url:this.globalData.root_url+url,
			data:datas,
			method:"POST",
			header:{
				"content-type":"application/x-www-form-urlencoded"
			},
			dataType:"JSON",
			success:res=>{
				try{
					let dat = JSON.parse(res.data);
					if(dat.messageCode==904 || dat.messageCode==906 || dat.messageCode==903){
						wx.getSetting({
						  success: res => {
							if (res.authSetting['scope.userInfo']) {
							  // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
							  wx.getUserInfo({
								success: resd => {
								  // 可以将 res 发送给后台解码出 unionId
								  this.globalData.userInfo = resd.userInfo
								  // 如果已经授权直接登陆
									this.loginFun(resd,(dt)=>{
										wx.hideLoading();
										if(dt.messageCode==900){
											this.globalData.myUserInfo = dt.data.user;
											this.globalData.openId = dt.data.openid;
											data.token = dt.data.user.token;
											if(data.openid){
												data.openid = dt.data.openid;
											}
										    this.postRequest(url,data,callback);
										}
									})
								 }
							  })
							}
						  }
						})
					}else{
						callback&&callback(dat);
					}
				}catch(e){
					wx.hideLoading();
				}
			},
			fail:error=>{
				wx.hideLoading()
				wx.showToast({
				  title: '网络开小差啦!!!',
				  icon: 'none',
				  duration: 2000
				})
			}
		})
	},
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
	// 登录限制
	loginTest:function(){
		if(this.globalData.tokenStatus){
			wx.reLaunch({
				url:'/pages/enLogin/enLogin'
			})
			return true;
		}	
		return false;
	},
	globalData: {
		root_url:'https://test.topmei3mei.com',
		userInfo: null,
		unionId:null,
		openId:null,
		loginStatus:0,
		tokenStatus:false,
		navigateBackUrl:null,
		myUserInfo:null,
		shopList:null,
		areaSelect:null,
		orderPlace:null,
		recommended:null
    }
})