var app = getApp();

Page({

	  /**
	   * 页面的初始数据
	   */
    data: {
		phone:'',
		vcode:'',
		vcodeText:'发送验证码',
		clickStatus:true
    },
	// 跳转到用户协议上
	goToVip:function(){
		let url = app.globalData.root_url+'/wxchat/agreement.html'
		wx.navigateTo({
			url:  '/pages/webView/webView?url='+encodeURIComponent(url)
		})
	},
	// 登录 接口
	loginHandler:function(){
		let {vcode,phone} = this.data;
		if(!vcode){
			wx.showToast({
				title: '请输入验证码',
				icon: 'none',
				duration: 2000
			})
			return
		}   
		app.postRequest("/rest/user/login_by_code",{
			phone: phone,
			code: vcode
		},data=>{
			if(data.messageCode==129){
				app.globalData.myUserInfo = data.data;
				wx.navigateTo({
					url:"/pages/loginEnd/passw/passw?phone="+phone+"&id="+data.data.id
				})	
			}else if(data.messageCode==900){
				app.globalData.myUserInfo = data.data;
				app.globalData.tokenStatus = false;
				
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
				
				if(app.globalData.navigateBackUrl){
					wx.reLaunch({
						url:app.globalData.navigateBackUrl
					})
					app.globalData.navigateBackUrl = null;
				}else{
					wx.reLaunch({
						url:"/pages/pageIndex/pageIndex"
					})
				}
				
				
				
			}else{
				wx.showToast({
					title: data.message?data.message:'该手机号无法识别',
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
	// 点击验证码
	codeClick:function(){
		let phone = this.data.phone;
		if(!phone){
			wx.showToast({
				title: '手机号码不能为空',
				icon: 'none',
				duration: 2000
			})
			return
		}
		if(!/^1\d{10}$/.test(phone)){
			wx.showToast({
				title: '手机号码格式不正确',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		if(!this.data.clickStatus) return;
		this.setData({
			clickStatus:false
		})
		wx.showLoading({
			title:'正在发送',
			mask:true
		})
		app.postRequest("/rest/user/send_code",{
			phone: phone,
			type: 5
		},data=>{
			wx.hideLoading();
			clearInterval(this.timStatus);
			if(data.messageCode==900){
				let tim = 60;
				this.timStatus = setInterval(()=>{
					tim -= 1;
					this.setData({
						vcodeText:`已发送(${tim}s)`
					})
					if(tim<=0){
						clearInterval(this.timStatus);
						this.setData({
							vcodeText:'重新获取',
							clickStatus:true
						})
					}
				},1000)	  
			}else{
				this.setData({
					clickStatus:true
				})
				wx.showToast({
					title: data.message?data.message:'发送失败',
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
		
	}
})