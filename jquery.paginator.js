/*！jQuery 页码插件
 * author:ex-qinfang001
 * depends on jquery
 * Style: .paginator>span + span{margin-left:20px;}.paginator em{font-style: normal;}.paginator .pagination{float:right;}.paginator .pagination span{margin-left:20px;}.paginator .pagination a[rel]{cursor: pointer;}.paginator .pagination a[rel] + a[rel]{margin-left:15px;}.paginator .pagination a[rel].disabled{color:#ccc;cursor: default;}.paginator .btn_go{border-radius: 4px;width:4em;margin-left:10px;}.paginator b{font-style:normal;font-weight: normal;}.pagesize-input,.jump-input{min-width: 2em;width: auto;margin:0 5px;}.paginatorbox{padding:10px 0;}
 */
(function($){
	"use strict";
	var defaults = {
		$container:$('body'),
		currentPage:1,
		totalPage:1,
		totalCount:1,
		pageSize:10,
		perPageLimit:200,
		onPageClicked: null,
        onPageChanged: null,
		content:''
	}
	
	/**
	 * Paginator Constructor
	 * @param element element of the paginator
	 * @param options the options to config the paginator
	 */
	function Paginator(element,options){
		this._init(element,options);
	}
	
	Paginator.prototype = {
		/**
		 * Initialization function of the paginator, accepting an element and the options as parameters
		 * @param element element of the paginator
		 * @param options the options to config the paginator
		 */
		_init :function(element,options){
			this.$element = $(element);
			this.currentPage = 1;
            this.lastPage = 1;

            this.setOptions(options);
            this.initialized = true;
		},
		 /**
         * Update the properties of the paginator element
         * @param options options to config the paginator
         * */
        setOptions: function (options) {
        	this.options = $.extend({},(this.options || defaults),options);
        	
			this.currentPage = parseInt(this.options.currentPage || 1,10);
			this.pageSize = parseInt(this.options.pageSize || 1,10);
			
            this.lastPage = parseInt(this.options.totalPage || 1,10);
            this.totalPage = parseInt(this.options.totalPage || 1,10);
            
            this.totalCount = parseInt(this.options.totalCount || 1,10);
            
            this.content = this.options.content;
            //move the set current page after the setting of total pages. otherwise it will cause out of page exception.
            if (options && typeof (options.currentPage)  !== 'undefined') {
                this.setCurrentPage(options.currentPage);
            }


            //render the paginator
            this.render();

            if (!this.initialized && this.lastPage !== this.currentPage) {
                this.onPageChanged(this.currentPage);
            }

        },
		_listen:function(){
			this.destroy();
			this._setDisabled();
			this.$element.find('[rel]').on("click",$.proxy(this.onPageClicked,this));
			this.$element.find('.pagesize-input').on("blur",$.proxy(this.onPagesizeChanged,this));
		},
		_render:function(){
			var page = this.currentPage,
				totalPage = this.totalPage,
				totalCount = this.totalCount,
				content = this.content;
			
			if(!content){
				this.content = '<div class="paginator">'+
							'<span>共<em class="highlight pc_total">'+totalCount+'</em>条记录</span>'+ // 记录数:共x条记录
							'<span><em class="highlight pn_cur">'+page+'</em>/<em class="highlight pn_total">'+totalPage+'</em>页</span>'+  // 当前页/总页数 ：x/y
							'<span><b contenteditable="true" class="form-input pagesize-input">10</b>条/页</span>'+  // 每页数目：“x/页”
							'<div class="pagination">'+
								'<a rel="first">首页</a><a rel="prev" class="disabled">上一页</a><a rel="next">下一页</a><a rel="last">末页</a>'+ //翻页控制
								'<span>转到<b class="form-input jump-input" contenteditable="true"></b>页<button class="table-button btn_go" rel="go">GO</button></span></div>'+ //跳转页码 :转到__页
						'</div>';
			}
			this.$element.html(this.content);
			this._listen();
		},
		onPageClicked:function(event){
			var $target = $(event.currentTarget),
				type = $target.attr('rel'),
				page = this.currentPage;
			
			if($target.hasClass('disabled')){
				return false;	
			}
			switch(type){
				case "first":
					page = 1;
					break;
				case "last":
					page = totalPage;
					break;
				case "prev":
					page = page - 1;
					break;
				case "next":
					page = page + 1;
					break;
				case "go":
					page = this.validateGo($.trim(this.$element.find('.jump-input').text()));
					break;

			}
			this.currentPage = page;
			this.onPageChanged(this.currentPage);
		},
		validateGo:function(page){
			if(page>this.totalPage) {
				page = this.totalPage; 
			}
			if(page<1 || isNaN(page)) { 
				page = 1;
			}
			return page;
		},
		validatePagesize:function(pagesize){
			var limit = this.options.perPageLimit;
			// limit the pagesize below options attribute perPageLimit
			if(pagesize > limit) {
				pagesize = limit;
				
			} 
			if(pagesize<1) {
				pagesize = 1;
			}
			return pagesize;
		},
		onPagesizeChanged:function(event){
			var limit = this.options.perPageLimit,
				$target = $(event.currentTarget);
			
			this.pagesize = this.validatePagesize($.trim($target.text()));
			$target.text(this.pagesize);
			this.currentPage = 1;
			this.onPageChanged(this.currentPage);
		},
		onPageChanged:function(page){
			this.$element.find(".jump-input").text(page);
			this.$element.find(".pn_cur").html(page);
			this._setDisabled();
			if(typeof(this.options.onPageChanged)==="function"){
				this.options.onPageChanged(page);
			}
		},
		setDisabled:function(){
			var currentPage = this.currentPage,
				totalPage = this.totalPage;
				
			this.$element.find("a[rel].disabled").removeClass("disabled");
			
			// Disabled next page and last page when current page equals totalpage
			if(currentPage === totalPage){
				this.$element.find('a[rel="next"]').addClass("disabled");
				this.$element.find('a[rel="last"]').addClass("disabled");
			}
			
			// Disabled prev page and first page when current page is the first page
			if(currentPage == 1){
				this.$element.find('a[rel="prev"]').addClass("disabled");
				this.$element.find('a[rel="first"]').addClass("disabled");
			}
		},
		/**
         *  Destroys the paginator element, it unload the event first, then empty the content inside.
         * */
        destroy: function () {
			this.$element.find('a[rel]').off("click");
			this.$element.find('.pagesize-input').off("blur");
            this.$element.empty();
        }
	}
	
	
	$.fn.paginator.Constructor = Paginator;
	
	$.fn.paginator = function (option) {
        return $(this).each(function () {
            new Paginator(this, options);
        });
    };
}(window.jQuery))
