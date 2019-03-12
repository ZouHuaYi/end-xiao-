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

module.exports = {
  formatTime: formatTime
}
