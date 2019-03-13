const app = getApp();
const SECOND_NAV = ['全部','免费','精品'];

Page({
  /**
   * 页面的初始数据
   */
  data: {
	navList:[{"title":'最新',"type":0}],
	navOneTwo:[
		[{"title":'最新',"type":0},{"title":'最热',"type":1}],
		[{"title":'全部',"type":0},{"title":'免费',"type":1},{"title":'精品',"type":2}],
	],
	showStatus:false,
	showOneTwoStatus:false,
	indexStatus:-1,
	oneTwoStatus:[0,0],
	threeNavList:[],
	threeNavSecondList:[],
	showThreeStatus:false,
	threeNavName:'全部',
	threeFisrtIndex:-1,
	threeSecondIndex:-1,
	temporaryFirstIndex:[],
	pageNumber:1,
	rowNumber:10,
	videoListData:[],
	videoForm:{},
	loadingStatus:0,   // 0 正在加载 1 上拉加载 2 全部加载完成 3 没有数据
	loadingList:['正在加载','加载更多数据','全部加载完成','没有更多数据'],
  },
  // 搜索页
  searchInput:function(e){
	 this.inputKeyword = (e.detail.value).trim();
   },
  // 点击搜索
  searchClick:function(){
	  this.data.videoForm['keyword'] = this.inputKeyword?this.inputKeyword:'';
	  this.searchStatusClick = true;
	  this.closeAllMask();
  },
  // 跳转到详情页面
  goToDetail:function(e){
	   const id = e.currentTarget.dataset.id;
		wx.navigateTo({
			url:`/pages/videoList/detail/detail?id=${id}&members=0`
	  })
  },
  // 获取列表数据
  getListData:function(){
	const {pageNumber,rowNumber,videoForm,videoListData} = this.data;
	const formData = {
		...videoForm,
		page:pageNumber,
		rows:rowNumber,
		token:app.globalData.myUserInfo.token
	}
	app.postRequest('/rest/train/list',formData,res=>{
		if(res.messageCode==900){
			if(res.data && res.data.length>0){
				this.setData({
					videoListData:videoListData.concat(res.data),
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
  // 选择第三列 获取 第二个导航
  clickThreeNavSec:function(e){
	  const {index,title,id} = e.currentTarget.dataset;
	  const {threeFisrtIndex,videoForm} = this.data;
	  this.data.temporaryFirstIndex = [threeFisrtIndex,index];
	  const tipTitle = this.title;
	  this.setData({
		 threeSecondIndex:index,
		 threeNavName:title,
		 barTitle:tipTitle,
	  })
	  if(videoForm['pid']){
		  delete videoForm['pid'];
	  }
	  videoForm['categoryId'] = id;
	  if(!this.searchStatusClick || !this.inputKeyword){
		  videoForm['keyword'] = '';
	  }
	  this.data.videoForm = videoForm;
	  this.closeAllMask();
  },
  // 点击第三列 第一个导航的时候
  clickThreeNavFun:function(e){
	  const {index,id,title} = e.currentTarget.dataset;
	  const {threeNavList,threeFisrtIndex,temporaryFirstIndex} = this.data;
	  let newIndex = -1;this.title = title;
		if(temporaryFirstIndex.length>0){
			newIndex = temporaryFirstIndex[0]==index?temporaryFirstIndex[1]:-1
		}
		this.setData({
		  threeNavSecondList:threeNavList[index].pCategoryList,
		  threeFisrtIndex:index,
		  threeSecondIndex:newIndex
	  })
  },
  // 获取导航数据
  getNavData:function(){
	  app.postRequest('/rest/category/list',{
	 	pid:0,
	 	type:1,
	 	page:1,
		rows:10,
		token:app.globalData.myUserInfo.token
	 },res=>{
		 if(res.messageCode==900){
			 if(res.data&&res.data.length>0){
				  this.setData({
					threeNavList:res.data.filter((el,key)=>{
						if(el.status==0&&el.type==1){
							return true;
						}
					})
					
				})
			 }
		 }
		 
	 }) 
  },
  // close 导航动作
  closeAllMask:function(e){
	   this.setData({
	  	showStatus:false,
	  	showOneTwoStatus:false,
	  	showThreeStatus:false,
	  	indexStatus:-1,
	  })
	  if(!e){
		  this.setData({
			 videoListData:[],
			 pageNumber:1,
			 loadingStatus:0,
		  })
		  this.getListData();
	  }
  },
  // 选择第二行的导航
  selectSecondNav:function(e){
	  const {index,status,title} = e.currentTarget.dataset;
	  let {navList,oneTwoStatus,videoForm} = this.data;
	  navList[status].title = title;
	  oneTwoStatus[status] = index;   // index 0 第一列 index 1 第二
	  this.setData({
		  navList:navList,
		  oneTwoStatus:oneTwoStatus,
	  })
	  if(status==0){
		  videoForm['isHomePage'] = index;
	  }else if(status==1){
		  videoForm['free'] = index;
	  }
	  this.data.videoForm = videoForm;
	  this.closeAllMask();
  },
  // 点击切换导航前两个
  clickNavChangeFirst:function(e){
	  const {index,type} = e.currentTarget.dataset;
	  const {indexStatus,showStatus} = this.data;
	  if(indexStatus==index&&showStatus){
		  this.closeAllMask(true);
	  }else{
		  this.setData({
			  showStatus:true,
			  showOneTwoStatus:true,
			  indexStatus:index,
			  showThreeStatus:index==3
		  })
	  }
  },
  // 滚动到底部的时候进行加载
  scrollAddData:function(){
	if(this.loadingNew) return;
	this.loadingNew = true;
	setTimeout(()=>{
		  this.setData({
			loadingStatus:0
		  })
		 this.getListData()
	},500)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	let title = '视频专区';
	let {navList,videoForm} = this.data;
	const index = SECOND_NAV.indexOf(options.name);
	if(index>-1){
		// 走免费 或者 精品
		navList.push({
			title:options.name,
			type:index,
		})
		videoForm = {
			categoryId:0,
			isHomePage:0,
			free:index,
			keyword:'',
		}
	}else{
		// 走变美百搭 培训 真人
		navList.push({
			title:'免费',
			type:1,
		})
		title = options.name;
		videoForm = {
			pid:options.id,
			categoryId:0,
			isHomePage:0,
			free:1,
			keyword:'',
		}
	}
	this.setData({
		navList:navList,
		oneTwoStatus:[0,index!=-1?index:1],
		showBack:true,
		barTitle:title,
		barHeight:app.globalData.statusBarHeight
	});
	this.data.videoForm = videoForm;
	this.getNavData();
	this.getListData();
	
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
	this.animation = wx.createAnimation({
	  duration: 200,
	  timingFunction: 'ease',
	})
  }
})