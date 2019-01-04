var address = require('../../../utils/city.js')
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
		animationAddressMenu: {},
    addressMenuIsShow: false,
    value: [0, 0, 0],
    provinces: [],
    citys: [],
    areas: [],
    areaInfo:'',
		receivePhone:'',
		receiveName:'',
		address:''
  },
	// 输入文本框的形象
	inputInfo:function(e){
		let key = e.currentTarget.dataset.key;
		let value = e.detail.value;
		this.setData({
			[key]:value
		})
	},
	// 点击提交数据
	saveUpArea:function(){
		let {id,areaInfo,receivePhone,receiveName,address} =this.data;
		if(!receiveName){
			wx.showToast({
				title: '收件人姓名不能为空',
				icon: 'none',
				duration: 2000
			})
			return;
		}
		if(!receivePhone){
			wx.showToast({
				title: '联系电话不能为空',
				icon: 'none',
				duration: 2000
			})
			return;
		}
		if(!areaInfo){
			wx.showToast({
				title: '所在地址不能为空',
				icon: 'none',
				duration: 2000
			})
			return;
		}
		if(!address){
			wx.showToast({
				title: '详细地址不能为空',
				icon: 'none',
				duration: 2000
			})
			return;
		}	
		if(this.add=='add'){
			app.postRequest('/rest/address/add',{
				token:app.globalData.myUserInfo.token,
				userId:app.globalData.myUserInfo.id,
				area:areaInfo,
				receivePhone:receivePhone,
				receiveName:receiveName,
				address:address
			},data=>{
				if(data.messageCode==900){
					wx.showToast({
						title: '添加成功',
						icon: 'none',
						duration: 2000
					})
					setTimeout(()=>{
						wx.navigateBack()
					},2000)
				}else{
					wx.showToast({
						title: data.message,
						icon: 'none',
						duration: 2000
					})
				}
			})
		}else{
			app.postRequest('/rest/address/update',{
				token:app.globalData.myUserInfo.token,
				id:id,
				area:areaInfo,
				receivePhone:receivePhone,
				receiveName:receiveName,
				address:address
			},data=>{
				if(data.messageCode==900){
					wx.showToast({
						title: '修改成功',
						icon: 'none',
						duration: 2000
					})
					setTimeout(()=>{
						wx.navigateBack()
					},2000)
				}else{
					wx.showToast({
						title: data.message,
						icon: 'none',
						duration: 2000
					})
				}
			})
		}
	},
	// 点击所在地区弹出选择框
  selectDistrict: function (e) {
    var that = this
    // 如果已经显示，不在执行显示动画
    if (that.data.addressMenuIsShow) {
      return
    }
    // 执行显示动画
    that.startAddressAnimation(true)
  },
  // 执行动画
  startAddressAnimation: function (isShow) {
    var that = this
    if (isShow) {
      // vh是用来表示尺寸的单位，高度全屏是100vh
      that.animation.translateY(0 + 'vh').step()
    } else {
      that.animation.translateY(40 + 'vh').step()
    }
    that.setData({
      animationAddressMenu: that.animation.export(),
      addressMenuIsShow: isShow,
    })
  },
  // 点击地区选择取消按钮
  cityCancel: function (e) {
    this.startAddressAnimation(false)
  },
  // 点击地区选择确定按钮
  citySure: function (e) {
    var that = this
    var city = that.data.city
    var value = that.data.value
    that.startAddressAnimation(false)
    // 将选择的城市信息显示到输入框
    var areaInfo = that.data.provinces[value[0]].name + that.data.citys[value[1]].name + that.data.areas[value[2]].name
    that.setData({
      areaInfo: areaInfo,
    })
  },
  // 点击蒙版时取消组件的显示
  hideCitySelected: function (e) {
    this.startAddressAnimation(false)
  },
  // 处理省市县联动逻辑
  cityChange: function (e) {
    let value = e.detail.value
    let provinces = this.data.provinces
    let citys = this.data.citys
    let areas = this.data.areas
    let provinceNum = value[0]
    let cityNum = value[1]
    let countyNum = value[2]
    // 如果省份选择项和之前不一样，表示滑动了省份，此时市默认是省的第一组数据，
    if (this.data.value[0] != provinceNum) {
      let id = provinces[provinceNum].id
      this.setData({
        value: [provinceNum, 0, 0],
        citys: address.citys[id],
        areas: address.areas[address.citys[id][0].id],
      })
    } else if (this.data.value[1] != cityNum) {
      // 滑动选择了第二项数据，即市，此时区显示省市对应的第一组数据
      let id = citys[cityNum].id
      this.setData({
        value: [provinceNum, cityNum, 0],
        areas: address.areas[citys[cityNum].id],
      })
    } else {
      // 滑动选择了区
      this.setData({
        value: [provinceNum, cityNum, countyNum]
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		if(options.id){
			this.data.id = options.id;
			if(app.globalData.areaSelect){
				let {area,receivePhone,receiveName,address} = app.globalData.areaSelect;
				this.setData({
					areaInfo:area,
					receivePhone:receivePhone,
					receiveName:receiveName,
					address:address
				})
				app.globalData.areaSelect = null;
			}
		}
		if(options.add=='add'){
			this.add = options.add;
		}
		var id = address.provinces[0].id
    this.setData({
      provinces: address.provinces,
      citys: address.citys[id],
      areas: address.areas[address.citys[id][0].id],
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
		this.animation = wx.createAnimation({
      duration: 500,
  	  timingFunction: 'ease',
    })
  }
})
