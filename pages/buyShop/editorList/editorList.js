const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
	data: {
		areaList:[],
		selectId:0
   },
	// 选择地址
	selectAction:function(e){
		let {id,index} = e.currentTarget.dataset;
		this.setData({
			selectId:id
		})
		app.globalData.areaSelect = this.data.areaList[index];
		wx.navigateBack();
	},
	// 删除地址
	deteleArea:function(e){
		let {id,index} = e.currentTarget.dataset;
		wx.showModal({
			title: '温馨提示',
			content: '是否要删除该地址，删除后无法恢复.',
			success:res=>{
				if (res.confirm) {
					app.postRequest('/rest/address/delete',{
							token:app.globalData.myUserInfo.token,
							addressId:id
						},data=>{
								if(data.messageCode==900){
									let areaList = this.updateArrByDel(this.data.areaList,index);
									this.setData({
										areaList:areaList
									})
									if(id==this.data.selectId){
										this.setData({
											selectId:0
										})
									}
									if(areaList.length<=0){
										app.globalData.areaSelect = null;
									}
								}else{
									wx.showToast({
										title: data.message,
										icon: 'none',
										duration: 2000
									})
								}
					})
				} else if (res.cancel) {
				}
			}
		})
	},
	// 删除数组中的某个数据
	updateArrByDel:function(arr, index) {
		if(index<0 || index>=arr.length){
			return arr
		}	
		return arr.slice(0, index).concat(arr.slice(index+1))
	},
	// 添加新地址
	addNewsArea:function(){
		app.globalData.areaSelect = null;
		wx.navigateTo({
			url:"../editorArea/editorArea?add=add"
		})
	},
	// 点击编辑页
	modify:function(e){
		let {id,index} = e.currentTarget.dataset;
		app.globalData.areaSelect = this.data.areaList[index];
		wx.navigateTo({
			url:"../editorArea/editorArea?id="+id
		})
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		this.setData({
			showBack:true,
			barTitle:"地址管理",
			barHeight:app.globalData.statusBarHeight
		})

		if(options.id){
			this.setData({
				selectId:options.id
			})
		}
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
		app.postRequest("/rest/address/list",{
			"token":app.globalData.myUserInfo.token,
			"userId":app.globalData.myUserInfo.id,
			"page":1,
			"rows":1000
		},data=>{
			if(data.messageCode==900){
				if(data.data&&data.data.length>0){
					this.setData({
						areaList:data.data
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
   }

})