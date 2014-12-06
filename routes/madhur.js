var ejs = require("ejs");
var mysql = require('./mysql');
var redis = require('node-redis');
var client = redis.createClient();
function getDistinctProductConditions(req,res) {
	var query = "select distinct product_condition from product";
	mysql.fetchData(function(err,results){
		if(err){
			throw err;
		}
		else
		{
			client.get(query, function(err,redisResult){
            	if(err){
            		console.log("inside error while fetching from cache");
            	}
            	else{
            		if(!redisResult)
            		{
			          res.type('application/json');
			          console.log("Serving results from DB");
			          console.log("inserting the query results to redis");
			          //client.set(query,JSON.stringify(results));
			          client.setex(query,1000,JSON.stringify(results))
			          res.end(JSON.stringify(results));
            		}
            		else{
            			console.log("serving from Redis Cache");
		            	console.log("data:"+results);
		            	res.type('application/json');
		            	res.end(JSON.stringify(results));
            		}
            	}
			});
		}	
	},query);
	}


function getDistinctProductBidStatus(req,res) {
	var query = "select distinct product_listed_as from product";
	mysql.fetchData(function(err,results){
		if(err){
			throw err;
		}
		else
		{
			res.type('application/json');
			res.end(JSON.stringify(results));
		}
	},query);
}

function isNotNull(str) {
	if(str !== undefined && str !== "" && str != "0"){
		return true;
	}
	return false;
}


function productDetails(req,res) {
	var search_prod_cond = req.param('search_prod_cond');
	var search_prod_bid_status = req.param('search_prod_bid_status');
	var category = req.param('category');
	var text = req.param('text');
	var u_range = req.param('u_range');
	var l_range = req.param('l_range');
	var operator = "and ";
	
	var query = "select p.bid_expiry_time, p.product_id,p.seller_id,p.product_name,p.product_desc,p.product_condition,p.product_status,p.category_id,p.units_in_stock,p.price_per_unit,p.product_listed_as, c.category_name from product p, category c where c.category_id=p.category_id and p.product_status != 'Sold' and p.isActiveProduct=1";
	//var query = "select  from product";
	console.log(query);
	if(isNotNull(search_prod_cond) || isNotNull(search_prod_bid_status) || isNotNull(category) || isNotNull(text) || ((u_range !== null) && (l_range !== null))) {
		query = query + " and ";
		
		if(isNotNull(search_prod_cond)) {
			query = query + "p.product_condition='"+search_prod_cond+"' "+operator;
		}
		if(isNotNull(search_prod_bid_status)) {
			query = query + "p.bid_status='"+search_prod_bid_status+"' "+operator;
		}
		if(isNotNull(text)) {
			query = query + "p.product_name='"+text+"' "+operator;
		}
		if(isNotNull(category)) {
			query = query + "p.category_id="+category+" "+operator;
		}
		if((u_range) && (l_range)) {
			query = query + "p.price_per_unit between "+u_range+" and "+l_range+" "+operator;
		}
		query = query.substring(0, query.lastIndexOf("and"));
		console.log(query);
	}
	console.log(query);
	


		client.get(query, function(err,redisResult){
        	if(err){
        		console.log("inside error while fetching from cache");
        	}
        	else{
        		if(!redisResult)
        		{
        			mysql.fetchData(function(err,results){
        				if(err){
        					throw err;
        				}
        				else
        				{
        					("Serving from DB");
        					res.type('application/json');
        					client.setex(query,1000,JSON.stringify(results))
        					res.end(JSON.stringify(results));
        				}
        			},query);
        		}
        		else{
        			console.log("serving from Redis Cache");
	            	console.log("data:"+results);
	            	res.type('application/json');
	            	res.end(JSON.stringify(results));
        		}
        	}
		});

}

function personDetails(req,res) {
	
	var name = req.param('name');
	var type = req.param('type');
	var email = req.param('email');
	var zip = req.param('zip');
	var city = req.param('city');
	var mem_id = req.param('mem_id');
	var operator = "and ";
	var query = "select * from person where isactive=1";
	if(isNotNull(name) || isNotNull(type) || isNotNull(email) || isNotNull(zip) || isNotNull(city) || isNotNull(mem_id)) {
		query = query + " and ";
		
		if(isNotNull(name)) {
			query = query + "(person_fname='"+name+"' or person_lname='"+name+"') "+operator;
		}
		if(isNotNull(type)) {
			query = query + "person_type='"+type+"' "+operator;
		}
		if(isNotNull(email)) {
			query = query + "person_email='"+email+"' "+operator;
		}
		if(isNotNull(zip)) {
			query = query + "person_zip='"+zip+"' "+operator;
		}
		if(isNotNull(city)) {
			query = query + "person_city='"+city+"' "+operator;
		}
		if(isNotNull(mem_id)) {
			query = query + "membership_id='"+mem_id+"' "+operator;
		}
		query = query.substring(0, query.lastIndexOf("and"));
		console.log(query);
	}
	console.log(query);
	
	client.get(query, function(err,redisResult){
    	if(err){
    		console.log("inside error while fetching from cache");
    	}
    	else{
    		if(!redisResult)
    		{
    			mysql.fetchData(function(err,results){
    				if(err){
    					throw err;
    				}
    				else
    				{
    					("Serving from DB");
    					res.type('application/json');
    					client.setex(query,1000,JSON.stringify(results))
    					res.end(JSON.stringify(results));
    				}
    			},query);
    		}
    		else{
    			console.log("serving from Redis Cache");
            	console.log("data:"+results);
            	res.type('application/json');
            	res.end(JSON.stringify(results));
    		}
    	}
	});
	
}

function getPersonType(req,res) {
	var query = "select distinct person_type from person";
	client.get(query, function(err,redisResult){
    	if(err){
    		console.log("inside error while fetching from cache");
    	}
    	else{
    		if(!redisResult)
    		{
    			mysql.fetchData(function(err,results){
    				if(err){
    					throw err;
    				}
    				else
    				{
    					("Serving from DB");
    					res.type('application/json');
    					client.setex(query,1000,JSON.stringify(results))
    					res.end(JSON.stringify(results));
    				}
    			},query);
    		}
    		else{
    			console.log("serving from Redis Cache");
            	console.log("data:"+results);
            	res.type('application/json');
            	res.end(JSON.stringify(results));
    		}
    	}
	});
}

function getPersonNames(req,res) {
	client.get(query, function(err,redisResult){
    	if(err){
    		console.log("inside error while fetching from cache");
    	}
    	else{
    		if(!redisResult)
    		{
    			mysql.fetchData(function(err,results){
    				if(err){
    					throw err;
    				}
    				else
    				{
    					("Serving from DB");
    					res.type('application/json');
    					client.setex(query,1000,JSON.stringify(results))
    					res.end(JSON.stringify(results));
    				}
    			},query);
    		}
    		else{
    			console.log("serving from Redis Cache");
            	console.log("data:"+results);
            	res.type('application/json');
            	res.end(JSON.stringify(results));
    		}
    	}
	});
}

function getPersonCities(req,res) {
	var query = "select distinct person_city from person where person_city like '"+req.param('city')+"%'";
	client.get(query, function(err,redisResult){
    	if(err){
    		console.log("inside error while fetching from cache");
    	}
    	else{
    		if(!redisResult)
    		{
    			mysql.fetchData(function(err,results){
    				if(err){
    					throw err;
    				}
    				else
    				{
    					("Serving from DB");
    					res.type('application/json');
    					client.setex(query,1000,JSON.stringify(results))
    					res.end(JSON.stringify(results));
    				}
    			},query);
    		}
    		else{
    			console.log("serving from Redis Cache");
            	console.log("data:"+results);
            	res.type('application/json');
            	res.end(JSON.stringify(results));
    		}
    	}
	});
}

function getPersonEmail(req,res) {
	var query = "select distinct person_email from person where person_email like '"+req.param('email')+"%'";
	client.get(query, function(err,redisResult){
    	if(err){
    		console.log("inside error while fetching from cache");
    	}
    	else{
    		if(!redisResult)
    		{
    			mysql.fetchData(function(err,results){
    				if(err){
    					throw err;
    				}
    				else
    				{
    					("Serving from DB");
    					res.type('application/json');
    					client.setex(query,1000,JSON.stringify(results))
    					res.end(JSON.stringify(results));
    				}
    			},query);
    		}
    		else{
    			console.log("serving from Redis Cache");
            	console.log("data:"+results);
            	res.type('application/json');
            	res.end(JSON.stringify(results));
    		}
    	}
	});
}

function getPersonZip(req,res) {
	var query = "select distinct person_zip from person where person_zip like '"+req.param('zip')+"%'";
	client.get(query, function(err,redisResult){
    	if(err){
    		console.log("inside error while fetching from cache");
    	}
    	else{
    		if(!redisResult)
    		{
    			mysql.fetchData(function(err,results){
    				if(err){
    					throw err;
    				}
    				else
    				{
    					("Serving from DB");
    					res.type('application/json');
    					client.setex(query,1000,JSON.stringify(results))
    					res.end(JSON.stringify(results));
    				}
    			},query);
    		}
    		else{
    			console.log("serving from Redis Cache");
            	console.log("data:"+results);
            	res.type('application/json');
            	res.end(JSON.stringify(results));
    		}
    	}
	});
}

function getmemIds(req,res) {
	var query = "select distinct membership_id from person where membership_id like '"+req.param('memId')+"%'";
	client.get(query, function(err,redisResult){
    	if(err){
    		console.log("inside error while fetching from cache");
    	}
    	else{
    		if(!redisResult)
    		{
    			mysql.fetchData(function(err,results){
    				if(err){
    					throw err;
    				}
    				else
    				{
    					("Serving from DB");
    					res.type('application/json');
    					client.setex(query,1000,JSON.stringify(results))
    					res.end(JSON.stringify(results));
    				}
    			},query);
    		}
    		else{
    			console.log("serving from Redis Cache");
            	console.log("data:"+results);
            	res.type('application/json');
            	res.end(JSON.stringify(results));
    		}
    	}
	});
}

function getProductNames(req,res) {
	var query = "select distinct product_name from product where product_name like '"+req.param('name')+"%'";
	client.get(query, function(err,redisResult){
    	if(err){
    		console.log("inside error while fetching from cache");
    	}
    	else{
    		if(!redisResult)
    		{
    			mysql.fetchData(function(err,results){
    				if(err){
    					throw err;
    				}
    				else
    				{
    					("Serving from DB");
    					res.type('application/json');
    					client.setex(query,1000,JSON.stringify(results))
    					res.end(JSON.stringify(results));
    				}
    			},query);
    		}
    		else{
    			console.log("serving from Redis Cache");
            	console.log("data:"+results);
            	res.type('application/json');
            	res.end(JSON.stringify(results));
    		}
    	}
	});
}

function getCategories(req,res) {
	var query = "select category_id,category_name from category";
	client.get(query, function(err,redisResult){
    	if(err){
    		console.log("inside error while fetching from cache");
    	}
    	else{
    		if(!redisResult)
    		{
    			mysql.fetchData(function(err,results){
    				if(err){
    					throw err;
    				}
    				else
    				{
    					("Serving from DB");
    					res.type('application/json');
    					client.setex(query,1000,JSON.stringify(results))
    					res.end(JSON.stringify(results));
    				}
    			},query);
    		}
    		else{
    			console.log("serving from Redis Cache");
            	console.log("data:"+results);
            	res.type('application/json');
            	res.end(JSON.stringify(results));
    		}
    	}
	});
}

function getAuditLogs(req,res) {
	var query = "select * from dba_audit";
	mysql.fetchData(function(err,results){
		if(err){
			throw err;
		}
		else
		{
			console.log("results: "+results);
			res.type('application/json');
			res.end(JSON.stringify(results));
		}
	},query);
}

exports.getDistinctProductConditions=getDistinctProductConditions;
exports.getDistinctProductBidStatus=getDistinctProductBidStatus;
exports.productDetails=productDetails;
exports.personDetails=personDetails;
exports.getPersonType=getPersonType;
exports.getPersonNames=getPersonNames;
exports.getPersonCities=getPersonCities;
exports.getPersonEmail=getPersonEmail;
exports.getmemIds=getmemIds;
exports.getPersonZip=getPersonZip;
exports.getProductNames=getProductNames;
exports.getCategories=getCategories;
exports.getAuditLogs=getAuditLogs;