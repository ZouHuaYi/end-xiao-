const app = getApp();

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
				title:'购买套餐',
				img:'../../assets/buy_go.png',
				url:'/pages/hospitalList/hospitalList',
				link:''
			},
			{
				title:'使用培训',
				img:'../../assets/team_go.png',
				url:'/pages/webView/webView',
				link:app.globalData.root_url+'/wxchat/train.html'
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
		firsIndex:3,
		secIndex:0,
		pageRows:10,	
		pagesNumber:1,
		searchKey:'',
		advertList:[]
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
	getHospitalData:function(area){
		let {firsIndex,secIndex,hospitalList,pageRows,pagesNumber,searchKey} = this.data;
		
		app.globalData.navigateBackUrl = null;
		app.postRequest('/rest/distribution/hospital',{
			condition:firsIndex,        // 0 默认 1 最热 2 最新 3 最近
			latitude:area.latitude,
			longitude:area.longitude,
			page:pagesNumber,                  // 页数
			rows:pageRows,                   // 分页的条数				
			type:secIndex==0?'':secIndex-1,                 // null 全部 0 医院 1 美容院
			key:searchKey,					 // 查找
			userId:app.globalData.myUserInfo.id,
			token:app.globalData.myUserInfo.token
		},data=>{
			if(data.messageCode==900){
				if(data.data && data.data.length>0){
					let dat = data.data.map((el)=>{
						if(el.distance>1000){
							el.distance = (el.distance/1000).toFixed(2) +'公里';
						}else{
							el.distance = el.distance+'米';
						}
						return el;
					})
					if(pagesNumber==1){
						hospitalList = dat;
					}else{
						hospitalList = hospitalList.concat(dat);
					}
					this.setData({
						hospitalList:hospitalList,
						pagesNumber:pagesNumber+1
					})
				}else{
					if(pagesNumber==1){
						this.setData({
							hospitalList:[]
						})
					}
				}
			}else if(data.messageCode==902){
				if(pagesNumber==1){
					this.setData({
						hospitalList:[]
					})
				}
			}else{
				wx.showToast({
					title: data.message?data.message:'无法获得医院数据',
					icon: 'none',
					duration: 2000
				})
			}
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
		      position:9
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
  	  	this.getHospitalData(this.areaPlace);
  	  }else{
  	  	this.getAreaData((res)=>{
  	  		this.getHospitalData(res);
  	  	})
  	  }
	},
    /**
    * 生命周期函数--监听页面加载
    */
    onLoad: function (options) {
		if(app.loginTest()) return;
		  this.bannerList();
		if(app.globalData.myUserInfo){
			this.shareAllData();
		}else{
			app.userInfoReadyCallback = info => {		
				this.shareAllData();
			}
		}
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
		this.getHospitalData(this.areaPlace);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})