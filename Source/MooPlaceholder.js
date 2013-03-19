var MooPlaceholder, $mooplaceholder;

(function($,$$) {

MooPlaceholder = new Class;

MooPlaceholder.extend({

  isSupportedNatively : function() {
    return Browser.ie && Browser.version < 10;
  } 

});

MooPlaceholder.implement({

  Binds : [
    'focus','blur','clear','wait',
    'isEmpty','hasValue',
    'getForm','getElement',
    'onInput','onFormSubmit','onFocus','onBlur'
  ],

	Implements:[Options,Events],

	options : {
    skipIfNativelySupported : false,
    selector : '.placeholder',
    formSelector : 'form',
		focusClass:'focus',
		blurClass:'blur',
		clearOnFocus:true,
		defaultValue:true,
		delay:200,
    keyEvents : ['keydown','keyup','keydata','change']
	},

	initialize : function(element,options) {
		this.element = $(element);
		this.setOptions(options);
    if(this.options.skipIfNativelySupported && MooPlaceholder.isSupportedNatively()) {
      return; //The placeholder feature is natively supported no need to use this
    }

		this.element.store('MooPlaceholder',this);
    this.options.defaultValue = this.getPlaceholderFromElement();
    this.setupEvents();
		this.blur();

    this.element.removeAttribute('placeholder');
	},

  getDefaultValue : function() {
		if(this.options.defaultValue===true) {
      this.options.defaultValue = this.getPlaceholderFromElement();
    }
    return this.options.defaultValue;
  },

  getPlaceholderFromElement : function() {
    var e = this.getElement();
    return e.get('placeholder') || e.getAttribute('placeholder') || e.get('data-placeholder') || this.getValue();
  },

  setupEvents : function() {
    var e = this.getElement(), fn = this.onInput;
    this.options.keyEvents.each(function(event) {
      e.addEvent(event,fn);
    },this);

		this.getElement().addEvents({
			'focus':this.focus,
			'blur':this.blur
		});

    var form = this.getForm();
		if(!form.retrieve('placeholder-setup')) {
		  form.addEvent('submit',this.onFormSubmit);
      form.store('placeholder-setup',true);
		}
  },

  setPlaceholder : function(value) {
    this.options.defaultValue = value;
  },

  getPlaceholder : function() {
    return this.getDefaultValue();
  },

	clear:function() {
		this.element.value='';
		this.fireEvent('clear');
	},

	hasValue : function() {
		var value = this.getValue();
		return value && value.length>0 && value != this.getDefaultValue();
	},

  isEmpty : function() {
    return this.getValue().length == 0;
  },

	focus : function() {
		if(this.options.focusClass) {
			if(!this.element.hasClass(this.options.focusClass)) {
				this.element.addClass(this.options.focusClass);	
				if((this.options.clearOnFocus && !this.hasValue()) || this.isEmpty()) {
					this.clear();	
				}
			}
		}
		this.element.removeClass(this.options.blurClass);	
    this.onFocus();
	},

	blur : function() {
		this.element.removeClass(this.options.focusClass);	
		if(!this.hasValue()) {
			if(this.options.blurClass) {
				this.element.addClass(this.options.blurClass);	
			}
			this.element.value = this.getDefaultValue();
		}
    this.onBlur();
	},

  isBlur : function() {
    return this.element.hasClass(this.options.blurClass);
  },

  isFocus : function() {
    return this.element.hasClass(this.options.focusClass);
  },

	wait : function() {
    this.clearWaitTimeout();
		if(this.hasValue()) {
			this.fireEvent('search',[this.getValue()]);
		}
	},

	getValue : function() {
		return this.element.get('value');	
	},

  toString : function() {
    return this.getValue();
  },

  getForm : function() {
    if(!this.form) {
      this.form = this.getElement().getParent(this.options.formSelector);
    }
    return this.form;
  },

  getElement : function() {
    return this.element;
  },

  toElement : function() {
    return this.getElement();
  },

	destroy : function() {
    this.revert();
    this.getElement().destroy();
    delete this.element;
	},

  revert : function() {
		var e = this.getElement();
		e.eliminate('MooPlaceholder');
		e.removeEvents(this.options.keyEvents);
    e.removeEvent('focus');
    e.removeEvent('blur');
		e.removeClass(this.options.focusClass);
		e.removeClass(this.options.blurClass);
  },

	onInput : function() {
    this.clearWaitTimeout();
		this.tracker = this.wait.delay(this.options.delay,this);
	},

  clearWaitTimeout : function() {
		if(this.tracker) {
			clearTimeout(this.tracker);
			this.tracker = null;
		}
  },

  onFormSubmit : function(event) {
    this.getForm().getElements(this.options.selector).each(function(input) {
      var p = input.retrieve('MooPlaceholder');
      if(p && p.isBlur()) {
        p.clear();
      }
    },this);
  },

  onFocus : function() {
    this.fireEvent('focus',[this.getElement()]);
  },

  onBlur : function() {
    this.fireEvent('blur',[this.getElement()]);
  }

});

$mooplaceholder = function(query) {
  switch(query) {
    case 'element':
    case 'string':
      return $(string).retrieve('MooPlaceholder');
    case 'object':
      return query;
  }
}

})(document.id,$$);
