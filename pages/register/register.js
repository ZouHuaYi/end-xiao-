import {postRequest} from '../../utils/ajax.js'; 

Page({

    /**
     * 页面的初始数据
    */
    data: {
		animationPhone:{},
		animationPass:{},
		phoneType:false,
		passwType:false,
		statusType:false,
		nextType:false,
		forgetType:0,
		verfiyCode:'获取验证码',
		phone:'',
		vcode:'',
		passw:'',
		repassw:''
    },
	// 提交注册
	formSubmile:function(){
		let {passw,repassw,forgetType,phone,vcode} = this.data;
		if(!passw){
			wx.showToast({
				title: '密码不能为空',
				icon: 'none',
				duration: 2000
			})
			return;
		}
		if(passw.length<6){
			wx.showToast({
				title: '密码设置过短',
				icon: 'none',
				duration: 2000
			})
			return;
		}
		if(passw!==repassw){
			wx.showToast({
				title: '两次设置的密码不相同',
				icon: 'none',
				duration: 2000
			})
			return;
		}
		if(forgetType==0){
			postRequest('/rest/user/register',{
				phone:phone,
				password:passw,
				code:vcode
			},(data)=>{
				if(data.messageCode==900 || data.messageCode==103){
					wx.showToast({
						title: '注册成功',
						icon: 'success',
						duration: 2000
					})
					// 自动登陆
					
				}else{
					wx.showToast({
						title: data.message,
						icon: 'none',
						duration: 2000
					})
				}
			})
		}else if(forgetType==1){
			postRequest('/rest/user/forgot_password',{
				phone:phone,
				password:passw,
				code:vcode
			},data=>{
				if(data.messageCode==900){
					wx.showToast({
						title: '修改成功',
						icon: 'success',
						duration: 2000
					})
					wx.reLaunch({
						url:'../login/login'
					})
				}else{
					wx.showToast({
						title: data.message,
						icon: 'none',
						duration: 2000
					})
				}
			})
		}
		
	},
	// 下一步操作
	nextStep:function(){
		let {phone,vcode,forgetType} = this.data;
		if(!/^1\d{10}$/.test(phone)){
			wx.showToast({
				title: '请输入正确的手机号码',
				icon: 'none',
				duration: 2000
			})
			return;
		}
		if(!vcode){
			wx.showToast({
				title: '验证码不能为空',
				icon: 'none',
				duration: 2000
			})
			return;
		}
		let type = forgetType==1?'&type=forget':'';
		wx.navigateTo({
			url:`./register?phone=${phone}&vcode=${vcode}&next=next${type}`
		})
	},
	// 绑定手机 验证吗 密码
	bindAllInput:function(e){
		let status = e.currentTarget.dataset.status
		this.setData({
			[status]:e.detail.value
		})
	},
	// 发送手机验证码
	getVcode:function(){
		let {phone,forgetType} = this.data;
		if(!/^1\d{10}$/.test(phone)){
			wx.showToast({
				title: '请输入正确的手机号码',
				icon: 'none',
				duration: 2000
			})
			return;
		}
		if(this.clickStatus) return;
		this.clickStatus = true;
		postRequest('/rest/user/send_code',{type:forgetType,phone:phone},(data)=>{
			if(data.messageCode==900){
				wx.showToast({
					title: '发送成功',
					icon: 'success',
					duration: 2000
				})
				let tim = 60;
				let timStatus = setInterval(()=>{
					tim -= 1;
					this.setData({
						verfiyCode:`${tim}后重试`
					})
					if(tim<=0){
						clearInterval(timStatus);
						this.clickStatus = false;
						this.setData({
							verfiyCode:'获取验证码'
						})
					}
				},1000)	
			}else{
				this.clickStatus = false;
				wx.showToast({
					title: data.message,
					icon: 'none',
					duration: 2000
				})
			}
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
		if(options.type=='forget'){
			// 忘记密码
			this.setData({
				forgetType:1
			})
			wx.setNavigationBarTitle({
				title:'忘记密码'
			})
		}else{
			// 正常注册
			this.setData({
				forgetType:0 
			})
			wx.setNavigationBarTitle({
				title:'注册账号'
			})
		}
		
		if(options.next=='next'){
			// 下一页
			this.setData({
				statusType:true,
				nextType:true,
				phone:options.phone,
				vcode:options.vcode
			})
		}else{
			// 新的页
			this.setData({
				statusType:true
			})
		}
		
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
			
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
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})