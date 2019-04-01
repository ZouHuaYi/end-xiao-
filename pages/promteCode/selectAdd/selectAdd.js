const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
	alertStatus:false,
	inputname:'',
	inputprice:'',
	hospitalList:[],
	hospitalId:'',
	selectIdArr:[],
	selectObj:{},
  },
  // 选择动作
  selectActive:function(e){
	 const {pid,id} = e.currentTarget.dataset;
	 let {selectObj,selectIdArr,hospitalList} = this.data;
	 if(selectObj[pid]){
		 const index = selectObj[pid].indexOf(id);
		 if(index>-1){
			selectObj[pid].splice(index,1);
		 }else{
			 if(selectObj[pid].length>=2){
				selectObj[pid].shift();
				selectObj[pid].push(id);
			  }else {
				selectObj[pid].push(id);
			  }
		 }
	 }else{
		selectObj[pid] = []; 
		selectObj[pid].push(id);
	 }
	 selectIdArr = [];
	 for(let i in selectObj){
		 if(selectObj[i].length>0){
			 selectIdArr = selectIdArr.concat(selectObj[i]);
		 }
	 }
	 this.setData({
		selectObj:selectObj,
		selectIdArr:selectIdArr,
		hospitalList:hospitalList.map(item=>{
			item.productMapList = item.productMapList.map(it=>{
				it['on'] = false;
				selectIdArr.forEach(i=>{
					if(i==it.id){
						it['on'] = true;
					}
				})
				return it;
			})
			return item;
		})
	 })
  },
  // 完成项目选择
  finishConfim:function(){
	app.postRequest('/rest/distribution/save/user_product',{
		productIds:JSON.stringify(this.data.selectIdArr),
        limitDays:'',
        token:app.globalData.myUserInfo.token,
	},res=>{
		if(res.messageCode==900){
			wx.navigateBack();
		}else{
			wx.showToast({
				title: res.message?res.message:'添加失败',
				icon: 'none',
				duration: 2000
			})
		}
	})  
  },
  // 显示弹窗
  addShow:function(e){
	  const id = e.currentTarget.dataset.id;
	  console.log(id)
	  this.setData({
		  hospitalId:id,
		  alertStatus:true,
	  })
  },
  // input 框输入值
  inputFun:function(e){
	  const key = e.currentTarget.dataset.key;
	  this.setData({
		  [key]:e.detail.value
	  })
  },
  // 提交保存
  comfigFun:function(e){
	const {inputname,inputprice,hospitalId} = this.data;
	if(inputname==''){
		wx.showToast({
			title: '商品名称不能为空',
			icon: 'none',
			duration: 2000
		})
		return;
	}
	if(inputprice==''|| isNaN(inputprice)){
		wx.showToast({
			title: '商品价格不能为空或格式不正确',
			icon: 'none',
			duration: 2000
		})
		return;
	}
	app.postRequest('/rest/business/relateuser/service/product/addOrUpdate',{
		 token:app.globalData.myUserInfo.token,
		  id:'',
		  hospitalId:hospitalId,
		  title:inputname,
		  price:inputprice,
	},res=>{
		if(res.messageCode==900){
			this.cancalFun();
			this.getHospitalData();
		}else{
			wx.showToast({
				title: res.message?res.message:'添加失败',
				icon: 'none',
				duration: 2000
			})
		}
	})
  },
  // 取消按钮
  cancalFun:function(){
	this.setData({
		alertStatus:false,
	})  
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	this.setData({
		goHome:options.share?true:false,
		showBack:options.share?false:true,
		barHeight:app.globalData.statusBarHeight,
		barTitle: '选择项目'
	})
	this.getHospitalData();
  },
  // 获取医院的数据
  getHospitalData(){
	  app.postRequest('/rest/distribution/user_product_list',{
		  token:app.globalData.myUserInfo.token,
	  },res=>{
		  if(res.messageCode==900){
			 this.setData({
				 hospitalList:res.data
			 }) 
		  }else{
			  wx.showToast({
			  	title: res.message?res.message:'添加失败',
			  	icon: 'none',
			  	duration: 2000
			  })
		  }
	  })
  }
 
})