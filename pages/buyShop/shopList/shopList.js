var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
		shopList:[],
		nodataStatus:false,
		grade:['无','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
		shopHospital:{}
  },
  // 使用激活卡页
  goToBuyActivate:function(){
	wx.navigateTo({
		url:"/pages/buyShop/cardActivate/cardActivate"
	})  
  },
	// 去列表详情
	gotoDetail:function(e){
		let {index,id,visible} = e.currentTarget.dataset;
		wx.navigateTo({
			url:'../shopDetail/shopDetail?id='+id+'&'+'visible='+visible
		})
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		this.setData({
			showBack:true,
			barTitle:"套餐列表",
			barHeight:app.globalData.statusBarHeight
		})
	  
		let {id,token} = app.globalData.myUserInfo;
		wx.showLoading({
			title:"正在加载",
			mask:true
		})
		app.postRequest("/rest/distribution/hospital_package",{
			userId:id,
			hospitalId:options.hospitalid,
			token:token
		},data=>{
			wx.hideLoading();
			if(data.messageCode==900){
				if(data.data&&data.data.length>0){
					this.setData({
						shopList:data.data
					})
					if(data.data.length==1){
						setTimeout(()=>{
							wx.navigateTo({
								url:'../shopDetail/shopDetail?id='+data.data[0].id+'&'+'visible='+data.data[0].visible
							})
						},1000)
					}
				}
				
			}else{
				wx.showToast({
					title: data.message?data.message:'没有跟多内容',
					icon: 'none',
					duration: 2000
				})
			}
			this.setData({
				nodataStatus:true
			})
		})
    }
})