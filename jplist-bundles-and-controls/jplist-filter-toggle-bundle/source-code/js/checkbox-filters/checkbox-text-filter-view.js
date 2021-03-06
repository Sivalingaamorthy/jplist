(function(){//+
	'use strict';		
	
	/**
	* Get control status
	* @param {Object} context
	* @param {boolean} isDefault - if true, get default (initial) control status; else - get current control status
	* @return {jQuery.fn.jplist.app.dto.StatusDTO}
	*/
	var getStatus = function(context, isDefault){
		
		var data
            ,textGroup = []
			,status = null
			,selected;	
						
		//init text group: get all selected checkbox values
		context.params.$checkboxes.each(function(index, el){
				
			//get checkbox
			var $cb = jQuery(el)
				,cbVal;

			if(isDefault){
				selected = $cb.data('selected-on-start') || false;
			}
			else{
				//get button data
				selected = $cb.get(0).checked;
			}				

			//get checkbox value
			cbVal = $cb.val();

			if(cbVal && selected){
				textGroup.push(cbVal);
			}
		});			

		//init status related data
		data = new jQuery.fn.jplist.ui.controls.CheckboxTextFilterDTO(
			textGroup
			,context.params.dataLogic
			,context.params.dataPath
			,context.params.ignore
		);

		//init status
		status = new jQuery.fn.jplist.app.dto.StatusDTO(
			context.name
			,context.action
			,context.type
			,data
			,context.inStorage
			,context.inAnimation
			,context.isAnimateToTop
			,context.inDeepLinking
		);
		
		return status;
	};
	
	/**
	* Get deep link
	* @param {Object} context
	* @return {string} deep link
	*/
	var getDeepLink = function(context){
		
		var deepLink = ''
			,status
			,isDefault = false
			,value = '';

		if(context.inDeepLinking){
		
			//get status
			status = getStatus(context, isDefault);

			if(status.data && jQuery.isArray(status.data.textGroup) && status.data.textGroup.length > 0){

				for(var i=0; i<status.data.textGroup.length; i++){

					if(value !== ''){
						value += context.options.delimiter2;
					}

					value += status.data.textGroup[i];
				}

				//init deep link
				deepLink = context.name + context.options.delimiter0 + 'textGroup=' + value;
			}
		}

		return deepLink;
	};
	
	/**
	* get status by deep link
	* @param {Object} context
	* @param {string} propName - deep link property name
	* @param {string} propValue - deep link property value
	* @return {jQuery.fn.jplist.app.dto.StatusDTO}
	*/
	var getStatusByDeepLink = function(context, propName, propValue){
		
		var isDefault = true
			,status = null
			,sections;

		if(context.inDeepLinking){
		
			//get status
			status = getStatus(context, isDefault);

			if(status.data && propName === 'textGroup'){

				sections = propValue.split(context.options.delimiter2);

				if(sections.length > 0){

					status.data.textGroup = sections;
				}
			}
		}

		return status;
	};
	
	/**
	* Get control paths
	* @param {Object} context
	* @param {Array.<jQuery.fn.jplist.domain.dom.models.DataItemMemberPathModel>} paths
	*/
	var getPaths = function(context, paths){
		
		var path;

        if(context.params.dataPath){

            //create path object
			path = new jQuery.fn.jplist.domain.dom.models.DataItemMemberPathModel(context.params.dataPath, 'text');

            //add path to the paths list
            paths.push(path);
        }
	};
		
	/**
	* Set control status
	* @param {Object} context
	* @param {jQuery.fn.jplist.app.dto.StatusDTO} status
	* @param {boolean} restoredFromStorage - is status restored from storage
	*/
	var setStatus = function(context, status, restoredFromStorage){
				
		var cbVal
			,$cb;

		//reset	all checkboxes
		context.params.$checkboxes.each(function(index, el){
					
			//get button
			$cb = jQuery(el);
			
			//remove selected class
			$cb.removeClass('jplist-selected');
			
			//reset selected value
			$cb.get(0).checked = false;
		});

		if(status.data && status.data.textGroup && jQuery.isArray(status.data.textGroup) && status.data.textGroup.length > 0){

			for(var i=0; i<status.data.textGroup.length; i++){

				//get path
				cbVal = status.data.textGroup[i];

				$cb = context.params.$checkboxes.filter('[value="' + cbVal + '"]');

				if($cb.length > 0){
					$cb.addClass('jplist-selected');
					$cb.get(0).checked = true;
				}
			}
		}
	};
	
	/**
	* Init control events
	* @param {Object} context
	*/
	var initEvents = function(context){

		context.params.$checkboxes.on('change', function(){
		
			//save last status in the history
			context.history.addStatus(getStatus(context, false));
			
			//render statuses
			context.observer.trigger(context.observer.events.unknownStatusesChanged, [false]);
		});
	};
	
	/** 
	* Dropdown control: sort dropdown, filter dropdown, paging dropdown etc.
	* @constructor
	* @param {Object} context
	*/
	var Init = function(context){
		
		context.params = {
			$checkboxes: context.$control.find('input[type="checkbox"]')
			,dataPath: context.$control.attr('data-path')
			,dataLogic: context.$control.attr('data-logic') || 'or'
			,ignore: ''
		};	
				
		if(context.controlOptions && context.controlOptions.ignore){

			//get ignore characters
			context.params.ignore = context.controlOptions.ignore;
		}
		
		//in every checkbox: save its data
		context.params.$checkboxes.each(function(){
			
			var $cb = jQuery(this)
				,selected;
			
			selected = $cb.get(0).checked;
			
			if(context.options.deepLinking){			
				selected = false;
			}
			
            $cb.data('selected-on-start', selected);
		});
		
		//init events
		initEvents(context);
		
		return jQuery.extend(this, context);
	};
	
	/**
	* Get control status
	* @param {boolean} isDefault - if true, get default (initial) control status; else - get current control status
	* @return {jQuery.fn.jplist.app.dto.StatusDTO}
	*/
	Init.prototype.getStatus = function(isDefault){
		return getStatus(this, isDefault);
	};
	
	/**
	* Get Deep Link
	* @return {string} deep link
	*/
	Init.prototype.getDeepLink = function(){
		return getDeepLink(this);
	};
	
	/**
	* Get Paths by Deep Link
	* @param {string} propName - deep link property name
	* @param {string} propValue - deep link property value
	* @return {jQuery.fn.jplist.app.dto.StatusDTO}
	*/
	Init.prototype.getStatusByDeepLink = function(propName, propValue){
		return getStatusByDeepLink(this, propName, propValue);
	};
	
	/**
	* Get Paths
	* @param {Array.<jQuery.fn.jplist.domain.dom.models.DataItemMemberPathModel>} paths
	*/
	Init.prototype.getPaths = function(paths){
		getPaths(this, paths);
	};
	
	/**
	* Set Status
	* @param {jQuery.fn.jplist.app.dto.StatusDTO} status
	* @param {boolean} restoredFromStorage - is status restored from storage
	*/
	Init.prototype.setStatus = function(status, restoredFromStorage){
		setStatus(this, status, restoredFromStorage);
	};
	
	/** 
	* Checkbox text filter control
	* @constructor
	* @param {Object} context
	*/
	jQuery.fn.jplist.ui.controls.CheckboxTextFilter = function(context){
		return new Init(context);
	};	
	
	/**
	* static control registration
	*/
	jQuery.fn.jplist.controlTypes['checkbox-text-filter'] = {
		className: 'CheckboxTextFilter'
		,options: {
			ignore: '' //regex for the characters to ignore, for example: [^a-zA-Z0-9]+
		}
	};	
})();

