const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
	membersList:[],
	pageNumber:1,
	loadingStatus:0,   // 0 正在加载 1 上拉加载 2 全部加载完成 3 没有数据
	loadingList:['正在加载','加载更多数据','全部加载完成','没有更多数据'],
  },
   // 跳转到纤细页
  goToDetail:function(e){
  	const id = e.currentTarget.dataset.id;
  	  wx.navigateTo({
  	  	url:`/pages/videoList/detail/detail?id=${id}&members=0`
  	  })
  },
  // 获取数据
   getMembersData:function(){
	   let {membersList,pageNumber} = this.data;
	    app.postRequest('/rest/train/my_train',{
			userId:app.globalData.myUserInfo.id,
			page:pageNumber,
			rows:10,
		},res=>{
			if(res.messageCode==900){
			  if(res.data && res.data.length>0){
				  this.setData({
					  membersList:membersList.concat(res.data),
					  pageNumber:pageNumber+1,
					  loadingStatus:1
				  })
			  }else{
				  this.setData({
					  loadingStatus:2
				  })
			  }
			}else if(res.messageCode==905){
			   this.setData({
					loadingStatus:2
			  })
			}else{
				 this.setData({
					loadingStatus:3
				 }) 
			}
			this.loadingNew = false;
		})
   },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	this.setData({
		showBack:true,
		barTitle:'会员',
		barHeight:app.globalData.statusBarHeight
	});
	this.getMembersData();
  },
  onReachBottom:function(){
	   if(this.loadingNew) return;
	  this.loadingNew = true;
	  setTimeout(()=>{
		  this.setData({
			loadingStatus:0
		  })
		 this.getMembersData()
	  },500)
  }
})