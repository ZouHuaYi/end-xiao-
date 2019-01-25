const wxParser = require('../../wxParser/index');
const app = getApp();

Page({
  data: {},
  onLoad: function () {
    let that = this;
	if(app.globalData.templateHtml){
		let html = app.globalData.templateHtml;
		app.globalData.templateHtml = null;
		wxParser.parse({
		  bind: 'richText',
		  html: html,
		  target: that,
		  enablePreviewImage: false, // 禁用图片预览功能
		  tapLink: (url) => { // 点击超链接时的回调函数
			wx.navigateTo({
			  url
			});
		  }
		});
	}
   

  }
})