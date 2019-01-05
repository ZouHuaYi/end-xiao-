var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
	debugShare:false,
	data: {
		statusNowTime:0, // 0 正在加载的时候 1 点击加入 2 我的二维码页  4 登录验证
	},
	// 电话格式化
	formatPhone(phone) {
      return phone.substr(0, 3) + "****" + phone.substr(7);
    },
	// 获取小程序二维码
	getQrCodeData:function(pId,hospitalId){
		this.setData({
			statusNowTime:2
		})
		app.postRequest('/rest/user/getAppletCodeUrl',{pId:pId,hospitalId:'',page:'/pages/promteCode/promteCode'},data=>{
			if(data.messageCode==900){
				this.setData({
					codeUrl:data.data.codeUrl
				})
			}
		})
	},
	// 获取医院的hospital 
	getHospitalData:function(pId,hospitalId){
		wx.showLoading({
			title:"正在加载"
		})
		app.postRequest('/rest/team/getpUserAndHospital',{pId:pId,hospitalId:hospitalId},data=>{
			wx.hideLoading();
			if(data.messageCode==900){
				this.setData({
					hospital_logo:data.data.hospital_logo,
					hospital_name:data.data.hospital_name
				})
			}else{
				wx.showToast({
					title:'无法获取医院信息',
					icon:'none',
					duration:3000
				})
				setTimeout(()=>{
					wx.navigateBack();
				},3000)
			}
		})
	},
	// 判断怎么走下一步
	judgeScan:function(options){
		wx.showLoading({
			title:"正在加载"
		})
		app.postRequest('/rest/team/getpUserAndHospital',{pId:options.pId,hospitalId:options.hospitalId},data=>{
			wx.hideLoading();
			if(data.messageCode==900){
				this.setData({
					hospital_logo:data.data.hospital_logo,
					hospital_name:data.data.hospital_name,
					nickname:data.data.p_name,
					avatar:data.data.p_avatar?data.data.p_avatar:'../../assets/default.png'
				})
				app.postRequest("/rest/user/getUser",{
						token:app.globalData.myUserInfo.token,
						hospitalId:options.hospitalId
					},data=>{
						if(data.messageCode==900 || data.messageCode==1402){
							 // 判断是否在团队中的时候
							if (data.data.isAllow == 1) {
								 // 判断是否购买套餐
								if(data.data.packageType != 0){
									wx.showModal({
									  title: '温馨提示',
									  content: '您已在该团队中,点确认将跳转到首页',
									  success(res) {
										if (res.confirm) {
											wx.reLaunch({
												url:'/pages/toPromote/toPromote'
											})
										} else if (res.cancel) {}
									  }
									})
								}else{
									wx.showModal({
									  title: '温馨提示',
									  content: '您已在该团队中,点确认将跳转到套餐购买页',
									  success(res) {
										if (res.confirm) {
											wx.reLaunch({
												url:'/pages/shopList/shopList'
											})
										} else if (res.cancel) {}
									  }
									})
								}
							}else{
								// 不在团队中的时候
								// 判断 pId 是否跟 userId 相等
								if(options.pId==data.data.userId){
									this.getQrCodeData(data.data.userId,options.hospitalId);
								}else{
									let vphone = this.formatPhone(data.data.phone)
									this.setData({
										statusNowTime:1,
										vphone:vphone
									})
								}
							}
						}else{
							wx.showToast({
								title:data.message?data.message:'无法获取医院信息',
								icon:'none',
								duration:3000
							})
						}
				})
			}else{
				wx.showToast({
					title:'无法获取医院信息',
					icon:'none',
					duration:3000
				})
				setTimeout(()=>{
					wx.navigateBack();
				},3000)
			}
		})
	},
   /**
   * 生命周期函数--监听页面加载
   */
    onLoad: function (options) {

		if(options.myApp=='myApp'){
			let {avatar,nickname,id} = app.globalData.myUserInfo;
			wx.setNavigationBarTitle({
				title:"推广二维码",
			})
			this.setData({
				nickname:nickname,
				statusNowTime:2,
				avatar:avatar?avatar:'../../assets/default.png'
			})
			this.id = id;
			this.hospitalId = options.hospitalId;
			let hospitalId = this.debugShare?'':options.hospitalId;
			this.getHospitalData(id,hospitalId);   // options.hospitalId
			this.getQrCodeData(id,hospitalId);     // options.hospitalId
		}
		if(options.share=='share'){
			if(app.globalData.myUserInfo){
				this.judgeScan(options);
			}else{
				app.userInfoReadyCallback = res =>{
					// 有了登录权限的时候要走的方法
					this.judgeScan(options);
				}
			}
		}
   },
   /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
	 let hospitalId = this.debugShare?'':this.hospitalId;// this.hospitalId;
	 let path = `/pages/promteCode/promteCode?share=share&pId=${this.id}&hospitalId=${hospitalId}`;
	 return {
	  title: this.data.nickname + '向你推荐'+this.data.hospital_name,
	  imageUrl:this.data.hospital_logo,
	  path: path,
	  success: function (res) {
	    // 转发成功  
		app.globalData.navigateBackUrl = path;
	  },
	  fail: function (res) {
	    // 转发失败
	  }
	}
  }
})