const app = getApp();
Page({

   /**
   * 页面的初始数据
   */
   data: {
	loginStatus:0,
	phone:null,
	vcode:[],
	focusStatus:0,
	verfiyCode:'',
	clickStatus:true
   },
   // 验证码倒计时
   timeFun:function(t){
	 let tim = t;
	 this.setData({
		 clickStatus:true
	 })
	 let timStatus =null;
	 clearInterval(timStatus);
	 timStatus = setInterval(()=>{
	 	tim -= 1;
		app.globalData.loginStatus = tim;
	 	this.setData({
	 		verfiyCode:`${tim}s后可以重新发送`
	 	})
	 	if(tim<=0){
			app.globalData.loginStatus = 0;
	 		clearInterval(timStatus);
	 		this.setData({
	 			verfiyCode:'重新发送',
				clickStatus:false
	 		})
	 	}
	 },1000)	  
   },
   // 登录验证
   loginOk:function(){
		let {vcode,phone,focusStatus} = this.data;
		if(focusStatus<5 || vcode<5){
			wx.showToast({
				title: '请输入验证码',
				icon: 'none',
				duration: 2000
			})
			return
		}   
		let vmycode = vcode.join('');
		app.postRequest("/rest/user/login_by_code",{
			phone: phone,
			code: vmycode
		},data=>{
			if(data.messageCode==129){
				app.globalData.myUserInfo = data.data;
				wx.navigateTo({
					url:"/pages/enLogin/passw/passw?phone="+phone
				})	
			}else if(data.messageCode==900){
				app.globalData.myUserInfo = data.data;
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
					title: data.message?data.message:'该手机号无法识别',
					icon: 'none',
					duration: 2000
				})
			}
		})   
	   
   },
   //输入验证码
    vcodeInput:function(e){
	   let num = e.currentTarget.dataset.num;
	   let vcode = this.data.vcode;
	   let focusStatus = this.data.focusStatus;
	   let text = e.detail.value+'';
	   
	   if(!isNaN(text)&&text.length==6){
		   for(let i=0;i<6;i++){
			  vcode[i] = text[i] 
		   }
		   this.setData({
			   focusStatus:5,
			   vcode:vcode
		   })
		   return;
	   }
	   
	   if(num==focusStatus){
		   if(!text){
// 			  if(focusStatus==0){
// 				 focusStatus = num;
// 			  }else{
// 				 if(!vcode[5]){
// 					 vcode[num-1] = '';
// 					 focusStatus = num -1;
// 				 }
// 			  }
		   }else{
				if(focusStatus<5){
				   focusStatus = num + 1
				}
		   }
	   }
	   
// 	   if(text.length>1){
// 			text = (text+'').substr(1,1);
// 		}
	    vcode[num] = text;
		this.data.vcode = vcode;
	    this.setData({
		   focusStatus:focusStatus
	    })
		
    },
	// 绑定手机 验证吗 密码
	bindAllInput:function(e){
		let status = e.currentTarget.dataset.status
		this.setData({
			[status]:e.detail.value
		})
	},
	// 走下一步
	loginHandler:function(e){
		let phone = this.data.phone;
		let status = e.currentTarget.dataset.status;
		if(app.globalData.loginStatus>0 && status!='reset'){
			wx.navigateTo({
				url:"/pages/enLogin/enLogin?type=code&phone="+this.data.phone
			})
			return;
		}
		if(!phone){
			wx.showToast({
				title: '手机号码不能为空',
				icon: 'none',
				duration: 2000
			})
			return
		}
		if(!/^1\d{10}$/.test(phone)){
			wx.showToast({
				title: '手机号码格式不正确',
				icon: 'none',
				duration: 2000
			})
			return
		}
	
		wx.showLoading({
			title:'正在发送',
			mask:true
		})
		
		app.postRequest("/rest/user/send_code",{
			phone: phone,
			type: 5
		},data=>{
			wx.hideLoading();
			if(data.messageCode==900){
				if(e.currentTarget.dataset.status=="reset") return;
				app.globalData.loginStatus = app.globalData.loginStatus<=0?60:app.globalData.loginStatus;
				wx.navigateTo({
					url:"/pages/enLogin/enLogin?type=code&phone="+this.data.phone
				})
			}else{
				wx.showToast({
					title: data.message?data.message:'发送失败',
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
	if(options.type=='code'){
		this.timeFun(app.globalData.loginStatus);
		this.setData({
			loginStatus:2,
			phone:options.phone
		})
	}else{
		this.setData({
			loginStatus:1
		})
	}
   }
})