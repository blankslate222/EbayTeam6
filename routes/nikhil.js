/**
 * New node file
 */
var ejs = require("ejs");
var mysql = require('mysql');
var db = require('./mysql');
var moment = require('moment');
var redis = require('node-redis');
var client = redis.createClient();

function displayWithError(req,res,errormsg){
	var categoryList = '', productCondition = '', productStatus = '';
	var categoryListSql = "select distinct `category_id`, `category_name` from category";
	console.log('user in sess --'+req.session.pid);
	runQuery(categoryListSql,req,res, function(status, result){
		categoryList = result;
	//	
		
		//also get select list for prod_condition and status
		productCondition = getProductConditionList();
		productStatus = getProductStatusList();
		var sell_mode = getSellMode();
		
		res.status(404);
		res.render("create-product",{errMsg:errormsg,
			//add the session attributes to display
			 category : categoryList,
			 seller_id : req.session.pid,
			 productCondition : productCondition,
			 productStatus : productStatus,
			 sell_mode : sell_mode
		});
	});
	
	return;
}
function list(req,res){

	var sql = 'select product_id, product_name, product_desc, product_condition, (select count(1) from bid_line_item, bid_header_item where product.product_id = bid_header_item.product_id and bid_header_item.bid_id = bid_line_item.bid_id ) numberOfBids  from product';

	db.executeQuery(sql,function(err, status, resultProductList){

		if(status == 200){
			res.status(status);
			//res.send(resultProductList);
			ejs.renderFile('./views/listProducts.ejs',{ productList: resultProductList},function(err, result) {
				// render on success
				if (!err) {
					res.end(result);
				}
				// render or error
				else {
					res.end('An error occurred');
					console.log(err);
				}
			});
		}else{
			res.status=status;
			res.send("something is not right");	
			console.log(err);
		}

	});
}

function getCategoryList(){
	var catSql = 'select distinct category_id,category_name from category';
	var categoryList='';
	db.executeQuery(catSql,function(err,status,result){
		categoryList = result;
		return result;
	});
	//return categoryList;
}
function getProductConditionList(){
	var conditionList = ['New','Refurbished','Used'];
	return conditionList;
}

function getProductStatusList(){
	var statusList = ['In-stock','Out-of-stock'];
	return statusList;
}

function getSellMode(){
	var productListingType = ['Fixed Price','Auction'];
	return productListingType;
}

function dba_audit(user, ip, event, dbname, obj_name, userquery) {
    var query = "insert into dba_audit(date, user, ip, event, db, obj_type, obj_name, query) " +
    		"values(NOW(),'"+user+"','"+ip+"','"+event+"','"+dbname+"', 'TABLE','"+obj_name+"', \""+userquery+"\")";
    db.executeQuery(query,function(err,status,results){
        if(err){
            throw err;
        }
        else
        {
         return;
        }
    });
}


function runQuery(sql,req,res,callback){
	
	db.executeQuery(sql,function(err, status, result){
		
		if(status == 500 || status == 400){
			console.log('error in 10');
			//redirect to error from here - should send appropriate messages
			res.render('error-nikhil', {
				errMsg : 'Bad request. Query failed to execute.'
			});
		}else{
			callback(status, result);
			return;
		}
		
	});
	return;
}

function newProductForm(req,res){
	
	var categoryList = '', productCondition = '', productStatus = '';
	var categoryListSql = "select distinct `category_id`, `category_name` from category";
	console.log('user in sess --'+req.session.pid);
	runQuery(categoryListSql,req,res, function(status, result){
		categoryList = result;
	//	
		
		//also get select list for prod_condition and status
		productCondition = getProductConditionList();
		productStatus = getProductStatusList();
		var sell_mode = getSellMode();
		
		res.render("create-product",{errMsg:'',
			//add the session attributes to display
			 category : categoryList,
			 seller_id : req.session.pid,
			 productCondition : productCondition,
			 productStatus : productStatus,
			 sell_mode : sell_mode
		});
	});
	
	return;
}


function handleNewProduct(req,res){
	
	var bidtime;
	var insertProductSql = "INSERT INTO product SET ?";
	var units_in_stock = req.body.units_in_stock;
	//validations
	var condList = getProductConditionList();
	var statusList = getProductStatusList();

	var sell_mode = getSellMode();

	//1 - check for null fields and duplicate
	//newProduct = JSON.stringify(newProduct);
	console.log('new product -'+ req.body.product_name.length);
	var selsql = 'select distinct product_name from product where seller_id ='+req.session.pid;
	db.executeQuery(selsql, function(err, status, result){
		if(result.length == 0){
			console.log('first product');
		}
		if(result.length != 0){
			var product = ''+req.body.product_name;
			for(var i=0; i< result.length; i++){
			
			var result_prod = ''+result[i].product_name;
			console.log('in lower case -'+product.toLowerCase());
			console.log('creating prod lower case--'+result_prod.trim().toString().toLowerCase());
			if(product.trim().toLowerCase()== result_prod.toString().trim().toLowerCase()){
//				res.status(400);
				displayWithError(req,res,'Creating a duplicate product is not allowed');
				return;
			}
		  }
		}
	
		
if(req.body.product_name.length == 0 || req.body.product_desc.length == 0 || req.body.seller_id.length == 0 ||
		req.body.category_id.length == 0){
	console.log('error in 1');
	displayWithError(req,res,'Mandatory fields cannot be null');
	return;
}

if(req.body.seller_id != req.session.pid){
	console.log('body -'+req.body.seller_id);
	console.log('session id' + req.session.pid);
	console.log('error in 2');
	res.status(403).render('error-nikhil', {
		errMsg : 'Operation not authorized for this user'
	});
	return;
}
	//2 - compare fields with finite set of values with 
	//the value set(status,condition,units in stock, price per unit)
	var mode = req.body.sell_mode;
	var modeList = getSellMode();
	
	if(modeList.indexOf(mode) == -1){

		console.log('invalid sale mode');
		displayWithError(req,res,'Invalid Sale mode');
		return;
	}
	
	if(mode=='Fixed Price'){
		bidtime = null;
	if (isNaN(parseFloat(req.body.units_in_stock)) || req.body.units_in_stock < 0) {
		console.log('error in 4');
		displayWithError(req,res,'Units in stock must be a valid positive number');
		return;
	}
	if (isNaN(parseFloat(req.body.price_per_unit)) || req.body.price_per_unit < 0) {
		console.log('error in 5');
		displayWithError(req,res,'Price per unit must be a valid positive number');
		return;
	}
}
	if(mode=='Auction'){
		
		console.log('bid expiry req body' + req.body.bid_expiry);
		var bexp = ''+req.body.bid_expiry;
		var bidexpiry = moment(bexp);
		var now = moment().format('YYYY-MM-DD HH:mm:ss');
		console.log('bid expiry moment' + bidexpiry.format('YYYY-MM-DD HH:mm:ss'));
		console.log('moment now' + now);
		
		if (isNaN(parseFloat(req.body.start_amount)) || req.body.start_amount < 0) {
			console.log('error in 6');
			displayWithError(req,res,'Start amount must be a valid positive number');
			return;
		}
		if( !bidexpiry.isValid()|| !bidexpiry.isAfter(now) ){
			console.log('error in 7');
			displayWithError(req,res,'Please specify a valid bid expiry time greater than current time');
			return;
		}
		bidtime = bidexpiry.format('YYYY-MM-DD HH:mm:ss');
		units_in_stock = 1;
	}
	if(condList.indexOf(req.body.product_condition) == -1){
		console.log('error in 8');
		displayWithError(req,res,'Invalid value for field - product condition');
		return;
	}
	if(statusList.indexOf(req.body.product_status) == -1){
		console.log('error in 9');
		displayWithError(req,res,'Invalid value for field - product status');
		return;
	}

	// row insertion
	var newProduct = {
			seller_id : req.body.seller_id,
			product_name : req.body.product_name,
			product_desc : req.body.product_desc.trim(),
			product_condition : req.body.product_condition,
			product_status : req.body.product_status,
			category_id : req.body.category_id,
			price_per_unit : req.body.price_per_unit,
			units_in_stock : units_in_stock,
			product_listed_as : req.body.sell_mode,
			bid_expiry_time : bidtime,
			isActiveProduct : '1'
		};
	//console.log(newProduct);
	
	var inserts = [newProduct];
	insertProductSql = mysql.format(insertProductSql, inserts);
	//console.log("ins sql -"+insertProductSql);
	//console.log(newProduct);
	runQuery(insertProductSql,req,res, function(status, result){
//		dba_audit(req.session.uname, req.connection.remoteAddress, 'insert', 'ebayTeam6', 'product',
//		insertProductSql);

		var insertId = result.insertId;
		
		
		//Redis
		var redisQuery="select * from product where product_id="+insertId+";"
		runQuery(redisQuery,req,res, function(status, result){

			console.log("priniting new product id"+insertId);
			client.get(redisQuery, function(err,redisResult){
            	if(err){
            		console.log("inside error while fetching from cache");
            	}
            	else{          		
            		client.setex(insertId,1000,JSON.stringify(result))
            		console.log("Printing results inserted into cache after new product creation:"+result);
            	}
			});
		});
		//Redis
		
		
		if (mode == 'Auction') {
			var bid_header = {
					product_id : insertId,
					bid_start_price : req.body.start_amount
				};
				var insertBid = 'INSERT INTO bid_header_item SET ?';
				var inserts1 = [ bid_header ];
				insertBid = mysql.format(insertBid, inserts1);
				runQuery(insertBid, req, res, function(status, result){
					console.log('updating bid');
					res.status(200);
					res.redirect('/seller-details');
					
				});
				return;
		}else{
			console.log('insert id --' + result.insertId);
			console.log('not an auction prod');
			res.status(200);
			res.redirect('/seller-details');
			return;
		}

	});
	});
	return;
}
function auctionCheck(productId,req,res){
	var prodsql = 'select distinct c.bid_expiry_time,a.bid_id from bid_header_item a, bid_line_item b, product c'+
	' where a.product_id = ? and a.product_id = c.product_id and a.bid_id = b.bid_id';
var updcheck = [productId];
prodsql = mysql.format(prodsql,updcheck);
runQuery(prodsql, req, res, function(status, result1){
	if (result1.length != 0 &&
		moment(result1[0].bid_expiry_time).isAfter(moment().format('YYYY-MM-DD HH:mm:ss'))){
		res.status(403).render('error-nikhil',{
			errMsg : 'Product cannot be updated right now. There are active bids for this product.'
		});
		return;
	}
});
}
function updateForm(req,res){

	var currentCategory = '', categoryList = '', product = '';
	var currentCondition='', currentStatus='', conditionList = '', statusList = '';
	var productId = req.query.product_id; //or - req.params.product_id;
	var getProductModeSql = 'SELECT product_listed_as,seller_id from product where product_id = ?';

	var prod = [productId];
	getProductModeSql = mysql.format(getProductModeSql, prod);
	var getAuctionRecordSql = 'SELECT `seller_id`,a.product_id,`product_name`,`product_desc`,'+
	'`product_condition`,`product_status`,`category_id`,`price_per_unit`,'+
	'`units_in_stock`,`product_listed_as`,`bid_expiry_time`,b.bid_start_price FROM product a, bid_header_item b '+
	' WHERE a.product_id = b.product_id and a.product_id = ? AND isActiveProduct = 1 and product_listed_as = \'Auction\'';

	var getFixedRecordSql = 'SELECT `seller_id`,a.product_id,`product_name`,`product_desc`,'+
	'`product_condition`,`product_status`,`category_id`,`price_per_unit`,'+
	'`units_in_stock`,`product_listed_as`,`bid_expiry_time` FROM product a '+
	' WHERE a.product_id = ? AND isActiveProduct = 1 and product_listed_as = \'Fixed Price\'';
	var finalquery;
	var updates = [productId];
	getAuctionRecordSql = mysql.format(getAuctionRecordSql, updates);
	getFixedRecordSql = mysql.format(getFixedRecordSql, updates);

	var categoryListSql = "select distinct `category_id`, `category_name` from category";

	//also get select list for prod_condition and status
	conditionList = getProductConditionList();
	statusList = getProductStatusList();


	runQuery(getProductModeSql, req, res, function(status, result){

		var seller_in_session = result[0].seller_id;
		if(req.session.pid != seller_in_session){
			//display error message
			res.status(403);
			res.render('error-page',{
				errMsg : 'Forbidden request. You are not authorized to perform this operation.'
			});
			return;
		}

		var prod_listed_as = result[0].product_listed_as;

		if(prod_listed_as == 'Auction'){
			auctionCheck(productId, req ,res);
			finalquery = getAuctionRecordSql;
		}else{
			finalquery = getFixedRecordSql;
		}
		runQuery(categoryListSql,req,res, function(status, result){
			categoryList = result;
			runQuery(finalquery, req, res, function(status, result){
				if(status == 200){
					product = result;
					currentCategory = result[0].category_id;
					currentCondition = result[0].product_condition;
					currentStatus = result[0].product_status;
//					console.log('BID START --'+product[0].bid_start_price);
					res.status(status);
//					res.send('found a hit. update the details please');
					//render update form

					res.render('edit-product',{
						product : product,
						currentCategory : currentCategory,
						currentCondition : currentCondition,
						currentStatus : currentStatus,
						category : categoryList,
						productCondition : conditionList,
						productStatus : statusList
					});
				}else{
					res.status(status).render('error-nikhil',{
						errMsg : 'Bad request. The product you are trying to update does not exist'
					});
					return;
					//render error message
				}
			});
		});
	});

	return;
}


function handleProductUpdate(req,res){
	
	var productId = req.body.product_id, units_in_stock=req.body.units_in_stock, mode = req.body.product_listed_as ;
	var updateProductSql='UPDATE product SET ? WHERE product_id = ?';
	
	if(mode == 'Auction'){
		//check if any active bids - in bid line item table n reject if yes
		auctionCheck(productId, req ,res);
	}
	//validations
	var condList = getProductConditionList();
	var statusList = getProductStatusList();
	//1 - check for null fields
	//newProduct = JSON.stringify(newProduct);
	//console.log('new product -'+ newProduct);
if(req.body.product_name.length == 0 || req.body.product_desc == null || req.body.seller_id == null || req.body.category_id == null){
	console.log('error in 1');
	res.status(400).render('error-nikhil', {
		errMsg : 'mandatory fields cannot be null'
	});
	return;
}

if(req.body.seller_id != req.session.pid){
	console.log('error in 2');
	res.status(403).render('error-nikhil', {
		errMsg : 'operation not authorized for this user'
	});
	return;
}
	//2 - compare fields with finite set of values with 
	//the value set(status,condition,units in stock, price per unit)
	
	var modeList = getSellMode();
	if(modeList.indexOf(mode) == -1){
		console.log('error in 3');
		res.status(400).render('error-nikhil', {
			errMsg : 'invalid value for field sell mode'
		});
		return;
	}
	
	if(mode=='Fixed Price'){
	if (isNaN(parseFloat(req.body.units_in_stock)) || req.body.units_in_stock < 0) {
		console.log('error in 4');
		res.status(400).render('error-nikhil', {
			errMsg : 'units in stock must be a valid positive number'
		});
		return;
	}
	if (isNaN(parseFloat(req.body.price_per_unit)) || req.body.price_per_unit < 0) {
		console.log('error in 5');
		res.status(400).render('error-nikhil', {
			errMsg : 'price per unit must be a valid positive number'
		});
		return;
	}
}
	if(mode=='Auction'){
		console.log('bid xpiry before --'+req.body.bid_expiry);
		var bidexpiry = moment(req.body.bid_expiry).format('YYYY-MM-DD HH:mm:ss');
		var now = moment().format('YYYY-MM-DD HH:mm:ss');
		console.log('bid xpiry after --'+bidexpiry);
		
		if (isNaN(parseFloat(req.body.start_amount)) || req.body.start_amount < 0) {
			console.log('error in 6');
			res.status(400).render('error-nikhil', {
				errMsg : 'start amount must be a valid positive number'
			});
			return;
		}
		if( !moment(req.body.bid_expiry).isValid()|| !moment(req.body.bid_expiry).isAfter(now) ){
			console.log('error in 7');
			res.status(400).render('error-nikhil', {
				title : 'please specify a valid bid expiry time greater than current time'
			});
			return;
		}
		units_in_stock = 1;
	}
	if(condList.indexOf(req.body.product_condition) == -1){
		console.log('error in 8');
		res.status(400).render('error-nikhil', {
			errMsg : 'invalid value for field product condition'
		});
		return;
	}
	if(statusList.indexOf(req.body.product_status) == -1){
		console.log('error in 9');
		res.status(400).render('error-nikhil', {
			errMsg : 'invalid value for field product status'
		});
		return;
	}
	var bidtime = bidexpiry;
	if(bidtime == ''){
		bidtime = null;
	}
	var updProduct = {
			seller_id : req.body.seller_id,
			product_name : req.body.product_name,
			product_desc : req.body.product_desc,
			product_condition : req.body.product_condition,
			product_status : req.body.product_status,
			category_id : req.body.category_id,
			price_per_unit : req.body.price_per_unit,
			product_listed_as : req.body.product_listed_as,
			units_in_stock : units_in_stock,
			bid_expiry_time : bidtime
		};
	
	
	var updates = [updProduct, productId];
	updateProductSql = mysql.format(updateProductSql, updates);
	
	//update the record
	runQuery(updateProductSql, req, res, function(status, result){

		//res.send('record updated successfully');
		//redirect to seller view
		if (mode == 'Auction') {
			var bid_header = {
					bid_start_price : req.body.start_amount
				};
				var insertBid = 'UPDATE bid_header_item SET ? WHERE product_id = ?';
				var inserts1 = [ bid_header, productId ];
				insertBid = mysql.format(insertBid, inserts1);
				runQuery(insertBid, req, res, function(status, result){
					console.log('updating bid');
					res.status(200);
					res.redirect('/seller-details');
					
				});
				return;
		}else{
			console.log('insert id --' + result.insertId);
			console.log('not an auction prod');
			res.status(200);
			res.redirect('/seller-details');
			return;
		}
	});
	
	//Redis
	var redisQuery="select * from product where product_id="+productId+";";
	runQuery(redisQuery,req,res, function(status, result){

		console.log("priniting product id for update : "+productId);
		client.get(redisQuery, function(err,redisResult){
			if(err){
				console.log("inside error while fetching from cache");
			}
			else{
				client.get(redisQuery, function(err,redisResult){
					if(err){
						console.log("inside error while fetching from cache");
					}
					else{
						if(!redisResult){
							console.log("inderting into cache");
							client.setex(productId,1000,JSON.stringify(result));
							//console.log("inderting into cache");
							console.log("Printing results updated into cache with update:"+result);
						}
						else{
							client.del(productId);
							client.setex(productId,1000,JSON.stringify(result));
							console.log("Printing results updated into cache with update:"+result);
						}
					}
				});

			}
		});
	});
	//Redis
	
	return;
}

function handleDelete(req,res){

	var productId = req.body.product_id;
	var seller = req.session.pid;
	if(seller != req.body.seller_id){
		res.status(403).render('error-nikhil', {
			errMsg : 'Forbidden - not authorized to perform this operation'
		});
		return;
	}
	
	var deleteSql = 'UPDATE product SET isActiveProduct=0 WHERE product_id = ?';
	var deletes = [productId];
	deleteSql = mysql.format(deleteSql, deletes);

	var prodsql = 'select distinct c.bid_expiry_time,a.bid_id from bid_header_item a, bid_line_item b, product c'+
		' where a.product_id = ? and a.product_id = c.product_id and a.bid_id = b.bid_id';
	var deletecheck = [productId];
	prodsql = mysql.format(prodsql,deletecheck);
	
	runQuery(prodsql, req, res, function(status, result1){
		if (result1.length != 0 &&
			moment(result1[0].bid_expiry_time).isAfter(moment().format('YYYY-MM-DD HH:mm:ss'))){
			res.status(403).render('error-nikhil',{
				errMsg : 'Product cannot be deleted. There are active bids for this product.'
			});
			return;
		}
		runQuery(deleteSql, req, res, function(status, result){
			res.status(200);
            //res.send('deleted record successfully');
			//redirect to seller view

           //Redis
		     		client.del(productId);
			//Redis
		        		
			res.status(status).redirect('/seller-details');
		});
		return;
	});

}
function aboutSeller(req,res){
	//calculate average rating from order_history
	//fetch history from order_history
	//use the list function to display products of a seller
	var seller = '', averageRating = 0, person_in_session='', sellerProduct = '';
	var sellerHistorySql = '', sellerSql = '', history = '', seller_details='', productSql = '';
	
	person_in_session = req.session.pid;
	//seller = req.query.seller_id;
	//also compare user in session and the seller id for product updates
	if( req.params.id != null){
	seller = req.params.id;
	}else{
		seller = person_in_session;
	}
	var sellerHome = '';
	if(seller == person_in_session){
		sellerHome = 'Y';
	}else{
		sellerHome = 'N';
	}
//	sellerHistorySql = 'SELECT a.product_id, b.product_name, a.customer_id, a.quantity, a.order_amount, a.bid_id, a.seller_rating'+
//	'FROM ebay.order_history a, ebay.product b'+
//	'WHERE a.seller_id = '+seller+' AND a.product_id = b.product_id'+
//	'ORDER BY a.order_id desc';
	
	sellerHistorySql = 'SELECT a.product_id, b.product_name, a.customer_id, a.quantity, a.order_amount, a.bid_id, a.order_date,'+
	' a.seller_rating FROM order_history a, product b '+
	'WHERE a.seller_id = ? AND a.product_id = b.product_id'+
	' ORDER BY a.order_id desc';
	
	var sells = [seller];
	sellerHistorySql = mysql.format(sellerHistorySql, sells);
	
//	sellerSql = 'SELECT person_id, person_fname, person_lname from ebay.person where person_id = '+seller;
	sellerSql = 'SELECT person_id, person_fname, person_lname FROM person WHERE '+
	' isactive = \'1\' AND person_id = ?';
	sellerSql = mysql.format(sellerSql, sells);
	
//	productSql = 'SELECT product_id, product_name FROM ebay.product WHERE '+
//	' seller_id = '+seller;
	productSql = 'SELECT product_id, product_name, seller_id FROM product WHERE '+
	' isActiveProduct = 1 AND seller_id = ?';
	productSql = mysql.format(productSql, sells);
		
	runQuery(sellerSql, req, res, function(status, result){
		seller_details = result;
		runQuery(productSql, req, res, function(status, result){
			sellerProduct = result;
			runQuery(sellerHistorySql, req , res, function(status, result){
				history = result;
				var i=0;
				for(; i< history.length; i++){
					averageRating+=history[i].seller_rating;
				}
				averageRating = averageRating/i;
				
				if(isNaN(averageRating)){
					averageRating = 0;
				}
//				console.log('seller rating --' + averageRating);
//				console.log('history --' + history);
//				console.log('seller details --' + seller_details);
//				console.log('seller product --' + sellerProduct)
				if(seller_details.length == 0){
					res.status(400);
					res.render('error-nikhil',{
						errMsg : "Bad request. The seller does not exist!"
						});
					
				}else{
				res.status(200);
				res.render('seller-screen', {
					history : history,
					details : seller_details,
					products: sellerProduct,
				sellerHome : sellerHome,
				rating : averageRating
				});
//				res.send('details about the seller');
				}
			});

			
		});
	});
	

	
	return;
}

//function sellProduct(req, res){
//	
//	var sellerId = '', sellerProduct = '', product_id;
//	var productSql = 'SELECT product_id, product_name, price_per_unit, sell_mode FROM product WHERE '+
//	' isActiveProduct = 1 AND seller_id = ? AND product_id = ?';
//	sellerId = req.session.pid;
//	product_id = req.query.product_id;
//	var sells = [ sellerId, product_id ];
//	productSql = mysql.format(productSql, sells);
//		
//	var sell_mode = getSellMode();
//	
//	runQuery(productSql, req, res, function(status, result){
//		sellerProduct = result;
//		res.status(status);
//		res.render('sell-product',{
//			product : sellerProduct,
//			sell_mode : sell_mode
//		});
//		
//	});
//		
//}
exports.list = list;
exports.newProductForm = newProductForm;
exports.handleNewProduct=handleNewProduct;
exports.handleDelete=handleDelete;
exports.aboutSeller = aboutSeller;
//exports.sellProduct = sellProduct;
exports.updateForm = updateForm;
exports.handleProductUpdate = handleProductUpdate;