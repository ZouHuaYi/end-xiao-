var QQMapWX = require('./qqmap-wx-jssdk.min.js');
var qqmapsdk;


function formatTime (fmt,time) { 
	let timer = new Date(time*1000);
	let o = {
		"M+": timer.getMonth() + 1,    //月份 
		"d+": timer.getDate(),         //日 
		"H+": timer.getHours(),        //小时 
		"m+": timer.getMinutes(),      //分 
		"s+": timer.getSeconds(),      //秒 
		"S":  timer.getMilliseconds()  //毫秒 
	};
	if (/(y+)/.test(fmt)){
		fmt = fmt.replace(RegExp.$1, (timer.getFullYear() + "").substr(4 - RegExp.$1.length));
	} 
	for (var k in o){
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
};

// 获取地理位置
function getLongAndLat(callback){
	wx.getSetting({
		success: (res) => {
			if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {//非初始化进入该页面,且未授权
				wx.showModal({
					title: '是否授权当前位置',
					content: '需要获取您的地理位置，请确认授权，否则无法获取您所需数据',
					success: function (res) {
						if (res.cancel) {
							wx.showToast({
								title: '授权失败',
								icon: 'success',
								duration: 1000
							})
							that.setData({
								titleName:'全国'
							})
							that.areaPlace = {};
							that.getHospitalData({});
						} else if (res.confirm) {
							wx.openSetting({
								success: function (dataAu) {
									if (dataAu.authSetting["scope.userLocation"] == true) {
										wx.showToast({
											title: '授权成功',
											icon: 'success',
											duration: 1000
										})
										//再次授权，调用getLocationt的API
										getAreaData(callback);
									} else {
										wx.showToast({
											title: '授权失败',
											icon: 'success',
											duration: 1000
										})
									}
								}
							})
						}
					}
				})
			} else if (res.authSetting['scope.userLocation'] == undefined) {//初始化进入
				wx.getLocation({
					type: 'wgs84',
					success:  (res) =>{
						callback&&callback(res);
					 }
				})  
			} else  { //授权后默认加载
				wx.getLocation({
					type: 'wgs84',
					success:  (res) =>{
						callback&&callback(res);
					}
				})  
			}
		}
	})
 }

qqmapsdk = new QQMapWX({
	key: '5BVBZ-GL3KO-SDXWF-S753K-7D7PK-DWBTX'
});


function getLocalCity(callback){
	getLongAndLat(function(area){
		qqmapsdk.reverseGeocoder({
		  location: {
			latitude: area.latitude,
			longitude: area.longitude
		  },
		  success: (res) => {
				const addressComponent = res.result.address_component;
				callback&&callback(addressComponent);
			}
		});
	})  
 }




module.exports = {
  formatTime: formatTime,
  getLongAndLat: getLongAndLat,
  getLocalCity:getLocalCity
}


