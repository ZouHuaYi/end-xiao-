const app = getApp();
import {formatTime} from '../../../utils/util';
Page({

    /**
    * 页面的初始数据
    */
    data: {
		scrollStatus:false,
		members:-1,
		detailData:{},
		chargeStatus:-1,
		commentList:[],
		inputValue:'',
		userId:null,
   },
   // 点赞
   giveVideoLike:function(e){
	   const {id,token} = app.globalData.myUserInfo; 
	   const status = e.currentTarget.dataset.status;
	   let { detailData} = this.data;
	 app.postRequest("/rest/like/like_or_cancellike",{
		 postId:this.options.id,
		 userId:id,
		 action:status?0:1,
		 type:12,
		 token:token,
	 },res=>{
		if(res.messageCode==900){
			 detailData.isLike = !status;
			 detailData.likeNum = status?detailData.likeNum-1:detailData.likeNum+1;
			 this.setData({
				 detailData:detailData
			 })
		}
	 })  
   },
   // 删除评论
   deleteComment:function(e){
	   wx.showModal({
		  title: '温馨提示',
		  content: '是否要删除该评论？删除后数据无法恢复。',
		  success:(res)=>{
			if (res.confirm) {
				const ids = e.currentTarget.dataset.id;
				const {id,token} = app.globalData.myUserInfo;
				app.postRequest("/rest/comment/delete",{
					userId:id,
					type:12,
					id:ids,
					token:token,
				},res=>{
					const {detailData} = this.data;
					detailData.commentNum -= 1; 
					this.getCommnetData(id,this.options.id);
					this.setData({
						detailData:detailData
					})
				})
			} 
		  }
		})
   },
   // 视频评论
	giveCommentVideo:function(e){
		const content = e.detail.value;
		if(content.trim()==''){
			wx.showToast({
				title: '评论不能为空',
				icon: 'none',
				duration: 2000
			})
			return;
		}
		const {id,token} = app.globalData.myUserInfo
		app.postRequest("/rest/comment/add",{
			postId:this.options.id,
			content:content,
			starNum:0,
			type:12,
			userId:id,
			token:token,
		},res=>{
			if(res.messageCode==900){
				this.getCommnetData(id,this.options.id);
				const {detailData} = this.data;
				detailData.commentNum += 1; 
				this.setData({
					inputValue:'',
					detailData:detailData
				})
			}else{
				wx.showToast({
					title: res.message?res.message:'评论失败',
					icon: 'none',
					duration: 2000
				})
			}
		})
	},
	// 获取视频详细页的数据
	getDetailData:function(opt){
		if(this.data.members==0){
			// 没有选集
			const {id,token} = app.globalData.myUserInfo;
			app.postRequest('/rest/train/detail',{
				id:opt.id,
				userId:id,
				token:token				
			},res=>{
				if(res.messageCode==900){
					const chargeStatus = res.data.priceTag=='免费'||res.data.priceTag=='已购买'?0:1;
					this.setData({
						detailData:res.data,
						chargeStatus:chargeStatus
					})
					this.getCommnetData(id,opt.id);
				}else{
					wx.showToast({
						title: res.message,
						icon: 'none',
						duration: 2000
					})
				}
			})
		}else if(opt.members==1){
			// 有选集
			
		}
	},
	// 购买视频的函数
	pay:function(e){
		const {id} = e.currentTarget.dataset;
		app.postRequest('/rest/train/buy',{
			userId:app.globalData.myUserInfo.id,
			trainId:id,
			payType:6,
			openid:app.globalData.openId
		},data=>{
				if(data.messageCode==900){
				  let {timestamp,total_fee,noncestr,partnerid,prepayid,sign} = data.data;
					wx.requestPayment({
						timeStamp: String(timestamp),
						nonceStr: noncestr,
						package: `prepay_id=${prepayid}`,
						signType: 'MD5',
						paySign: sign,
						total_fee:total_fee,
						success:res=> { 
							  wx.showToast({
								title: '支付成功',
								icon: 'none',
								duration: 2000
							  }) 
								this.setData({
									chargeStatus:0
								})
						  },
						 fail:res=> {
						   wx.showToast({
							title: '支付失败',
							icon: 'none',
							duration: 2000
						  }) 
						}
				   })
				}else{
					wx.showToast({
						title: data.message,
						icon: 'none',
						duration: 2000
					}) 
				}
		})
	},
    // 获取评论
	getCommnetData:function(userId,postId){
		app.postRequest('/rest/comment/list',{
			page:1,
			rows:100,
			userId:userId,
			postId:postId,
			type:12,
			token:app.globalData.myUserInfo.token,
		},res=>{
			if(res.messageCode==900){
				this.setData({
					commentList:res.data.map((el,key)=>{
						el.time = formatTime('MM-dd HH:ss',el.createTime);
						return el;
					})
				})
			}
		})
	},
	// 滚动事件
	scrollVideo:function(e){
	  const top = e.detail.scrollTop;
	  if(top<=60){
		  this.setData({
			scrollStatus:false
		  })
	  }else{
		  this.setData({
		  	scrollStatus:true
		  })
	  }
	},
  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		this.setData({
			showBack:options.share?false:true,
			goHome:options.share?true:false,
			barTitle:'视频详情',
			barHeight:app.globalData.statusBarHeight,
			members:options.members?options.members:0
		});
		if(app.loginTest()) return;
		if(app.globalData.myUserInfo){
			this.getDetailData(options);
			this.setData({
				userId:app.globalData.myUserInfo.id
			})
		}else{
			app.userInfoReadyCallback = info => {		
				this.getDetailData(options);
				this.setData({
					userId:app.globalData.myUserInfo.id
				})
			}
		}
		this.options = options;
	},
    /**
     * 用户点击右上角分享
    */
	onShareAppMessage: function () {
		return{
			path: `/pages/videoList/detail/detail?id=${this.options.id}&members=${this.options.members}&share=true`,
			success: function (res) {},
			fail: function (res) {}
		}
	}
})