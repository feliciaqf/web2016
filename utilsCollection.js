/*！
 * author：ex-qinfang001
 * 不依赖其它库文件
 */
(function(factory){
	"use strict";
	"function"==typeof define&&define.amd?define(factory):"object"==typeof exports?factory():factory()
})(function(){
	"use strict";
	var utils = {};
	/* 数字操作
	 ---------------------------------------------------*/
	utils.ANUMBER = {}
	
	var an = utils.ANUMBER;
	
	/**
	 * 给出的数字个转万个
	 * @param {Number} num 目标数字
	 * @param {Boolean} ignoreNegative 是否忽略负数
	 */
	an.oneTo10k = function(num,ignoreNegative){
		if(ignoreNegative && parseInt(num)<=0){
			return 0;
		}
		num = num/1e4;
		if((num+'').indexOf('.') !== -1){
			if(/\b\d+.\d{4,}\b/.test(num)){
				return num.toFixed(4);
			}
			return num;
		}
		return num;
	}
	
	/**
	 * 延伸:给出的数字按照给出的数量级转换
	 * @param {Number} num 目标数字
	 * @param {Number} order 数量级
	 * @param {Boolean} ignoreNegative 是否忽略负数
	 */
	an.oneToOrder = function(num,order,ignoreNegative){
		if(ignoreNegative && parseInt(num)<=0){
			return 0;
		}
		order = paresInt(order)
		num = num/(10*order);
		if((num+'').indexOf('.') !== -1){
			var reg = new RegExp("\b\d+.\d{"+order +",}\b");
			if(reg.test(num)){
				return num.toFixed(4);
			}
			return num;
		}
		return num;
	}
	
	/* 地址栏URL操作
	 ----------------------------------------------------*/
	utils.AURL = {};
	var au = utils.AURL;
	/**
	 * 从url或给出的url字符串中取参数对应的值
	 * @param {String} name
	 * @param {String} url
	 */
	au.getWebLocationParam = function(name,url){
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	    var r = window.location.search.substr(1).match(reg);
	    if(url){
	    	r = url.split("?")[1].match(reg);
	    }
	    if (r != null) return unescape(r[2]); 
	    return null;
	}
	
})
