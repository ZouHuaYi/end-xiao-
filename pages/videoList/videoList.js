const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
	navList:[],
	videoList:[],
	startIndex:0,
	startId:null,
	prevVideoId:null,
	pageArr:{"page_0":1},
	playList:[]
  },
  // 点击导航
  clickNav:function(e){
	let {index,id} = e.currentTarget.dataset;
	let str = "page_"+index
	this.data.pageArr[str] = 1;
	
	this.setData({
		startIndex:index,
		startId:id,
		videoList:[],
		playList:[]
	})
	this.getVideoData(id,1);
  },
  pageUpdate:function(){
	let { startIndex,pageArr,startId } = this.data;
	let key = "page_"+startIndex;
	let page = pageArr[key];
	this.getVideoData(startId,page+1,()=>{
		this.data.pageArr[key] = page+1;
	})
  },
  
  // 播放视频
  playVideo:function(e){
	  let {index,playid,src} = e.currentTarget.dataset;
	  let {videoList,playList} = this.data;
	  this.setData({
		 playList:playList.map((el,key)=>{
			 el.videoStatus = false;
			  el.videoSrc = '';
			 if(key==index){
				 el.videoStatus = true;
				 el.videoSrc = src;
			 }
			 return el;
		 })
	  })
	  
	  if (this.data.prevVideoId) {
	      var prevV = wx.createVideoContext(this.data.prevVideoId);
	      prevV.pause()
	  }
	  var videoContext = wx.createVideoContext(playid);
	  videoContext.play();
	  this.setData({
	      prevVideoId: playid
	  });
	  
  },
  // 获取导航的数据
  getNavList:function(callback){
	app.postRequest('/rest/category/list',{
		pid:0,
		type:1,
		page:1,
		rows:100
	},data => {
		if(data.messageCode==900){
			this.setData({
				navList:data.data
			})
			callback&&callback(data.data[0].id);
		}else{
			wx.showToast({
			  title: data.message? data.message:'请求出错啦！',
			  icon: 'none',
			  duration: 2000
			})
		}
	})
  },
  // 获取视频数据
  getVideoData:function(id,page,callback){
	if(this.startLower) return;
	wx.showLoading({
		title:"正在加载",
		mask:true
	})
	this.startLower = true;
	app.postRequest('/rest/train/list',{
		page:page,
		rows:10,
		categoryId:id,
		isHomePage:0
	},data => {
		this.startLower = false;
		wx.hideLoading();
		if(data.messageCode==900){
			if(data.data&&data.data.length>0){
				let videoList =  this.data.videoList;
				let playList = this.data.playList;
				this.setData({
					videoList:videoList.concat((data.data).map((el)=>{
						el.videoStatus = false;
						el.videoSrc = '';
						playList.push({
							videoSrc:'',
							videoStatus:false
						})
						return el;
					})) 
				})
				this.setData({
					playList:playList
				})
				callback&&callback()
			}
		}else{
			wx.showToast({
			  title: data.message? data.message:'请求出错啦！',
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
		barTitle:'培训专区',
		barHeight:app.globalData.statusBarHeight
	})
	this.getNavList((id)=>{
		this.data.startId = id;
		this.getVideoData(id,1)
	});
	
  },
  onShareAppMessage:function(){
  	const share = app.allShareData();
  	return share;
  }
})