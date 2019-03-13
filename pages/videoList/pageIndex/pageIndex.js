const app = getApp();
const WHIRE_NAV = [{'name':'专栏','url':'/pages/videoList/column/column'},{'name':'会员','url':'/pages/videoList/members/members'}];

Page({
  /**
   * 页面的初始数据
   */
  data: {
	bannerList:[],
	navList:[],
	hotDataList:[],
	rowNumber:10,
	pageNumber:1,
	loadingStatus:0,   // 0 正在加载 1 上拉加载 2 全部加载完成 3 没有数据
	loadingList:['正在加载','加载更多数据','全部加载完成','没有更多数据'],
  },
  // 跳转到分类页
  goToPagesList:function(e){
	  const {id,url,name} = e.currentTarget.dataset;
	  wx.navigateTo({
	  	url:`${url}?id=${id}&name=${name}`
	  })
  },
  // 跳转到纤细页
  goToDetail:function(e){
	const id = e.currentTarget.dataset.id;
	  wx.navigateTo({
	  	url:`/pages/videoList/detail/detail?id=${id}&members=0`
	  })
  },
  // 获取最新视频
  getHotVideoData:function(){
	  const {rowNumber,pageNumber,hotDataList} = this.data;
	  app.postRequest('/rest/train/list',{
		  categoryId:0,
		  page:pageNumber,
		  rows:rowNumber,
		  isHomePage:0,
		  free:0,
		  keyword:'',
		  token:app.globalData.myUserInfo.token
	  },res=>{
		  if(res.messageCode==900){
			  if(res.data && res.data.length>0){
				  this.setData({
					  hotDataList:hotDataList.concat(res.data),
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
  // 获取轮播图 
  getBannerData:function(){
	   wx.showLoading({
	  	mask:true,
	  		title:"正在加载"
	  })
	app.postRequest('/rest/banner/list',{
		page:1,
		rows:10,
		position:10
	},res=>{
		 wx.hideLoading();
		if(res.messageCode==900){
			this.setData({
				bannerList:res.data
			})
		}
	})  
  },
  // 获取导航数据
  getNavData:function(){
	  wx.showLoading({
	  	mask:true,
		title:"正在加载"
	  })
	  app.postRequest('/rest/category/list',{
	  	pid:0,
	  	type:1,
	  	page:1,
		rows:10,
		token:app.globalData.myUserInfo.token
	  },res=>{
		  wx.hideLoading();
	  	if(res.messageCode==900){
			if(res.data&&res.data.length>0){
				this.setData({
					navList:res.data.map((el,key)=>{
						el.url = '/pages/videoList/pageList/pageList';
						WHIRE_NAV.map((e,k)=>{
							if(el.name==e.name){
								el.url=e.url
							}
						})
						return el;
					})
				})
			}
	  	}else{
			wx.showToast({
			  title: res.message?res.message:'网络开小差啦!',
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
		showBack:true,
		barTitle:'视频',
		barHeight:app.globalData.statusBarHeight
	})
	this.getBannerData();
	this.getNavData();
	this.getHotVideoData();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
	  if(this.loadingNew) return;
	  this.loadingNew = true;
	  setTimeout(()=>{
		  this.setData({
			loadingStatus:0
		  })
		 this.getHotVideoData()
	  },500)
  }
})