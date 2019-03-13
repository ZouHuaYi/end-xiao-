var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
	data: {
		statusNowTime:0, // 0 正在加载的时候 1 点击加入 2 我的二维码页  4 登录验证
		alertText:'3秒后回到推广中心'
	},
	// 图片预览
	preImgFun:function(e){
		let img = e.currentTarget.dataset.img;
		wx.previewImage({
		  current: img,  // 当前显示图片的http链接
		  urls: [img]      // 需要预览的图片http链接列表
		})
	},
	// 绑定我们
	bindMyTeam:function(){
		if(this.shareOptions.pId){
			let {pId,hospitalId} = this.shareOptions;
			app.postRequest('/rest/team/bind/token',{
				pPhone:'',
				pId:pId,
				token:app.globalData.myUserInfo.token,
				hospitalId:hospitalId?hospitalId:''
			},data=>{
				if(data.messageCode==900){
					this.setData({
						statusNowTime:3
					})
				    let numtime = 3;
				    let timp = null;
				    clearInterval(timp);
				    timp = setInterval(() => {
					numtime -= 1;
					this.setData({
						alertText:`${numtime}秒后回到推广中心`
					})
					if (numtime <= 0) {
					  clearInterval(timp);
					  wx.reLaunch({
						url:'/pages/toPromote/toPromote'
					  })
					}
				    }, 1000);
				}else if(data.messageCode==1409){
					this.judgeScan(this.shareOptions);
				}else if(data.messageCode==1402){
					wx.showToast({
						title:'上级没有权限分享',
						icon:'none',
						duration:2000
					})
				}else{
					wx.showToast({
						title:data.message?data.message:'上下级绑定失败',
						icon:'none',
						duration:2000
					})
				}
			})
		}else{
			wx.showToast({
				title:'小程序分享出问题了，请跟技术联系',
				icon:'none',
				duration:3000
			})
		}
		
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
		app.postRequest('/rest/user/getAppletCodeUrl',{pId:pId,hospitalId:hospitalId?hospitalId:'',page:'pages/promteCode/promteCode'},data=>{
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
		app.globalData.navigateBackUrl = null;
		app.postRequest('/rest/team/getpUserAndHospital',{
			   pId: pId,
			   hospitalId:hospitalId?hospitalId:'',
			},data=>{
			wx.hideLoading();
			if(data.messageCode==900){
				this.setData({
					hospital_logo:data.data.hospital_logo,
					hospital_name:data.data.hospital_name
				})
			}else{
				wx.showToast({
					title:data.message?data.message:'无法获取医院信息',
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
		app.globalData.navigateBackUrl = null;
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
									  content: options.hospitalId?'您已在该团队中,点确认将跳转到首页':'您已在该团队中,点确认将跳转到套餐购买页',
									  success(res) {
										if (res.confirm) {
											if(options.hospitalId){
												wx.reLaunch({
													url:'/pages/buyShop/shopList/shopList?hospitalid='+options.hospitalId
												})
											}else{
												wx.reLaunch({
													url:"/pages/toPromote/toPromote"
												})
											}
										} else if (res.cancel) {
											wx.reLaunch({
												url:"/pages/toPromote/toPromote"
											})
										}
									  }
									})
								}
							}else{
								// 不在团队中的时候
								// 判断 pId 是否跟 userId 相等
								if(options.pId==data.data.userId){
									this.getQrCodeData(data.data.userId,options.hospitalId);
								}else{
									let vphone = this.formatPhone(data.data.phone);
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
		this.setData({
			goHome:options.share?true:false,
			showBack:options.share?false:true,
			barHeight:app.globalData.statusBarHeight
		})
		if(app.loginTest()) return;
		if(options.myApp=='myApp'){
			let {avatar,nickname,id} = app.globalData.myUserInfo;
			this.setData({
				barTitle:"我要推广",
			})
			this.setData({
				nickname:nickname,
				statusNowTime:2,
				avatar:avatar?avatar:'../../assets/default.png'
			})
			this.id = id;
			this.hospitalId = options.hospitalId?options.hospitalId:'';
			this.getHospitalData(id,this.hospitalId);   
			this.getQrCodeData(id,this.hospitalId);    
		}
		if(options.share=='share' || options.scene){
			this.setData({
				barTitle:"加入我们",
			})
			if(options.scene){	
				let scene = decodeURIComponent(options.scene).split("&");
				if(!isNaN(scene[0])){
					this.shareOptions = {
						pId:Number(scene[0]),
						hospitalId:scene[1]&&scene[1]!=='null'&&scene[1]!=='undefined'?Number(scene[1]):''
					};
				}else{
					wx.showToast({
						title: '分享二维码错误啦！',
						icon: 'none',
						duration: 2000
					})
				}
			}else{
				this.shareOptions = options;
			}
			
			if(app.globalData.myUserInfo){
				this.judgeScan(this.shareOptions);
			}else{
				app.userInfoReadyCallback = res =>{
					// 有了登录权限的时候要走的方法
					this.judgeScan(this.shareOptions);
				}
			}
		}
    },
    /**
    * 用户点击右上角分享
    */
    onShareAppMessage: function () {
			 let hospitalId = this.hospitalId;// this.hospitalId;
			 let path = `/pages/promteCode/promteCode?share=share&pId=${this.id}&hospitalId=${hospitalId}`;
			 return {
						title: this.data.nickname + '向你推荐'+this.data.hospital_name,
						imageUrl:this.data.hospital_logo,
						path: path,
						success: function (res) {},
						fail: function (res) {}
				}
  }
})