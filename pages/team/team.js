const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
		indexNum:0,
		firstStatistics:[],
		firstTeam:[],
		secondStatistics:[],
		secondTeam:[],
		loadingEnd:false,
  },
	//切换的时候
	changeBanner:function(e){
		const index = e.detail.current;
			this.setData({
			indexNum:index
		})
	},
	// 导航点击
	navClick:function(e){
		const index = e.currentTarget.dataset.index;
		this.setData({
			indexNum:index
		})
	},
	// 获取团队数据
	getTeamData:function(opt){
		wx.showLoading({
			title:"正在加载",
			mask:true
		})
		app.postRequest('/rest/distribution/team',{
			token:  app.globalData.myUserInfo.token,
			userId: parseInt(opt.userid),
			hospitalId:parseInt(opt.hospitalid),
		},res=>{
			this.setData({
				loadingEnd:true
			})
			wx.hideLoading();
			if(res.messageCode==900){
				const {firstStatistics,firstTeam,secondStatistics,secondTeam} = res.data;
				this.setData({
					firstStatistics:firstStatistics?firstStatistics.map((el,key)=>{
						el.packageTypw = el.packageTypw>0?String.fromCharCode(parseInt(el.packageTypw)+64):'无';
						el.total = el.sumFreePerformance+el.sumMultiplePerformance;
						return el
					}):[],
					firstTeam:firstTeam?firstTeam.map((el,key)=>{
						el.packageType = el.packageType>0?String.fromCharCode(parseInt(el.packageType)+64):'无';
						el.total = el.multiplePerformance + el.freePerformance;
						return el;
					}):[],
					secondStatistics:secondStatistics?secondStatistics.map((el,key)=>{
						el.packageTypw = el.packageTypw>0?String.fromCharCode(parseInt(el.packageTypw)+64):'无';
						el.total = el.sumFreePerformance+el.sumMultiplePerformance;
						return el
					}):[],
					secondTeam:secondTeam?secondTeam.map((el,key)=>{
						el.packageType = el.packageType>0?String.fromCharCode(parseInt(el.packageType)+64):'无';
						el.total = el.multiplePerformance + el.freePerformance;
						return el;
					}):[],
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
			barTitle:options.title?options.title:'我的团队',
			barHeight:app.globalData.statusBarHeight
		})
	
		if(options.userid){
			this.getTeamData(options)
		}
    },
	onShareAppMessage:function(){
		const share = app.allShareData();
		return share;
	}
})