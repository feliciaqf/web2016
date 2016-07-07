(function(factory){
	"use strict";
	"function"==typeof define&&define.amd?define(["jquery"],factory):"object"==typeof exports?factory(require("jquery")):factory(jQuery)
})(function($){
	"use strict";
	var defaults = {
		cancel: "input,textarea,button,select,option",
		delay: 0,
		appendTo: "body",
		autoRefresh: true,
		distance: 0,
		filter: "*",
		tolerance: "touch",

		// callbacks
		selected: null,
		selecting: null,
		start: null,
		stop: null,
		unselected: null,
		unselecting: null
	};
	$.fn.selectable = function(options){
		return this.each(function() {
			new Selectable(this, options);
		})
	}
	$.isIE = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );
	
	function Selectable(element,options){
		this.element = $(element);
		this.options = $.extend({},defaults,options);
		this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
		this._init();
	}
	var mouseHandled = false;
	Selectable.prototype = {
		_init:function(){
			this._create();
		},
		_create:function(){
			var selectees,
			that = this;

			this.element.addClass("selectable");
	
			this.dragged = false;
	
			// cache selectee children based on filter
			this.refresh = function() {
				selectees = $(that.options.filter, that.element[0]);
				selectees.addClass("selectee");
				selectees.each(function() {
					var $this = $(this),
						pos = $this.offset();
					$.data(this, "selectable-item", {
						element: this,
						$element: $this,
						left: pos.left,
						top: pos.top,
						right: pos.left + $this.outerWidth(),
						bottom: pos.top + $this.outerHeight(),
						startselected: false,
						selected: $this.hasClass("selected"),
						selecting: $this.hasClass("selecting"),
						unselecting: $this.hasClass("unselecting")
					});
				});
			};
			this.refresh();
	
			this.selectees = selectees.addClass("selectee");
	
			this._mouseInit();
	
			this.helper = $("<div class='selectable-helper'></div>");
			
		},
		_destroy: function() {
			this.selectees
				.removeClass("selectee")
				.removeData("selectable-item");
			this.element
				.removeClass("selectable selectable-disabled");
			this._mouseDestroy();
		},
		_trigger: function( type, event, data ) {
			var prop, orig,
				callback = this.options[ type ];
	
			data = data || {};
			event = $.Event( event );
			event.type = type;
			// the original event may come from any element
			// so we need to reset the target on the new event
			event.target = this.element[ 0 ];
	
			// copy original event properties over to the new event
			orig = event.originalEvent;
			if ( orig ) {
				for ( prop in orig ) {
					if ( !( prop in event ) ) {
						event[ prop ] = orig[ prop ];
					}
				}
			}
	
			this.element.trigger( event, data );
			return !( $.isFunction( callback ) &&
				callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
				event.isDefaultPrevented() );
		},
		_mouseInit: function() {
			var that = this;
	
			this.element
				.bind("mousedown", function(event) {
					return that._mouseDown(event);
				})
				.bind("click", function(event) {
					if (true === $.data(event.target, "preventClickEvent")) {
						$.removeData(event.target, "preventClickEvent");
						event.stopImmediatePropagation();
						return false;
					}
				});
	
			this.started = false;
		},
	
		// TODO: make sure destroying one instance of mouse doesn't mess with
		// other instances of mouse
		_mouseDestroy: function() {
			if ( this._mouseMoveDelegate ) {
				this.document
					.unbind("mousemove", this._mouseMoveDelegate)
					.unbind("mouseup", this._mouseUpDelegate);
			}
		},
	
		_mouseDown: function(event) {
			// don't let more than one widget handle mouseStart
			if ( mouseHandled ) {
				return;
			}
	
			this._mouseMoved = false;
	
			// we may have missed mouseup (out of window)
			(this._mouseStarted && this._mouseUp(event));
	
			this._mouseDownEvent = event;
	
			var that = this,
				btnIsLeft = (event.which === 1),
				// event.target.nodeName works around a bug in IE 8 with
				// disabled inputs (#7620)
				elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
			if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
				return true;
			}
	
			this.mouseDelayMet = !this.options.delay;
			if (!this.mouseDelayMet) {
				this._mouseDelayTimer = setTimeout(function() {
					that.mouseDelayMet = true;
				}, this.options.delay);
			}
	
			if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
				this._mouseStarted = (this._mouseStart(event) !== false);
				if (!this._mouseStarted) {
					event.preventDefault();
					return true;
				}
			}
	
			// Click event may never have fired (Gecko & Opera)
			if (true === $.data(event.target, "preventClickEvent")) {
				$.removeData(event.target,"preventClickEvent");
			}
	
			// these delegates are required to keep context
			this._mouseMoveDelegate = function(event) {
				return that._mouseMove(event);
			};
			this._mouseUpDelegate = function(event) {
				return that._mouseUp(event);
			};
	
			this.document
				.bind( "mousemove", this._mouseMoveDelegate )
				.bind( "mouseup", this._mouseUpDelegate );
	
			event.preventDefault();
	
			mouseHandled = true;
			return true;
		},
	
		_mouseMove: function(event) {
			// Only check for mouseups outside the document if you've moved inside the document
			// at least once. This prevents the firing of mouseup in the case of IE<9, which will
			// fire a mousemove event if content is placed under the cursor. See #7778
			// Support: IE <9
			if ( this._mouseMoved ) {
				// IE mouseup check - mouseup happened when mouse was out of window
				if ($.isIE && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
					return this._mouseUp(event);
	
				// Iframe mouseup check - mouseup occurred in another document
				} else if ( !event.which ) {
					return this._mouseUp( event );
				}
			}
	
			if ( event.which || event.button ) {
				this._mouseMoved = true;
			}
	
			if (this._mouseStarted) {
				this._mouseDrag(event);
				return event.preventDefault();
			}
	
			if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
				this._mouseStarted =
					(this._mouseStart(this._mouseDownEvent, event) !== false);
				(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
			}
	
			return !this._mouseStarted;
		},
	
		_mouseUp: function(event) {
			this.document
				.unbind( "mousemove", this._mouseMoveDelegate )
				.unbind( "mouseup", this._mouseUpDelegate );
	
			if (this._mouseStarted) {
				this._mouseStarted = false;
	
				if (event.target === this._mouseDownEvent.target) {
					$.data(event.target,"preventClickEvent", true);
				}
	
				this._mouseStop(event);
			}
	
			mouseHandled = false;
			return false;
		},
	
		_mouseDistanceMet: function(event) {
			return (Math.max(
					Math.abs(this._mouseDownEvent.pageX - event.pageX),
					Math.abs(this._mouseDownEvent.pageY - event.pageY)
				) >= this.options.distance
			);
		},
	
		_mouseDelayMet: function(/* event */) {
			return this.mouseDelayMet;
		},

		_mouseStart: function(event) {
			var that = this,
				options = this.options;
	
			this.opos = [ event.pageX, event.pageY ];
	
			if (this.options.disabled) {
				return;
			}
	
			this.selectees = $(options.filter, this.element[0]);
	
			this._trigger("start", event);
	
			$(options.appendTo).append(this.helper);
			// position helper (lasso)
			this.helper.css({
				"left": event.pageX,
				"top": event.pageY,
				"width": 0,
				"height": 0
			});
	
			if (options.autoRefresh) {
				this.refresh();
			}
	
			this.selectees.filter(".selected").each(function() {
				var selectee = $.data(this, "selectable-item");
				selectee.startselected = true;
				if (!event.metaKey && !event.ctrlKey) {
					selectee.$element.removeClass("selected");
					selectee.selected = false;
					selectee.$element.addClass("unselecting");
					selectee.unselecting = true;
					// selectable UNSELECTING callback
					that._trigger("unselecting", event, {
						unselecting: selectee.element
					});
				}
			});
	
			$(event.target).parents().addBack().each(function() {
				var doSelect,
					selectee = $.data(this, "selectable-item");
				if (selectee) {
					doSelect = (!event.metaKey && !event.ctrlKey) || !selectee.$element.hasClass("selected");
					selectee.$element
						.removeClass(doSelect ? "unselecting" : "selected")
						.addClass(doSelect ? "selecting" : "unselecting");
					selectee.unselecting = !doSelect;
					selectee.selecting = doSelect;
					selectee.selected = doSelect;
					// selectable (UN)SELECTING callback
					if (doSelect) {
						that._trigger("selecting", event, {
							selecting: selectee.element
						});
					} else {
						that._trigger("unselecting", event, {
							unselecting: selectee.element
						});
					}
					return false;
				}
			});
	
		},
	
		_mouseDrag: function(event) {
	
			this.dragged = true;
	
			if (this.options.disabled) {
				return;
			}
	
			var tmp,
				that = this,
				options = this.options,
				x1 = this.opos[0],
				y1 = this.opos[1],
				x2 = event.pageX,
				y2 = event.pageY;
	
			if (x1 > x2) { tmp = x2; x2 = x1; x1 = tmp; }
			if (y1 > y2) { tmp = y2; y2 = y1; y1 = tmp; }
			this.helper.css({ left: x1, top: y1, width: x2 - x1, height: y2 - y1 });
	
			this.selectees.each(function() {
				var selectee = $.data(this, "selectable-item"),
					hit = false;
	
				//prevent helper from being selected if appendTo: selectable
				if (!selectee || selectee.element === that.element[0]) {
					return;
				}
	
				if (options.tolerance === "touch") {
					hit = ( !(selectee.left > x2 || selectee.right < x1 || selectee.top > y2 || selectee.bottom < y1) );
				} else if (options.tolerance === "fit") {
					hit = (selectee.left > x1 && selectee.right < x2 && selectee.top > y1 && selectee.bottom < y2);
				}
	
				if (hit) {
					// SELECT
					if (selectee.selected) {
						selectee.$element.removeClass("selected");
						selectee.selected = false;
					}
					if (selectee.unselecting) {
						selectee.$element.removeClass("unselecting");
						selectee.unselecting = false;
					}
					if (!selectee.selecting) {
						selectee.$element.addClass("selecting");
						selectee.selecting = true;
						// selectable SELECTING callback
						that._trigger("selecting", event, {
							selecting: selectee.element
						});
					}
				} else {
					// UNSELECT
					if (selectee.selecting) {
						if ((event.metaKey || event.ctrlKey) && selectee.startselected) {
							selectee.$element.removeClass("selecting");
							selectee.selecting = false;
							selectee.$element.addClass("selected");
							selectee.selected = true;
						} else {
							selectee.$element.removeClass("selecting");
							selectee.selecting = false;
							if (selectee.startselected) {
								selectee.$element.addClass("unselecting");
								selectee.unselecting = true;
							}
							// selectable UNSELECTING callback
							that._trigger("unselecting", event, {
								unselecting: selectee.element
							});
						}
					}
					if (selectee.selected) {
						if (!event.metaKey && !event.ctrlKey && !selectee.startselected) {
							selectee.$element.removeClass("selected");
							selectee.selected = false;
	
							selectee.$element.addClass("unselecting");
							selectee.unselecting = true;
							// selectable UNSELECTING callback
							that._trigger("unselecting", event, {
								unselecting: selectee.element
							});
						}
					}
				}
			});
	
			return false;
		},
	
		_mouseStop: function(event) {
			var that = this;
	
			this.dragged = false;
	
			$(".unselecting", this.element[0]).each(function() {
				var selectee = $.data(this, "selectable-item");
				selectee.$element.removeClass("unselecting");
				selectee.unselecting = false;
				selectee.startselected = false;
				that._trigger("unselected", event, {
					unselected: selectee.element
				});
			});
			$(".selecting", this.element[0]).each(function() {
				var selectee = $.data(this, "selectable-item");
				selectee.$element.removeClass("selecting").addClass("selected");
				selectee.selecting = false;
				selectee.selected = true;
				selectee.startselected = true;
				that._trigger("selected", event, {
					selected: selectee.element
				});
			});
			this._trigger("stop", event);
	
			this.helper.remove();
	
			return false;
		},
		_mouseCapture: function(/* event */) { return true; }
	}
});
