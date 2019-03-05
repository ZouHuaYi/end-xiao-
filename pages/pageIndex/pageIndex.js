const app = getApp();
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
    data: {
		imgUrls: [],
		indicatorDots: true,
		autoplay: true,
		interval: 5000,
		duration: 1000,
		navList:[
			{
				title:'推广中心',
				img:'../../assets/center_go.png',
				url:'/pages/toPromote/toPromote',
				link:''
			},
			{
				title:'精选套餐',
				img:'../../assets/buy_go.png',
				url:'/pages/buyShop/mmBuy/mmBuy',
				link:''
			},
			{
				title:'案例视频',
				img:'../../assets/team_go.png',
				url:'/pages/videoList/videoList',
				link:''
			},
			{
				title:'重要通知',
				img:'../../assets/info_go.png',
				url:'/pages/webView/webView',
				link:app.globalData.root_url+'/wxchat/report.html'
			},
			{
				title:'下载App',
				img:'../../assets/load_go.png',
				url:'/pages/webView/webView',
				link:app.globalData.root_url+'/wxchat/load.html'
			}
		],
		hospitalList:[],
		firsIndex:0,
		secIndex:0,
		pageRows:15,	
		pagesNumber:1,
		searchKey:'',
		loading:true,
		advertList:[],
		noDataStatus:false
    },
	// 跳转广告页
	goToBanner:function(e){
		let index = e.currentTarget.dataset.index;
		let {description,clickUrl,type} =  this.data.imgUrls[index];
		if(type==0){
			app.globalData.templateHtml = description;
			wx.navigateTo({
				url:'/pages/details/details'
			})
		}else if(type==1){
			wx.navigateTo({
				url:'/pages/webView/webView?url='+encodeURIComponent(clickUrl)
			})
		}
	},
	// 跳转到购买列表页
	goToPayList:function(e){
		let id = e.currentTarget.dataset.id;
		wx.navigateTo({
		  	url:"/pages/buyShop/shopList/shopList?hospitalid="+id
		})
	},
	// 获取医院数据
	getHospitalData:function(area,city){
		let {firsIndex,secIndex,hospitalList,pageRows,pagesNumber,searchKey,advertList} = this.data;
		app.globalData.navigateBackUrl = null;
		app.postRequest('/rest/hospital/list',{
			area: city,
			district:'',
			orderType:firsIndex,                // 0 默认 1 最热 2 最新 3 最近
			latitude:area.latitude,
			longitude:area.longitude,
			page:pagesNumber,                    // 页数
			rows:pageRows,                      // 分页的条数				
			type:'',                 			// null 全部 0 医院 1 美容院
			userId:app.globalData.myUserInfo.id,
			token:app.globalData.myUserInfo.token,
			isAllowDistribution:1
		},data=>{
			if(data.messageCode==900){
				if(data.data && data.data.length>0){
					let dat = data.data.map((el)=>{
						if(el.distance>1000){
							el.distance = (el.distance/1000).toFixed(2) +'公里';
						}else{
							el.distance = el.distance+'米';
						}
						if(el.advertiseList&&el.advertiseList.length>0){
							advertList = advertList.concat(el.advertiseList);
						}
						return el;
					})
					hospitalList = dat;
					this.setData({
						hospitalList:hospitalList,
						pagesNumber:pagesNumber+1,
						advertList:advertList
					})
				}
			}else if(data.messageCode==902){
				this.setData({
					hospitalList:[]
				})
			}else if(data.messageCode==905){
				if(city){
					this.getHospitalData(this.areaPlace,'');
				}
			}else{
				wx.showToast({
				  title: data.message?data.message:'出错啦！！！',
				  icon: 'none',
				  duration: 2000
				})
			}
			this.setData({
				loading:false
			})
		})  
	},
	// 去到
	goToNav:function(e){
		let {url,link} = e.currentTarget.dataset;
		let nav = link? url+'?url='+encodeURIComponent(link):url;
		wx.navigateTo({
			url:nav
		})
	},
	// 获取轮播图
	bannerList:function(){
		wx.showLoading({
			title:"正在加载",
			mask:true
		})
		app.postRequest('/rest/banner/list',{
			  page:1,
			  row:10,
		      position:0
		   },data=>{
			   wx.hideLoading();
		   if(data.messageCode==900){
			   if(data.data && data.data.length>0){
					this.setData({
						imgUrls:data.data
					}) 
			   }
		   }
		})
	},
	 // 获取地理位置信息
	getAreaData:function(callback){
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
								that.setData({
									loading:false
								})
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
						 }
					})  
				} else  { //授权后默认加载
					wx.getLocation({
						type: 'wgs84',
						success:  (res) =>{
							that.areaPlace = res;
							callback&&callback(res);
						}
					})  
				}
			}
		})
	},
    // 整合分享授权部分
	shareAllData:function(){
  	  if(this.areaPlace){
  	  	this.getLocalCity(this.areaPlace);
  	  }else{
  	  	this.getAreaData((res)=>{
			this.getLocalCity(res);
  	  	})
  	  }

	},
	// 获取当前市
	getLocalCity:function(area){
		qqmapsdk.reverseGeocoder({
		  location: {
			latitude: area.latitude,
			longitude: area.longitude
		  },
		  success: (res) => {
				const city = res.result.address_component.city;
				this.getHospitalData(area,city);
			}
		});
	},
    /**
    * 生命周期函数--监听页面加载
    */
    onLoad: function (options) {
		this.setData({
			showBack:false,
			barTitle:'美上美-美丽私人管家',
			barHeight:app.globalData.statusBarHeight
		})
		if(app.loginTest()) return;
		this.bannerList();
		qqmapsdk = new QQMapWX({
		  key: app.globalData.map_key
		});
	},
	// 路由切换
	onShow:function(){
		if(this.data.hospitalList.length>0) return;
	   if(app.globalData.myUserInfo){
			this.shareAllData();
		}else{
			app.userInfoReadyCallback = info => {		
				this.shareAllData();
			}
		}
   },
   onShareAppMessage:function(){
	   
   }
})