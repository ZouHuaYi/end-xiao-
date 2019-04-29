const app = getApp();
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
   data: {
	hospitalList:[],
	packageMapList:[],
	showHospitalList:[],
	appStatus:{},
	defaultIndex:0,
	alertStatus:true,
	animationData:{},
	opacityData:{},
	pickerList:[],
   },
   // 打电话
   telPhone:function(e){
	   const ph = e.currentTarget.dataset.phone;
	   wx.makePhoneCall({
		  phoneNumber: ph // 仅为示例，并非真实的电话号码
		})
   },
   // 图片预览
   preImgFun:function(e){
		let img = e.currentTarget.dataset.img;
		wx.previewImage({
		  current: img,  // 当前显示图片的http链接
		  urls: [img]      // 需要预览的图片http链接列表
		})
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
		app.postRequest('/rest/distribution/main/push/package',{
			   token:app.globalData.myUserInfo.token
			},data=>{
			wx.hideLoading();
			if(data.messageCode==900){
				const {packageMapList,locking,serviceImgUrl,relateAccount} = data.data;
				this.setData({
					appStatus:{
						locking:locking,
						serviceImgUrl:serviceImgUrl,
						relateAccount:relateAccount,
					}
				});
				this.getAreaData(res=>{
					this.getLocalCity(res,dt=>{
						let defaultIndex = -1;
						let pickerList = [];
						packageMapList.forEach((item,key)=>{
							pickerList.push(item.title);
							if(item.area.indexOf(dt.province+dt.city)>-1){
								defaultIndex = key;
								return;
							}
						})
						if(defaultIndex==-1){
							packageMapList.forEach((item,key)=>{
								if(item.area.indexOf(dt.province)>-1){
									defaultIndex = key;
									return;
								}
							})
						}
						const valueIndex = Number(wx.getStorageSync('defaultIndex'));
						this.setData({
							defaultIndex:valueIndex?valueIndex:(defaultIndex==-1?0:defaultIndex),
							packageMapList:packageMapList,
							pickerList:pickerList
						})
						
					},()=>{
						this.setData({
							packageMapList:packageMapList,
						})
					});
				},()=>{
					this.setData({
						packageMapList:packageMapList,
					})
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
	// 改变医院名称
	selectHospital:function(e){
		this.setData({
			defaultIndex:e.detail.value
		})
		wx.setStorage({
			key:'defaultIndex',
			data:e.detail.value
		})
	},
	// 页面跳转 
	addProject:function(){
		const {relateAccount,locking} = this.data.appStatus;
		
		if(relateAccount==true&&locking==false){
			wx.navigateTo({
				url:'/pages/promteCode/selectAdd/selectAdd'
			})
		}else if(relateAccount==true&&locking==true){
			wx.showToast({
				title: '亲！项目选定后30天后才允许再次修改。',
				icon: 'none',
				duration: 2000
			})
		}else{
			wx.showToast({
				title: '亲！你没有权限修改活动项目。',
				icon: 'none',
				duration: 2000
			})
		}
	},
	 // 获取地理位置信息
	getAreaData:function(callback,fail){
		let that = this; 
		wx.getSetting({
			success: (res) => {
				if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {//非初始化进入该页面,且未授权
					wx.showModal({
						title: '是否授权当前位置',
						content: '需要获取您的地理位置，请确认授权，否则无法获取您所需数据',
						success: function (res) {
							if (res.cancel) {
								wx.showToast({
									title: '授权失败',
									icon: 'success',
									duration: 1000
								})
								fail&&fail();
							} else if (res.confirm) {
								wx.openSetting({
									success: function (dataAu) {
										if (dataAu.authSetting["scope.userLocation"] == true) {
											wx.showToast({
												title: '授权成功',
												icon: 'success',
												duration: 1000
											})
											//再次授权，调用getLocationt的API
											that.getAreaData(callback);
										} else {
											wx.showToast({
												title: '授权失败',
												icon: 'success',
												duration: 1000
											})
										}
									},
									fail:function(){
										fail&&fail();
									}
								})
							}
						}
					})
				} else if (res.authSetting['scope.userLocation'] == undefined) {//初始化进入
					wx.getLocation({
						type: 'wgs84',
						success:  (res) =>{
								that.areaPlace = res;
								callback&&callback(res);
						 },
						 fail:function(){
						 	fail&&fail();
						 }
					})  
				} else  { //授权后默认加载
					wx.getLocation({
						type: 'wgs84',
						success:  (res) =>{
							that.areaPlace = res;
							callback&&callback(res);
						},
						fail:function(){
							fail&&fail();
						}
					})  
				}
			}
		})
	},
	// 获取当前市
	getLocalCity:function(area,callback,fail){
		qqmapsdk.reverseGeocoder({
			location: {
				latitude: area.latitude,
				longitude: area.longitude
			},
			success: (res) => {
				const city = res.result.address_component;
				callback&&callback(city);
			},
			fail:function(){
				fail&&fail();
			},
		});
	},
	/**
    * 生命周期函数--监听页面加载
    */
	onLoad: function (options) {
		qqmapsdk = new QQMapWX({
		  key: app.globalData.map_key
		});
		this.setData({
			goHome:options.share?true:false,
			showBack:options.share?false:true,
			barHeight:app.globalData.statusBarHeight,
			barTitle: '推广二维码'
		})
		let {avatar,nickname,id} = app.globalData.myUserInfo;
		this.setData({
			nickname:nickname,
			avatar:avatar?avatar:'../../../assets/default.png'
		})
		this.id = id;
		this.hospitalId = options.hospitalId?options.hospitalId:'';
		
		this.getHospitalData(id,this.hospitalId);   
		this.getQrCodeData(id,this.hospitalId);
			
	},
	// 获取已经选择的项目
	selectServerData:function(){
		app.postRequest('/rest/distribution/user_configure_product_list',{
			token:app.globalData.myUserInfo.token,
		},res=>{
			if(res.messageCode==900){
				this.setData({
					showHospitalList:res.data
				})
			}else{
				wx.showToast({
					title: res.message?res.message:'添加失败',
					icon: 'none',
					duration: 2000
				})
			}
		})
	},
   /**
   * 生命周期函数--监听页面显示
   */
   onShow: function () {
	 this.animation = wx.createAnimation({
	  duration: 200,
	  timingFunction: 'ease',
	})
	this.opacity = wx.createAnimation({
	  duration: 200,
	  timingFunction: 'ease',
	})
	this.selectServerData();
  },
  /**
   * 用户点击右上角分享
   */
	  onShareAppMessage: function () {
		 let hospitalId = this.hospitalId; // this.hospitalId;
		 let path = `/pages/promteCode/promteCode?share=share&pId=${this.id}&hospitalId=${hospitalId}`;
		 return {
				title: this.data.nickname + '向你推荐'+'美上美App',
				imageUrl:this.data.hospital_logo,
				path: path,
				success: function (res) {},
				fail: function (res) {}
		 }
	  }
})