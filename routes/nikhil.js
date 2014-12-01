/**
 * New node file
 */
var ejs = require("ejs");
var mysql = require('mysql');
var db = require('./mysql');
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

function getProductConditionList(){
	var conditionList = ['new','refurbished','used'];
	return conditionList;
}

function getProductStatusList(){
	var statusList = ['in-stock','out-of-stock'];
	return statusList;
}

function getSellMode(){
	var productListingType = ['Fixed-Price','Auction'];
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
			res.redirect('/index', {
				errMsg : ''
			});
		}else{
			callback(status, result);
			return;
		}
		
	});
	//return;
}

function newProductForm(req,res){
	
	//req.session.user = '1';
	var categoryList = '', productCondition = '', productStatus = '';
	var categoryListSql = "select distinct `category_id`, `category_name` from category";
	
	runQuery(categoryListSql,req,res, function(status, result){
		categoryList = result;
	//	console.log("inside category list callback");
		console.log(categoryList);
		
		//also get select list for prod_condition and status
		productCondition = getProductConditionList();
		productStatus = getProductStatusList();
		var sell_mode = getSellMode();
//		res.status(status);
//		res.send(categoryList);
		res.render("create-product",{
			//add the session attributes to display
			 category : categoryList,
			 seller_id : '1',
			 productCondition : productCondition,
			 productStatus : productStatus,
			 sell_mode : sell_mode
		});
	});
	
	return;
}


function handleNewProduct(req,res){
	req.session.pid = '1';
	
	var insertProductSql = "INSERT INTO PRODUCT SET ?";
	var units_in_stock = req.body.units_in_stock;
	//validations
	var condList = getProductConditionList();
	var statusList = getProductStatusList();
	//1 - check for null fields
	//newProduct = JSON.stringify(newProduct);
	//console.log('new product -'+ newProduct);
if(req.body.product_name == null || req.body.product_desc == null || req.body.seller_id == null || req.body.category_id == null){
	console.log('error in 1');
	res.status(400).redirect('/error', {
		errMsg : 'mandatory fields cannot be null'
	});
	return;
}

//if(req.body.seller_id !== req.session.pid){
//	console.log('error in 2');
//	res.status(403).redirect('/error', {
//		errMsg : 'operation not authorized for this user'
//	});
//	return;
//}
	//2 - compare fields with finite set of values with 
	//the value set(status,condition,units in stock, price per unit)
	var mode = req.body.sell_mode;
	var modeList = getSellMode();
	if(modeList.indexOf(mode) == -1){
		console.log('error in 3');
		res.status(400).redirect('/error', {
			errMsg : 'invalid value for field sell mode'
		});
		return;
	}
	
	if(mode=='Fixed-Price'){
	if (isNaN(parseFloat(req.body.units_in_stock)) || req.body.units_in_stock < 0) {
		console.log('error in 4');
		res.status(400).redirect('/error', {
			errMsg : 'units in stock must be a valid positive number'
		});
		return;
	}
	if (isNaN(parseFloat(req.body.price_per_unit)) || req.body.price_per_unit < 0) {
		console.log('error in 5');
		res.status(400).redirect('/error', {
			errMsg : 'price per unit must be a valid positive number'
		});
		return;
	}
}
	if(mode=='Auction'){
		if (isNaN(parseFloat(req.body.start_amount)) || req.body.start_amount < 0) {
			console.log('error in 6');
			res.status(400).redirect('/error', {
				errMsg : 'start amount must be a valid positive number'
			});
			return;
		}
		if(req.body.bid_expiry == null){
			console.log('error in 7');
			res.status(400).redirect('/error', {
				errMsg : 'please specify the auction end time - bid expiry'
			});
			return;		
		}
		units_in_stock = 1;
	}
	if(condList.indexOf(req.body.product_condition) == -1){
		console.log('error in 8');
		res.status(400).redirect('/error', {
			errMsg : 'invalid value for field product condition'
		});
		return;
	}
	if(statusList.indexOf(req.body.product_status) == -1){
		console.log('error in 9');
		res.status(400).redirect('/error', {
			errMsg : 'invalid value for field product status'
		});
		return;
	}
	var bidtime = req.body.bid_expiry;
		if(bidtime == ''){
			bidtime = null;
		}
	// row insertion
	var newProduct = {
			seller_id : req.body.seller_id,
			product_name : req.body.product_name,
			product_desc : req.body.product_desc,
			product_condition : req.body.product_condition,
			product_status : req.body.product_status,
			category_id : req.body.category_id,
			price_per_unit : req.body.price_per_unit,
			units_in_stock : units_in_stock,
			product_listed_as : req.body.sell_mode,
			bid_expiry_time : bidtime,
			isActiveProduct : '1'
		};
	console.log(newProduct);
	
	var inserts = [newProduct];
	insertProductSql = mysql.format(insertProductSql, inserts);
	//console.log("ins sql -"+insertProductSql);
	//console.log(newProduct);
	runQuery(insertProductSql,req,res, function(status, result){
//		dba_audit(req.session.uname, req.connection.remoteAddress, 'insert', 'ebayTeam6', 'product',
//		insertProductSql);

		var insertId = result.insertId;
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
					res.redirect('/sell');
					
				});
				return;
		}else{
			console.log('insert id --' + result.insertId);
			console.log('not an auction prod');
			res.status(200);
			res.redirect('/sell');
			return;
		}

		//console.log("inside new product callback");
		//console.log(result);
		
//		res.status(201);
//		res.send("record inserted"+result);
		//redirect to seller view
	});
	return;
}
function updateForm(req,res){
	
	req.session.person = '1';
	var currentCategory = '', categoryList = '', product = '';
	var currentCondition='', currentStatus='', conditionList = '', statusList = '';
	var productId = req.query.product_id; //or - req.params.product_id;
	var getProductModeSql = 'SELECT product_listed_as from PRODUCT where product_id = ?';

	var prod = [productId];
	getProductModeSql = mysql.format(getProductModeSql, prod);
	var getAuctionRecordSql = 'SELECT `seller_id`,a.product_id,`product_name`,`product_desc`,'+
	'`product_condition`,`product_status`,`category_id`,`price_per_unit`,'+
	'`units_in_stock`,`product_listed_as`,`bid_expiry_time`,b.bid_start_price FROM product a, bid_header_item b '+
	' WHERE a.product_id = b.product_id and a.product_id = ? AND isActiveProduct = 1 and product_listed_as = \'Auction\'';

	var getFixedRecordSql = 'SELECT `seller_id`,a.product_id,`product_name`,`product_desc`,'+
	'`product_condition`,`product_status`,`category_id`,`price_per_unit`,'+
	'`units_in_stock`,`product_listed_as`,`bid_expiry_time`,b.bid_start_price FROM product a, bid_header_item b '+
	' WHERE a.product_id = b.product_id and a.product_id = ? AND isActiveProduct = 1 and product_listed_as = \'Fixed-Price\'';
	var finalquery;
	var updates = [productId];
	getAuctionRecordSql = mysql.format(getAuctionRecordSql, updates);
	getFixedRecordSql = mysql.format(getFixedRecordSql, updates);

	var categoryListSql = "select distinct `category_id`, `category_name` from category";

	//also get select list for prod_condition and status
	conditionList = getProductConditionList();
	statusList = getProductStatusList();

	runQuery(categoryListSql,req,res, function(status, result){
		categoryList = result;
		runQuery(getProductModeSql, req, res, function(status, result){
			var prod_listed_as = result[0].product_listed_as;
			if(prod_listed_as == 'Auction'){
				finalquery = getAuctionRecordSql;
			}else{
				finalquery = getFixedRecordSql;
			}
			runQuery(finalquery, req, res, function(status, result){
				if(status == 200){
					product = result;
					currentCategory = result[0].category_id;
					currentCondition = result[0].product_condition;
					currentStatus = result[0].product_status;
console.log('BID START --'+product[0].bid_start_price);
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
					res.status(status).send('Bad request. The product you are trying to update does not exist');
					//render error message
				}
			});
		});
	});
			
	
	
	return;
}

function handleProductUpdate(req,res){
	
	var productId = '', units_in_stock;
	var updateProductSql='UPDATE ebay.product SET ? WHERE product_id = ?';
	
	//validations
	var condList = getProductConditionList();
	var statusList = getProductStatusList();
	//1 - check for null fields
	//newProduct = JSON.stringify(newProduct);
	//console.log('new product -'+ newProduct);
if(req.body.product_name == null || req.body.product_desc == null || req.body.seller_id == null || req.body.category_id == null){
	console.log('error in 1');
	res.status(400).redirect('/error', {
		errMsg : 'mandatory fields cannot be null'
	});
	return;
}

//if(req.body.seller_id !== req.session.pid){
//	console.log('error in 2');
//	res.status(403).redirect('/error', {
//		errMsg : 'operation not authorized for this user'
//	});
//	return;
//}
	//2 - compare fields with finite set of values with 
	//the value set(status,condition,units in stock, price per unit)
	var mode = req.body.product_listed_as;
	var modeList = getSellMode();
	if(modeList.indexOf(mode) == -1){
		console.log('error in 3');
		res.status(400).redirect('/error', {
			errMsg : 'invalid value for field sell mode'
		});
		return;
	}
	
	if(mode=='Fixed-Price'){
	if (isNaN(parseFloat(req.body.units_in_stock)) || req.body.units_in_stock < 0) {
		console.log('error in 4');
		res.status(400).redirect('/error', {
			errMsg : 'units in stock must be a valid positive number'
		});
		return;
	}
	if (isNaN(parseFloat(req.body.price_per_unit)) || req.body.price_per_unit < 0) {
		console.log('error in 5');
		res.status(400).redirect('/error', {
			errMsg : 'price per unit must be a valid positive number'
		});
		return;
	}
}
	if(mode=='Auction'){
		if (isNaN(parseFloat(req.body.start_amount)) || req.body.start_amount < 0) {
			console.log('error in 6');
			res.status(400).redirect('/error', {
				errMsg : 'start amount must be a valid positive number'
			});
			return;
		}
		if(req.body.bid_expiry == null){
			console.log('error in 7');
			res.status(400).redirect('/error', {
				errMsg : 'please specify the auction end time - bid expiry'
			});
			return;
		}
		units_in_stock = 1;
	}
	if(condList.indexOf(req.body.product_condition) == -1){
		console.log('error in 8');
		res.status(400).redirect('/error', {
			errMsg : 'invalid value for field product condition'
		});
		return;
	}
	if(statusList.indexOf(req.body.product_status) == -1){
		console.log('error in 9');
		res.status(400).redirect('/error', {
			errMsg : 'invalid value for field product status'
		});
		return;
	}
	var bidtime = req.body.bid_expiry;
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
	
	productId = req.body.product_id;
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
					res.redirect('/sell');
					
				});
				return;
		}else{
			console.log('insert id --' + result.insertId);
			console.log('not an auction prod');
			res.status(200);
			res.redirect('/sell');
			return;
		}
	});
	return;
}

function handleDelete(req,res){
	var productId = req.body.product_id;
//	var seller = req.session.pid;
//	if(seller !== req.body.seller_id){
//		res.status(403).redirect('/error', {
//			errMsg : 'Forbidden - not authorized to perform this operation'
//		});
//		return;
//	}
var deleteSql = 'UPDATE product SET isActiveProduct=0 WHERE product_id = ?';
var deletes = [productId];
deleteSql = mysql.format(deleteSql, deletes);

runQuery(deleteSql, req, res, function(status, result){
	res.status(200);
//	res.send('deleted record successfully');
	//redirect to seller view
	res.status(status).redirect('/sell');
});
	return;
}
function aboutSeller(req,res){
	//calculate average rating from order_history
	//fetch history from order_history
	//use the list function to display products of a seller
	req.session.pid = '1';
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
	sellerSql = 'SELECT person_id, person_fname, person_lname FROM ebay.person WHERE '+
	' isActive = \'A\' AND person_id = ?';
	sellerSql = mysql.format(sellerSql, sells);
	
//	productSql = 'SELECT product_id, product_name FROM ebay.product WHERE '+
//	' seller_id = '+seller;
	productSql = 'SELECT product_id, product_name FROM ebay.product WHERE '+
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
				console.log('seller rating --' + averageRating);
				console.log('history --' + history);
				console.log('seller details --' + seller_details);
				console.log('seller product --' + sellerProduct)
				if(seller_details.length == 0){
					res.status(400);
					res.send("Bad request. The seller does not exist!");
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