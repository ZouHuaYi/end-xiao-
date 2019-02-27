const app = getApp();
import { citys,provinces} from '../../../utils/city.js'
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;

Page({
  /**
   * 页面的初始数据
   */
  data: {
	animationAddressMenu: {},
	hospitalList:[],
	pageRows:10,
	firsIndex:0,
	secNav:['全部','医院','美容院'],
	secIndex:2,
	pagesNumber:1,
	provincesList:provinces,
	proIndex:-2,
	cityIndex:{},
	citysList:[],
	cityName:null,
	hiddenStatus:false,
	titleName:'',
	noDataStatus:false,
	scrollTop:0
  },
   // 执行动画
  startAddressAnimation: function (isShow) {
	  let that = this;
    if (isShow) {
      // vh是用来表示尺寸的单位，高度全屏是100vh
      this.animation.height(400 + 'rpx').step()
    } else {
      this.animation.height(0 + 'rpx').step()
    }
    this.setData({
      animationAddressMenu: that.animation.export()
    })
  },
  // 选择地区
  selectArea:function(e){
	  let {index,name,id} = e.currentTarget.dataset;
	  this.setData({
		cityIndex:{[id]:index+''},
		hiddenStatus:false,
		titleName:name,
		hospitalList:[],
		pagesNumber:1
	  })
	  name = id==-1?'':name;
	  this.startAddressAnimation(false);
	  setTimeout(()=>{
		  this.getHospitalData(this.areaPlace,name,true);
	  },200)
  },
  // 显示隐藏者
  showMak:function(){
	const hiddenStatus = this.data.hiddenStatus;
	this.setData({
		hiddenStatus:!hiddenStatus
	});
	this.startAddressAnimation(!hiddenStatus);  
  },
  // 点击省份
  clickCity:function(e){
	const {index,id,name} = e.currentTarget.dataset;
	if(index==-1){
		this.setData({
			proIndex:-1,
			citysList:[{"province": "全国","name": "全国","id": "-1"}],
			cityName:'全国'
		})
	}else{
		this.setData({
			proIndex:index,
			citysList:citys[id],
			cityName:name,
			scrollTop:0
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
  // to bottom
  lower:function(){
		this.getHospitalData(this.areaPlace);
  },
  // 获取医院数据
  getHospitalData:function(area,city,selectStatus){
  	let {secIndex,hospitalList,pageRows,pagesNumber} = this.data;
	secIndex = secIndex==0?'':secIndex-1;
	this.setData({
		noDataStatus:false
	})
	wx.showLoading({
		title:'正在加载',
		mask:true
	})

  	app.postRequest('/rest/hospital/list',{
  		area: city || '',
  		district:'',
  		orderType:0,                // 0 默认 1 最热 2 最新 3 最近
  		latitude:area.latitude || 0,
  		longitude:area.longitude || 0,
  		page:pagesNumber,                    // 页数
  		rows:pageRows,                      // 分页的条数				
  		type:secIndex,                 			// null 全部 0 医院 1 美容院
  		userId:app.globalData.myUserInfo.id,
  		token:app.globalData.myUserInfo.token,
  		isAllowDistribution:1
  	},data=>{
  		wx.hideLoading();
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
  		}else if(data.messageCode==905){
			if(!selectStatus&&pagesNumber==1&&city){
				this.setData({
					titleName:'全国'
				})
				this.getHospitalData(this.areaPlace,'');
			}
		}else{
  			wx.showToast({
  				title: data.message?data.message:'无法获得医院数据',
  				icon: 'none',
  				duration: 2000
  			})
  		}
  		this.setData({
			noDataStatus:true
		})
  	})  
  },
  // 点击第二个导航的时候
  secNavClick:function(e){
		let index = e.currentTarget.dataset.index;
		this.setData({
			secIndex:index,
			pagesNumber:1,
			hospitalList:[]
		}) 
		const titleName = this.data.titleName=='全国'?'':this.data.titleName;
		this.getHospitalData(this.areaPlace,titleName);
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
								titleName:'全国'
							})
							that.areaPlace = {};
							that.getHospitalData({});
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
			const province = res.result.address_component.province;
			const city = res.result.address_component.city;
			this.setData({
				titleName:city
			})
			this.getHospitalData(area,city);
		}
	});
 },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		this.setData({
			showBack:true,
			barTitle:'精选套餐',
			barHeight:app.globalData.statusBarHeight
		})
		qqmapsdk = new QQMapWX({
		  key: app.globalData.map_key
		});
		if(app.loginTest()) return;
		if(app.globalData.myUserInfo){
			this.shareAllData();
		} else {
			app.userInfoReadyCallback = res =>{
				this.shareAllData();
			}
		}
		
  },
  onShow: function () {
  	this.animation = wx.createAnimation({
  	  duration: 200,
  	  timingFunction: 'ease',
  	})
  }
})