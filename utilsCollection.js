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

        /**
	 * 用来得到精确的减法结果
	 */
        an.accSub = function(arg1, arg2){
            var r1, r2, m, n; 
            try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 } 
            try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 } 
            m = Math.pow(10, Math.max(r1, r2)); 
            n = (r1 >= r2) ? r1 : r2; 
            return ((arg1 * m - arg2 * m) / m).toFixed(n); 
        }

        /**
	 * 用来得到精确的加法结果
	 */
        an.accAdd = function(arg1, arg2){
           var r1, r2, m, n; 
           try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 } 
           try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 } 
           m = Math.pow(10, Math.max(r1, r2)); 
           n = (r1 >= r2) ? r1 : r2; 
           return (arg1 * m + arg2 * m) / m; 
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
	
	//数字加逗号
	function addCommas(nStr){
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	}
        
        //摘要:将指定字符串中的格式项替换为指定数组中相应对象的字符串表示形式。
//参数:复合格式字符串。
//返回结果:format的副本，其中的格式项已替换为 args 中相应对象的字符串表示形式。
//应用实例:var str = String.format("S{0}T{1}Twt", "n", "e"); //结果：SnTeTwt
String.format = function () {
    var c = arguments[0], b = arguments[1];
    if (b instanceof Array) {
        for (var a = 0; a < b.length; a++) {
            var b = new RegExp("\\{" + a + "\\}", "gm");
            c = c.replace(b, b[a]);
        }
    } else {
        for (var a = 0; a < arguments.length - 1; a++) {
            var b = new RegExp("\\{" + a + "\\}", "gm");
            c = c.replace(b, arguments[a + 1]);
        }
    }
    return c;
}
 
//摘要:返回字符串字节长度，区分中英文
//参数:将要计算的字符串
//返回结果：字符串实际的字符长字
//应用实例：String.charLength("Sn杨");结果：4
String.charLength = function (c) {
    c = c || '';
    var b = 0;
    for (var a = 0; a < c.length; a++) {
        if ((c.charCodeAt(a) >= 0) && (c.charCodeAt(a) <= 255)) {
            b++
        } else {
            b += 2
        }
    }
    return b
}
 
//摘要:在此实例的结尾追加指定的32位无符号整数的字符串表示形式。
//参数:要追加的值。
//返回结果:val，要追加的字符串。
//应用实例:var str = new StringBuffer("Sn").append("TeTwt");//结果：SnTeTwt
function StringBuilder(val) {
    this._strings = new Array();
    this.append(val);
}
StringBuilder.prototype.append = function (val) {
    this._strings.push(val);
    return this;
}
StringBuilder.prototype.toString = function () {
    var a = (arguments.length == 0) ? "" : arguments[0];
    return this._strings.join(a);
}
 
function numberFormat() { }
//摘要:金钱千位分隔符
//参数:用于分隔的数字
//返回结果:以","分隔和字符串
//应用实例:var nf = new numberFormat().commafy(123456);//结果：123,456
numberFormat.prototype.commafy = function (num) {
    num = num + "";
    var re = /(-?\d+)(\d{3})/;
    while (re.test(num)) {
        num = num.replace(re, "$1,$2");
    }
    return num;
}
//摘要:还原numberFormat()方法
//返回结果:返回浮点数
//应用实例:var nf = new numberFormat().commafyBack("123,456");//结果：123456
numberFormat.prototype.commafyBack = function (num) {
    var x = num.split(',');
    return parseFloat(x.join(""));
}
//摘要:加法函数，用来得到精确的加法结果
//返回结果：arg1加上arg2的精确结果
//应用实例：new numberFormat().add(10.1,10.2); //结果：20.3
numberFormat.prototype.add = function (arg1, arg2) {
    var r1, r2, m;
    try { r1 = arg1.toString().split(".")[1].length; } catch (e) { r1 = 0; }
    try { r2 = arg2.toString().split(".")[1].length; } catch (e) { r2 = 0; }
    m = Math.pow(10, Math.max(r1, r2));
    return (arg1 * m + arg2 * m) / m;
}
//摘要:减法函数，用来得到精确的加法结果
//返回结果：arg1减上arg2的精确结果
//应用实例：new numberFormat().add(10.1,10.2); //结果：-0.1
numberFormat.prototype.sub = function (arg1, arg2) {
    var r1, r2, m;
    try { r1 = arg1.toString().split(".")[1].length; } catch (e) { r1 = 0; }
    try { r2 = arg2.toString().split(".")[1].length; } catch (e) { r2 = 0; }
    m = Math.pow(10, Math.max(r1, r2));
    return (arg1 * m - arg2 * m) / m;
}
//浮点数乘法运算<br>numberFormat.prototype.mul = function (arg1, arg2) {<br>    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();<br>    try { m += s1.split(".")[1].length } catch (e) { }<br>    try { m += s2.split(".")[1].length } catch (e) { }<br>    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)<br>}<br>//浮点数除法运算<br>numberFormat.prototype.div = function (arg1, arg2) {<br>    var t1 = 0, t2 = 0, r1, r2;<br>    try { t1 = arg1.toString().split(".")[1].length } catch (e) { }<br>    try { t2 = arg2.toString().split(".")[1].length } catch (e) { }<br>    with (Math) {<br>        r1 = Number(arg1.toString().replace(".", ""))<br>        r2 = Number(arg2.toString().replace(".", ""))<br>        return (r1 / r2) * pow(10, t2 - t1);<br>    }<br>}
//摘要:返回一个新字符串，该字符串通过在此实例中的字符左侧填充指定的 Unicode 字符来达到指定的总长度，从而使这些字符右对齐。
//参数:
//t(totalWidth):结果字符串中的字符数，等于原始字符数加上任何其他填充字符。
//p(paddingChar):Unicode 填充字符。
//返回结果:与此实例等效的一个新字符串
//应用实例：var str = "1".leftpad(2, "0");结果：01
//左填充
String.prototype.padLeft = function (t, p) {
    var e = []; p = p || "0";
    for (var d = 0, a = t - this.length; d < a; d++) {
        e.push(p);
    }
    e.push(this).j;
    return e.join('');
}
//右填充
String.prototype.padRight = function (t, p) {
    var e = [this]; p = p || "0";
    for (var d = 0, a = t - this.length; d < a; d++) {
        e.push(p);
    }
    return e.join('');
}
 
//摘要:用来打乱一维数组并返回随机数
//参数：
//pool:     指定随机数的数值范围
//min:      最小数值
//max:      最大数值
//count:    返回随机数的个数
//padding:  填充数
//sort:     排序
//应用实例：Math.shuffle({ pool: "123456789", min: 1, max: 9, count: 5 }); 结果：3,6,6,5,1
Math.shuffle = function (h) {
    function extend(s, t) {
        if (!s) {
            return {};
        } if (!s) {
            return s;
        }
        var o = {};
        for (var i in s) {
            o[i] = typeof (t[i]) == 'undefined' ? s[i] : t[i];
        }
        return o;
    }
    var g = extend({
        pool: undefined, //指定随机数的数值范围
        min: 1,          //最小数值
        max: 10,         //最大数值
        count: 5,        //返回随机数的个数
        padding: 0,      //填充数
        sort: false      //排序
    }, h);
    if (g.max < g.count) {
        return [];
    }
    var f;
    if (g.pool) {
        f = g.pool;
    } else {
        f = [];
        for (var e = g.min; e <= g.max; e++) {
            f.push(e);
        }
    }
    var b = [], e = 0;
    while (e < g.count) {
        var c = parseInt((f.length - e) * Math.random(), 10);
        if (g.padding > 0) {
            b.push(f[c].toString().leftpad(g.padding));
        } else {
            b.push(f[c]);
        }
        e++;
        var d = f[c];
        f[c] = f[f.length - e];
        f[f.length - e] = d;
    }
    if (g.sort) {
        b = b.sort(function (j, i) {
            return parseInt(j, 10) - parseInt(i, 10)
        })
    }
    return b;
}
 
//摘要:对象与数组的转换
//参数：对象字面量
//应用实例： var ar = objectToArray({ a: "a",b: "b"});   如：ar[1]，结果：b
var objectToArray = function (b) {
    if (!b) {
        return [];
    }
    var a = [];
    for (m in b) {
        if (!!b[m]) {
            a.push(b[m]);
        }
    }
    return a;
}
 
//摘要:获取和设置当前url查询字符串变量集合，#。
//参数:查询字符串的名称
//返回结果:查询字符串的名称对应的值
//应用实例:/show.html?id=1#page=2
//获取：var a = Request.QueryHaseString.get("page");结果：2
//设置：Request.QueryHaseString.set({ page: 2 });
; (function (l) {
    var a = function () {
        var d, e = {}, b;
        d = window.location.hash.replace(/^#/, "");
        if (d == "") {
            this.uhash = {}
        } else {
            d = d.split("|");
            for (var c = 0; c < d.length; c++) {
                b = d[c].split("=");
                e[b[0]] = b[1]
            }
            this.uhash = e
        }
    };
    a.prototype.set = function (e) {
        var d = [];
        if (arguments.length == 1 && /Object/.test(Object.prototype.toString.call(e))) {
            for (var c in e) {
                if (e.hasOwnProperty(c)) {
                    this.uhash[c] = e[c]
                }
            }
            for (var b in this.uhash) {
                d.push(b + "=" + this.uhash[b])
            }
            window.location.hash = d.join("|")
        } else {
            logger.info("设置hash的参数不正确")
        }
    };
    a.prototype.get = function (b) {
        if (arguments.length == 1) {
            return this.uhash[b]
        } else {
            return this.uhash
        }
    };
    l.QueryHaseString = new a()
})(window.Request = window.Request || {})
 
//摘要:获取当前url参数值
//应用实例：/show.html?a=2
//var c = new Request.URLParser(window.location.href);
//var a = new Request.QueryString(c.getQueryString());
//var b = a.get("a"); //结果：2
var Request = {}
Request.URLParser = function (a) {
    this._fields = {
        Username: 4,
        Password: 5,
        Port: 7,
        Protocol: 2,
        Host: 6,
        Path: 8,
        URL: 0,
        QueryString: 9,
        Fragment: 10
    };
    this._values = {};
    this._regex = null;
    this.version = 0.1;
    this._regex = /^((\w+):\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/;
    for (var b in this._fields) {
        this["get" + b] = this._makeGetter(b)
    }
    if (typeof a != "undefined") {
        this._parse(a)
    }
}
Request.URLParser.prototype.setURL = function (a) {
    this._parse(a)
}
Request.URLParser.prototype._initValues = function () {
    for (var a in this._fields) {
        this._values[a] = ""
    }
}
Request.URLParser.prototype._parse = function (a) {
    this._initValues();
    var b = this._regex.exec(a);
    if (!b) {
        throw "DPURLParser::_parse -> Invalid URL"
    }
    for (var c in this._fields) {
        if (typeof b[this._fields[c]] != "undefined") {
            this._values[c] = b[this._fields[c]]
        }
    }
}
Request.URLParser.prototype._makeGetter = function (a) {
    return function () {
        return this._values[a]
    }
}
Request.QueryString = function (d) {
    var c = d.split("&");
    this.params = {};
    for (var b = 0, a = c.length; b < a; b++) {
        var e = c[b].split("=");
        if (e.length != 2) {
            continue
        }
        this.params[e[0]] = e[1]
    }
}
Request.QueryString.prototype.get = function (a) {
    return this.params[a]
}




	
})
