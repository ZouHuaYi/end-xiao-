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
		secondTeam:[]
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
		app.postRequest('/rest/distribution/team',{
			token:app.globalData.myUserInfo.token,
			userId:opt.userid,
			hospitalId:opt.hospitalid,
		},res=>{
			if(res.messageCode==900){
				const {firstStatistics,firstTeam,secondStatistics,secondTeam} = res.data;
				this.setData({
					firstStatistics:firstStatistics.map((el,key)=>{
						el.packageTypw = el.packageTypw>0?String.fromCharCode(parseInt(el.packageTypw)+64):'';
						el.total = el.sumFreePerformance+el.sumMultiplePerformance;
						return el
					}),
					firstTeam:firstTeam.map((el,key)=>{
						el.packageType = el.packageType>0?String.fromCharCode(parseInt(el.packageType)+64):'';
						el.total = el.multiplePerformance + el.freePerformance;
						return el;
					}),
					secondStatistics:secondStatistics.map((el,key)=>{
						el.packageTypw = el.packageTypw>0?String.fromCharCode(parseInt(el.packageTypw)+64):'';
						el.total = el.sumFreePerformance+el.sumMultiplePerformance;
						return el
					}),
					secondTeam:secondTeam.map((el,key)=>{
						el.packageType = el.packageType>0?String.fromCharCode(parseInt(el.packageType)+64):'';
						el.total = el.multiplePerformance + el.freePerformance;
						return el;
					}),
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
			barTitle:'我的团队',
			barHeight:app.globalData.statusBarHeight
		})
		if(options.userid){
			this.getTeamData(options)
		}
  }
})