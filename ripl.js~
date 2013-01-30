//// USAGE (test): r=new ripl();
////	           r.test()

GLOBAL_LOCK = 0;
GLOBAL_DATA = [];

function ripl() {
	this.serverURL = 'http://ec2-54-235-201-199.compute-1.amazonaws.com:';
	this.port = 5001; // 5000
  this.assumes = "";
  this.observes = "";
  this.predicts = "";

	/*this.opts = {
	  lines: 13, // The number of lines to draw
	  length: 7, // The length of each line
	  width: 4, // The line thickness
	  radius: 10, // The radius of the inner circle
	  corners: 1, // Corner roundness (0..1)
	  rotate: 0, // The rotation offset
	  color: '#000', // #rgb or #rrggbb
	  speed: 1, // Rounds per second
	  trail: 60, // Afterglow percentage
	  shadow: false, // Whether to render a shadow
	  hwaccel: false, // Whether to use hardware acceleration
	  className: 'spinner', // The CSS class to assign to the spinner
	  zIndex: 2e9, // The z-index (defaults to 2000000000)
	  top: 'auto', // Top position relative to parent in px
	  left: 'auto' // Left position relative to parent in px
	};
	this.target = document.getElementById('foo');*/
};


ripl.prototype.seed = function (seedval,cb)
{
	$.post(this.serverURL,seedval,cb);
};


ripl.prototype.delay = function(time) {
  var d1 = new Date();
  var d2 = new Date();
  while (d2.valueOf() < d1.valueOf() + time) {
    d2 = new Date();
  }
}


ripl.prototype.ajaxPOST = function(URL,data_in){
	console.log(data_in);
	//this.spinner =  new Spinner(this.opts).spin(this.target);
	//$(this.target).data('spinner', this.spinner);
	$.ajax({
		url: URL, 
		type:'POST', 
		data: data_in,
		dataType: 'json', 
		async: false,	
		crossDomain: true,
		success:function(data) {
			//console.log('SUCCESS: ajaxPost() URL:' + URL);
			//console.log(data);
			GLOBAL_LOCK = 0;
			GLOBAL_DATA = data;
			//$('#foo').data('spinner').stop();
		},
		error: function(httpRequest, textStatus, errorThrown) { 
			GLOBAL_LOCK = 0;
			GLOBAL_DATA = 'ERR';
  			console.log("ajaxGET status=" + textStatus + ",error=" + errorThrown + 'URL:' + URL);
			//$('#foo').data('spinner').stop();
		},
       		complete: function() {
            		//console.log('COMPLETE');
       		}		
	});
}


ripl.prototype.ajaxGET = function(URL){
	//this.spinner =  new Spinner(this.opts).spin(this.target);
	//$(this.target).data('spinner', this.spinner);
	$.ajax({
		url: URL, 
		type:'GET', 
		dataType: 'json', 
		async: false,	
		crossDomain: true,
		success:function(data) {
			//console.log('SUCCESS: ajaxGET() URL:' + URL);
			//console.log(data);
			GLOBAL_LOCK = 0;
			GLOBAL_DATA = data;
			//$('#foo').data('spinner').stop();
		},
		error: function(httpRequest, textStatus, errorThrown) { 
			GLOBAL_LOCK = 0;
			GLOBAL_DATA = 'ERR';
  			console.log("ajaxGET status=" + textStatus + ",error=" + errorThrown + 'URL:' + URL);
			//$('#foo').data('spinner').stop();
		},
       		complete: function() {
            		//console.log('COMPLETE');
       		}		
	});
}



//TODO make changes - needs fixes
ripl.prototype.clearTrace = function ()
{
	var URL = this.serverURL + this.port + "/"
	var dict = {};
	dict['DELETE']='yes';
	GLOBAL_LOCK = 1;
	$.ajax({
		url: URL, 
		type: 'POST', 
		data:  {"DELETE": "yes"}, 
		dataType: 'json', 
		async: false,	
		crossDomain: true,
		success:function(data){
			//console.log(data);
			GLOBAL_LOCK = 0;
		},
		error: function(httpRequest, textStatus, errorThrown) { 
  			// TODO: not working alert("status=" + textStatus + ",error=" + errorThrown);
		},
       		complete: function() {
            		//console.log('COMPLETE');
       		}
	});

	//while(GLOBAL_LOCK == 1) {}

	//TODO: remove this later 
	this.delay(100); //ms

	//console.log('GOT OUT');
	GLOBAL_LOCK = 0;
};



// Ex: 
// expr='(lambda () (normal (if (flip 0.7) 1 (+ (out) (out))) 2.0))' 
// ret = ripl.assume('out',expr)
// ret will be : {d_id: 1, val:0}
ripl.prototype.assume = function(namestr,expr,TERM)
{
	var URL = this.serverURL + this.port + "/assume"
	GLOBAL_LOCK = 1;

	if(!TERM) { 
		console.log('NORMAL');
		this.ajaxPOST(URL, { 'name_str': JSON.stringify(namestr), 'expr_lst': JSON.stringify(parse(expr)) } );
	}
	else {
		console.log('TERM');
		this.ajaxPOST(URL, { 'name_str': JSON.stringify(namestr), 'expr_lst': JSON.stringify(expr) } );
	}

	while(GLOBAL_LOCK == 1) {}
	GLOBAL_LOCK = 0;
	return GLOBAL_DATA
}

ripl.prototype.assumeLog = function(namestr,expr,TERM)
{
  this.assumes = this.assumes + "(ASSUME " + namestr + " " + expr + ")<br>";
  
  this.assume(namestr,expr,TERM);
}


// Ex:
// expr='(lambda () (normal (if (flip 0.7) 1 (+ (out) (out))) 2.0))' 
// ripl.assume('out',expr)
// ret = ripl.predict('(out)');
// ret looks like : {"d_id":2,"val":-1.3338055911498068} 
ripl.prototype.predict = function(expr,TERM)
{
  this.predicts = this.predicts + "(PREDICT " + expr + ")<br>";
  
	var URL = this.serverURL + this.port + "/predict"
	GLOBAL_LOCK = 1;

	if(!TERM) { 
		this.ajaxPOST(URL, { 'expr_lst': JSON.stringify(parse(expr)) } );
	}
	else {
		this.ajaxPOST(URL, { 'expr_lst': JSON.stringify(expr) } );
	}

	while(GLOBAL_LOCK == 1) {}
	GLOBAL_LOCK = 0;
	return GLOBAL_DATA
}




// Ex:
// expr='(lambda () (normal (if (flip 0.7) 1 (+ (out) (out))) 2.0))' 
// ripl.assume('out',expr)
// ret = ripl.predict('(out)');
// ret looks like : {"d_id":2,"val":-1.3338055911498068} 
ripl.prototype.observe = function(expr,litval,TERM)
{
	var URL = this.serverURL + this.port + "/observe"
	GLOBAL_LOCK = 1;

	if(!TERM) {
		this.ajaxPOST(URL, { 'expr_lst': JSON.stringify(parse(expr)), 'literal_val':JSON.stringify(parse(litval))  } );
	}
	else {
		this.ajaxPOST(URL, { 'expr_lst': JSON.stringify(expr), 'literal_val':JSON.stringify(litval)  } );	
	}

	while(GLOBAL_LOCK == 1) {}
	GLOBAL_LOCK = 0;
	return GLOBAL_DATA
}

// Returns the time consumption (JSON dictionary["time"] = real-value, number of milliseconds)  of the inference in milliseconds.
ripl.prototype.infer = function(MHiterations,threadsNumber)
{
	var URL = this.serverURL + this.port + "/infer"
	GLOBAL_LOCK = 1;

	this.ajaxPOST(URL,  {"MHiterations": MHiterations, "threadsNumber": threadsNumber}  );

	while(GLOBAL_LOCK == 1) {}
	GLOBAL_LOCK = 0;
	return GLOBAL_DATA
}


ripl.prototype.start_cont_infer = function(threadsNumber)
{
	var URL = this.serverURL + this.port + "/start_cont_infer"
	GLOBAL_LOCK = 1;

	this.ajaxPOST(URL,  {"threadsNumber": threadsNumber} );

	while(GLOBAL_LOCK == 1) {}
	GLOBAL_LOCK = 0;
	return GLOBAL_DATA
}


ripl.prototype.stop_cont_infer = function()
{
	var URL = this.serverURL + this.port + "/stop_cont_infer"
	GLOBAL_LOCK = 1;

	this.ajaxPOST(URL,{});

	while(GLOBAL_LOCK == 1) {}
	GLOBAL_LOCK = 0;
	return GLOBAL_DATA
}

ripl.prototype.forget = function(directive_id)
{
	var URL = this.serverURL + this.port + "/" + String(directive_id);
	GLOBAL_LOCK = 1;
	var data = {"DELETE": "yes"};
	this.ajaxPOST(URL,data);

	while(GLOBAL_LOCK == 1) {}
	GLOBAL_LOCK = 0;
	return GLOBAL_DATA
}



ripl.prototype.cont_infer_status = function()
{
	var URL = this.serverURL + this.port + "/cont_infer_status";
	GLOBAL_LOCK = 1;

	this.ajaxGET(URL);

	while(GLOBAL_LOCK == 1) {}
	GLOBAL_LOCK = 0;
	return GLOBAL_DATA
}


ripl.prototype.report_directives = function()
{
	var URL = this.serverURL + this.port + "/";
	GLOBAL_LOCK = 1;

	this.ajaxGET(URL);

	while(GLOBAL_LOCK == 1) {}
	GLOBAL_LOCK = 0;
	return GLOBAL_DATA
}

ripl.prototype.report_value = function(directive_id)
{
	var URL = this.serverURL + this.port + "/" + String(directive_id);
	GLOBAL_LOCK = 1;

	this.ajaxGET(URL);

	while(GLOBAL_LOCK == 1) {}
	GLOBAL_LOCK = 0;
	return GLOBAL_DATA
}



/////// TEST BEGINS /////////
ripl.prototype.test = function() {
	//EXAMPLE 1 - PCFG
	console.log('\n\n---------- TEST 1 ------------\n');
	this.clearTrace();

	var expr='(lambda () (normal (if (flip 0.7) 1 (+ (out) (out))) 2.0))';
	var ret = this.assume('out',expr);
	console.log('ASSUME RET:' + JSON.stringify(ret));

	ret = this.predict('(out)');
	console.log('PREDICT RET:' + JSON.stringify(ret));

	//EXAMPLE 2 - POSITIVE MAMMOGRAM
	console.log('\n\n---------- TEST 2 ------------\n');
	this.clearTrace();

	expr='(flip 0.01)'; 
	ret = this.assume('breast-cancer',expr);
	console.log('ASSUME RET:' + JSON.stringify(ret));

	expr='(lambda () (if breast-cancer (flip 0.8) (flip 0.096)))';
	ret = this.assume('positive-mammogram',expr);
	console.log('ASSUME RET:' + JSON.stringify(ret));

	expr='(noise-negate (positive-mammogram) 0.00001)';
	var litval = 'true';
	ret = this.observe(expr,litval);
	console.log('OBSERVE RET:' + JSON.stringify(ret));

	ret = this.infer(1000,1);
	console.log('INFER RET:' + JSON.stringify(ret));

	ret = this.predict('(positive-mammogram)');
	console.log('PREDICT RET:' + JSON.stringify(ret));

	//EXAMPLE 3 - REPORT tests
	console.log('\n\n---------- TEST 3 ------------\n');
	ret = this.report_directives();
	console.log('REPORT_DIRECTIVES RET:' + JSON.stringify(ret));

	ret = this.report_value(4);
	console.log('REPORT_VALUE RET:' + JSON.stringify(ret));
	
}


