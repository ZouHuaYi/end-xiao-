
const ROOT = 'https://test.topmei3mei.com'


var postRequest = function(url,data,callback){
	if(data && Object.keys(data).length>0){
		let keys =  Object.keys(data);
		data = encodeURI(keys.map(name => `${name}=${data[name]}`).join("&"));
	}else{
		data = {}
	}
	wx.request({
		url:ROOT+url,
		data:data,
		method:"POST",
		header:{
			"content-type":"application/x-www-form-urlencoded"
		},
		dataType:"JSON",
		success:data=>{
				try{
					callback&&callback(JSON.parse(data.data));
				}catch(e){
					wx.hideLoading()
				}
		},
		fail:error=>{
			wx.hideLoading()
			wx.showToast({
			  title: '网络开小差啦!!!',
			  icon: 'none',
			  duration: 2000
			})
		}
	})
}

var getRequest = function(url,data,callback){
	wx.request({
		url:ROOT+url,
		data:data,
		method:"GET",
		header:{
			"content-type":"application/x-www-form-urlencoded"
		},
		dataType:"JSON",
		success:data=>{
			try{
				callback&&callback(JSON.parse(data.data));
			}catch(e){
				wx.hideLoading()
			}
		},
		fail:error=> {
			wx.hideLoading()
			wx.showToast({
			title: '网络开小差啦!!!',
			icon: 'none',
			duration: 2000
			})
		}
	})
}


module.exports={
	postRequest,
	getRequest
}

