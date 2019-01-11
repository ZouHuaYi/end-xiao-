const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
	phone:'',
	passw:'',
	repassw:''
  },
  // 绑定手机 验证吗 密码
  bindAllInput:function(e){
  	let status = e.currentTarget.dataset.status
  	this.setData({
  		[status]:e.detail.value
  	})
  },
  // 确认输入密码
  sureFinish:function(){
	  let {passw,repassw} = this.data;
	  if(!passw){
		  wx.showToast({
			title: '密码不能为空',
			icon: 'none',
			duration: 2000
		  })
		  return;
	   }
	  if(!repassw){
		  wx.showToast({
			title: '确认密码不能为空',
			icon: 'none',
			duration: 2000
		  })
		  return;
	   }
	  if(passw.length<5){
		  wx.showToast({
			title: '设置密码要6位数以上',
			icon: 'none',
			duration: 2000
		  })
		  return;
	   }
	   if(passw!==repassw){
		  wx.showToast({
			title: '两次输入的密码不相同',
			icon: 'none',
			duration: 2000
		  })
		  return;
	    }
	  
	    if(!passw){
	  		  wx.showToast({
	  		  	title: '密码不能为空',
	  		  	icon: 'none',
	  		  	duration: 2000
	  		  })
	  		  return;
	    }
	  
	  
	 app.postRequest("/rest/user/improve_password",{
		 token:app.globalData.myUserInfo.token,
		 password:passw
	 },data=>{
		if(data.messageCode==900){
			app.globalData.tokenStatus = false;
			if(app.globalData.navigateBackUrl){
				wx.reLaunch({
					url:app.globalData.navigateBackUrl
				})
				app.globalData.navigateBackUrl = null;
			}else{
				wx.reLaunch({
					url:"/pages/toPromote/toPromote"
				})
			}
			app.postRequest('/rest/user/open_bind_unbundled',{
				wechat:app.globalData.unionId,
				unionId:app.globalData.unionId,
				id:data.data.id,
				action:0
			},resd=>{
				if(resd.messageCode==900){
					console.log('静默式绑定成功');
				}
			})
		}else{
			wx.showToast({
				title: data.message?data.message:'密码设置不成功',
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
	if(options.phone){
		this.setData({
			phone:options.phone
		})
	}
  }

})