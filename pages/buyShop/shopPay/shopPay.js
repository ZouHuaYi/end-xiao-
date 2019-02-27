const app = getApp();

Page({

	/**
	* 页面的初始数据
	*/
	data: {
		shopDetail:{},
		grade:['无','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
		areaList:null
	},
	// 支付给钱
	pay:function(){
		/**业务类型0:套餐, 1:会员购买, 2:服务, 3:MM卖场*/
		let {hospitalId,price,id,title} = this.data.shopDetail.v_package;
		let item = [{"number":"1","productId":id,"specificationGroup":title}];
		if(!this.data.areaList){
			wx.showToast({
				title: '收货地址不能为空',
				icon: 'none',
				duration: 2000
			})
			return;
		}
		app.postRequest("/rest/order/place",{
			addressId:this.data.areaList.id,
			amount:price,
			hospitalId:hospitalId,
			item:JSON.stringify(item),
			originalPrice:price,
			retainage:0,
			token:app.globalData.myUserInfo.token,
			type:0,
			userId:app.globalData.myUserInfo.id
		},data=>{
			if(data.messageCode==900){
				app.globalData.orderPlace = {
					"orderNumber":data.data.orderNumber,
					"amount":data.data.amount
				}
				wx.navigateTo({
					url:`../payFinish/payFinish?userId=${data.data.userId}&hospitalId=${hospitalId}&visible=${this.options.visible}`
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
	// 选择地点
	selectArea:function(e){
		let id = e.currentTarget.dataset.id;
		wx.navigateTo({
			url:"../editorList/editorList?id="+id
		})
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	this.setData({
	  	showBack:true,
	  	barTitle:'购买套餐',
	  	barHeight:app.globalData.statusBarHeight
	 })
	if(app.globalData.shopList){
		this.setData({
			shopDetail:app.globalData.shopList
		})
	}else{
		wx.reLaunch({
			url:"/pages/toPromote/toPromote"
		})
	}
	this.options = options;
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
	}else{
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
				this.setData({
					areaList:null
				})
			}
		})
	}
  }
})