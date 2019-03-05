const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
   data: {
		areaList:null,
		shopDetail:null,
		grade:['无','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
		inputData:''
   },
	// 选择地点
	selectArea:function(e){
		let id = e.currentTarget.dataset.id;
		wx.navigateTo({
			url:"../editorList/editorList?id="+id
		})
	},
	// 输入激活码
	activateInput:function(e){
		this.input = e.detail.value;
		this.setData({
			inputData:e.detail.value
		})
	},
	// 点击激活
	activateClick:function(){
		if(!this.input){
			wx.showToast({
				title: '请输入激活码',
				icon: 'none',
				duration: 2000
			})
			return;
		}
		wx.showLoading({
			title:"正在激活",
			mask:true
		})
		app.postRequest('/rest/user/activate_card',{
			token:app.globalData.myUserInfo.token,
			activationCode:this.input
		},data=>{
			wx.hideLoading();
			if(data.messageCode==900){
				wx.showToast({
					title: '请输入激活码',
					icon: 'none',
					duration: 2000
				})
				setTimeout(()=>{
					wx.reLaunch({
						url:"/pages/toPromote/toPromote"
					})
				},2000)
			}else{
				wx.showToast({
					title: data.message?data.message:'激活失败',
					icon: 'none',
					duration: 2000
				})
			}
		})
		
	},
	// 获取地址数据
	getAreaData:function(){
		app.postRequest("/rest/address/list",{
			"token":app.globalData.myUserInfo.token,
			"userId":app.globalData.myUserInfo.id,
			"page":1,
			"rows":1
		},data=>{
			if(data.messageCode==900){
				if(data.data&&data.data.length>0){
					let newsData = data.data[0];
					this.receivePhone = newsData['receivePhone'];
					newsData['receivePhone'] = this.receivePhone.substr(0, 3) + "****" + this.receivePhone.substr(7);
					this.setData({
						areaList:newsData
					})
				}
			}else{
				wx.showToast({
					title: data.message,
					icon: 'none',
					duration: 2000
				})
			}
		})
	},
    // 获取套餐信息
    getCardInfo:function(data){
	 app.postRequest('/rest/wechat/giftCard/activate/pageMsg',{...data},res=>{
		 console.log(res)
		 if(res.messageCode==900){
			 this.setData({
				 shopDetail:res.data
			 })
			 this.setData({
				 inputData:res.data.code
			 })
			 this.input = res.data.code;
		 }
	 })  
    },
   /**
   * 生命周期函数--监听页面加载
   */
    onLoad: function (options) {
		this.setData({
			showBack:options.card_id?false:true,
			barTitle:"激活套餐",
			barHeight:app.globalData.statusBarHeight
		})
		if(app.loginTest()) return;
		
		if(options.card_id){
			this.getCardInfo(options);
		}else{
			if(app.globalData.shopList){
				this.setData({
					shopDetail:app.globalData.shopList
				})
			}else{
				wx.reLaunch({
					url:"/pages/toPromote/toPromote"
				})
			}
		}
		
		if(app.globalData.myUserInfo){
			this.getAreaData();
		}else{
			app.userInfoReadyCallback = info => {	
				this.getAreaData();
			}
		}
		
		
    },
	  /**
	   * 生命周期函数--监听页面显示
	   */
	onShow: function () {
		if(app.globalData.areaSelect){
			let newsData = app.globalData.areaSelect;
			this.receivePhone = newsData['receivePhone'];
			newsData['receivePhone'] = this.receivePhone.substr(0, 3) + "****" + this.receivePhone.substr(7);
			this.setData({
				areaList:newsData
			})
		}
	}
})