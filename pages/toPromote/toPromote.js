var app = getApp()
import{getLocalCity} from '../../utils/util.js'
Page({
   /**
	   * 页面的初始数据
	   */
    data: {
		newShowData:{},
		allShowData:[],
		alertSelect:[{"hospital":"医院","icon":"icon-yiyuan","list":[]},{"hospital":"美容院","icon":"icon-yiyuan-2","list":[]}],
		alertStatus:false,
		animationData:{},
		opacityData:{},
		avatar:'',
		navlist:[
			{
				"title":"我的团队",
				"icon":"../../assets/me.png",
				"url":"/pages/team/team"
			}]
	},
	// 去我的团队
	gotoMyteam:function(e){
		const {hospitalid,userid,url} = e.currentTarget.dataset;
		wx.navigateTo({
			url:`${url}?userid=${userid}&hospitalid=${hospitalid}&title=${this.data.newShowData.hospitalName}`
		})
	},
	// 去推广医院
	goToHospitalList:function(){
		this.initSelectStatus();
		wx.navigateTo({
			url:"/pages/hospitalList/hospitalList",
		})
	},
	// 跳转到购买页
	goToPay:function(e){
		let hospitalId = e.currentTarget.dataset.hospitalid;
		wx.navigateTo({
			url:"/pages/buyShop/shopList/shopList?hospitalid="+hospitalId
		})
	},
	// 调转到我的推广页
	gotoScanMak:function(e){
		let {pid,hospitalid,title} = e.currentTarget.dataset;
		hospitalid = '';
		wx.navigateTo({
			url:`/pages/promteCode/indexCode/indexCode?pId=${pid}&hospitalId=${hospitalid}&myApp=myApp`
		})
	},
	// 恢复原来的状态
	initSelectStatus:function(){
		let {animation,opacity} = this;
		opacity.opacity(0).step();
		animation.translateY("100%").step();
		this.setData({
			opacityData: opacity.export(),
			animationData:animation.export()
		})
		setTimeout(()=>{
			this.setData({
				alertStatus:false
			})
		},500)
	},
	// 弹出选择 医院列表
	changeAlert:function(){
		let {alertStatus} = this.data,{animation,opacity} = this;
		this.setData({
			alertStatus:!alertStatus
		})
		opacity.opacity(1).step();
		animation.translateY(0).step();
		 this.setData({
			 opacityData: opacity.export(),
			animationData: animation.export()
		})
		
	},
	// 选择医院的函数
	selectFun:function(e){
		let key = e.currentTarget.dataset.key;
		let {allShowData,alertSelect} = this.data;
		alertSelect = alertSelect.map((data,ke)=>{
			data.list = data.list.map((el,k)=>{
				el.select = el.key==key?true:false;
				return el;
			})
			return data;
		})
		this.setData({
			alertSelect:alertSelect
		})
		this.renderFun(allShowData[key]);
		this.initSelectStatus();
	},
	// 渲染现在的数据
	renderFun:function(data){
		app.globalData.recommended = data.pUserNickname;
		wx.setStorage({
			key:'hosiptalId',
			data:data.id,
		})
		this.setData({
			newShowData:data,
			barTitle: data.hospitalName
		})
	},
	// 跳转选择地址
	goToSelectAreas:function  () {
		wx.navigateTo({
			url:'/pages/selectAddress/selectAddress'
		})
	},
	// 获取用户信息
	gainAllData:function(userId,token,areas){
		let pack = ['无','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
		let grade =['一','二','三','四','五','六','七','八','九','十'];
		let formData={
			"userId":userId,
			"token":token,
			"area": areas=='全国'?'':(areas||app.globalData.areaList.city||''),
		}
		
		wx.showLoading({
			title:"正在加载",
			mask:true
		})
		
		let alertSelect = this.data.alertSelect;
		app.postRequest('/rest/distribution/home',formData,data=>{
			wx.hideLoading();
			if(data.messageCode==900){
				if(data.data&&data.data.length>0){
					let allShowData = data.data.map((data,key)=>{
							data.pack = pack[data.packageType]+'套餐';
							if(data.grade>0){
								data.gradeText = grade[data.grade-1]+'星级';
							}
							return data;
					})
					
					this.setData({
						allShowData:allShowData
					})
					
					try {
					  const value = wx.getStorageSync('hosiptalId');
					  this.setStoreStatus = false;
					  for(let k=0;k<allShowData.length;k++){
					  		if(allShowData[k].id == value){
					  		    this.renderFun(allShowData[k]);
					  			this.setStoreStatus = true;
					  		}
							alertSelect[allShowData[k].hospitalType].list.push({
								"title":allShowData[k].hospitalName,
								"key":k,
								"select":allShowData[k].id == value?true:false
							})
					  	}
					  	if(!this.setStoreStatus){
					  		this.renderFun(allShowData[0]);
							alertSelect[allShowData[0].hospitalType].list[0]["select"] = true;
					  	}
					} catch (e) {
					  this.renderFun(allShowData[0]);
					  alertSelect[allShowData[0].hospitalType].list[0]["select"] = true;
					}
					 this.setData({
					  	alertSelect:alertSelect
					  })
				}else{
					wx.showModal({
					  title: '温馨提示',
					  cancelText:'选择地区',
					  confirmText:'去推广',
					  content: '您当前没有可推广的医院或美容院',
					  success:(res) => {
						if (res.confirm) {
						  wx.redirectTo({
						  	url:"/pages/hospitalList/hospitalList"
						  })
						} else if (res.cancel) {
						  this.goToSelectAreas();
						}
					  }
					})
				}
			}else if(data.messageCode==902){
				wx.showModal({
				  title: '温馨提示',
				  cancelText:'选择地区',
				  confirmText:'去推广',
				  content: '您当前没有可推广的医院或美容院',
				  success:(res)=> {
					if (res.confirm) {
					  wx.reLaunch({
					  	url:"/pages/hospitalList/hospitalList"
					  })
					} else if (res.cancel) {
					  this.goToSelectAreas();
					}
				  }
				})
			}else{
				wx.showToast({
					title: data.message?data.message:'没有数据啦！',
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
		this.setData({
			goHome:options.pay?true:false,
			showBack:options.pay?false:true,
			barHeight:app.globalData.statusBarHeight
		})
		if(app.loginTest()) return;
		if(app.globalData.myUserInfo){
			var areas = options.areas?options.areas:null;
			this.gainAllData(app.globalData.myUserInfo.id,app.globalData.myUserInfo.token,areas);
			this.setData({
				avatar:app.globalData.myUserInfo.avatar,
				city:areas||app.globalData.areaList.city
			})
		}else{
			app.userInfoReadyCallback = info => {
				this.setData({
					city:app.globalData.areaList.city
				})
				
				this.gainAllData(info.id,info.token);
				this.setData({
					avatar:app.globalData.myUserInfo.avatar
				})
			}
		}
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
  },
	onHide:function () {
		this.setData({
			alertStatus:false
		})
	},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
	return {
		path: '/pages/pageIndex/pageIndex',
		success: function (res) {},
		fail: function (res) {}
	}
  }
})