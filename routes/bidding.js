/**
 * New node file
 */
var db = require('./mysql');
var ejs = require("ejs");
var moment = require("moment");

function listBidsForProduct(req, res){
	console.log("Inside list bids for Product");	
	var productId = req.param("productid");
	console.log("product ID:"+productId);	
	var fetchProductDetails = "select product.product_id product_id, product_condition, product_listed_as, price_per_unit, product_status, product_name, product_desc,IFNULL((select max(bid_amount) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id), (select bid_start_price from bid_header_item where bid_header_item.product_id = product.product_id)) currentBid, (select count(distinct customer_id) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id) noOfBidders, (select count(1) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id) noOfBids, bid_expiry_time  from product where product.product_id =  "+productId;
	db.executeQuery(fetchProductDetails, function(err,status, resultProductDetails){
		if(err){
			throw err;
		}
		else{
			var fetchBidDetails = "select bid_id, person_email, bid_amount, bid_timestamp from bid_line_item, person  where bid_line_item.customer_id = person.person_id and bid_id = "+resultProductDetails[0].bid_id+" order by bid_amount desc";
			db.executeQuery(fetchBidDetails, function(err,status, resultBidList){
				if(err){
					throw err;
				}
				else{
					//console.log("product_name:"+resultProductDetails[0].product_name);
					console.log("product_desc:"+resultProductDetails[0].product_desc);
					console.log("current Bid:"+resultProductDetails[0].currentBid);
					console.log("number of Bidders:"+resultProductDetails[0].noOfBidders);
					console.log("bid person email:"+resultBidList[0].person_email);
					console.log("bid amount:"+resultBidList[0].bid_amount);
					ejs.renderFile('./views/listBidsForProduct.ejs',{ productDetails : resultProductDetails, bidList : resultBidList, customerId : req.session.pid},function(err, result) {
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
				}
			});
			
		}
	});
}

function displayProductDetailsWithMessage(req, res, errorMessage){

	var productId = req.param("productidfordisplay");
    var input = JSON.parse(JSON.stringify(req.body));
    var sqlStmt="INSERT INTO ebay.order_history set ? ";
	console.log("errormessage:"+errorMessage); 
	//validations
		//1 - check for null fields
		var keys = Object.keys( req.body );
		console.log('keys -'+keys);
	console.log("product ID new:"+ productId);	
	console.log("errormessage:"+errorMessage); 
	var fetchProductDetails = "select product.product_id product_id, product_condition, product_listed_as, price_per_unit, product_status, product_name, product_desc,IFNULL((select max(bid_amount) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id), (select bid_start_price from bid_header_item where bid_header_item.product_id = product.product_id)) currentBid, (select count(distinct customer_id) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id) noOfBidders, (select count(1) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id) noOfBids, bid_expiry_time  from product where product.product_id =  "+productId;
	db.executeQuery(fetchProductDetails, function(err,status, resultProductDetails){
		if(err){
			throw err;
		}
		else{
			//console.log("product_name:"+resultProductDetails[0].product_name);
			console.log("product_desc:"+resultProductDetails[0].product_desc);
			console.log("current Bid:"+resultProductDetails[0].currentBid);
			console.log("number of Bidders:"+resultProductDetails[0].noOfBidders);
			var fetchSellerDetails = "select seller_id, person_email, (select count(1) from order_history where seller_id = product.seller_id) noOfProductsSold from person, product where person.person_id = product.seller_id and product_id = "+productId;
			db.executeQuery(fetchSellerDetails, function(err,status, resultSellerDetails){
				if(err){
					throw err;
				}
				else{
					console.log("person_email:"+resultSellerDetails[0].person_email);
					console.log("errorMessage:"+errorMessage);
					if(resultProductDetails[0].product_status === "Sold")  errorMessage = "This product has been sold. The Auction has ended.";
					ejs.renderFile('./views/productDetails.ejs',{ productDetails : resultProductDetails, sellerDetails: resultSellerDetails, customerId: req.session.pid, errormsg:errorMessage, lastLoginTime: req.session.lasttimelog, userName: req.session.uname},function(err, result) {
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
				}
			});
		}
	});
}

function displayProductDetails(req, res){

	var productId = req.param("productidfordisplay");
    var input = JSON.parse(JSON.stringify(req.body));
	console.log("product ID new:"+ productId);	
	var fetchProductDetails = "select product.product_id product_id, product_condition, product_listed_as, price_per_unit, product_status, product_name, product_desc,IFNULL((select max(bid_amount) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id), (select bid_start_price from bid_header_item where bid_header_item.product_id = product.product_id)) currentBid, (select count(distinct customer_id) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id) noOfBidders, (select count(1) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id) noOfBids, bid_expiry_time  from product where product.product_id = "+productId;
	db.executeQuery(fetchProductDetails, function(err,status, resultProductDetails){
		if(err){
			throw err;
		}
		else{
			//console.log("product_name:"+resultProductDetails[0].product_name);
			console.log("product_desc:"+resultProductDetails[0].product_desc);
			console.log("current Bid:"+resultProductDetails[0].currentBid);
			console.log("number of Bidders:"+resultProductDetails[0].noOfBidders);
			var fetchSellerDetails = "select seller_id, person_email, (select count(1) from order_history where seller_id = product.seller_id) noOfProductsSold from person, product where person.person_id = product.seller_id and product_id = "+productId;
			db.executeQuery(fetchSellerDetails, function(err,status, resultSellerDetails){
				if(err){
					throw err;
				}
				else{
					console.log("person_email:"+resultSellerDetails[0].person_email);
					var errorMessage = "";
					if(resultProductDetails[0].product_status === "Sold")  errorMessage = "This product has been sold. The Auction has ended.";
					ejs.renderFile('./views/productDetails.ejs',{ productDetails : resultProductDetails, sellerDetails: resultSellerDetails, customerId: req.session.pid, errormsg:errorMessage, lastLoginTime: req.session.lasttimelog, userName: req.session.uname},function(err, result) {
						// render on success,
						if (!err) {
							res.end(result);
						}
						// render or error
						else {
							res.end('An error occurred');
							console.log(err);
						}
					});					
				}
			});
		}
	});
}

function placeBid(req, res){
	console.log("inside place bid function");
	var productId = req.param("productid");
	var customerId = req.param("customerid");
	var newBidAmt = req.param("newbidamt");
	console.log("productId:"+productId);
	console.log("customerId:"+customerId);
	console.log("req.session.pid:"+req.session.pid);
	console.log("newBidAmt:"+newBidAmt);
//	var ebayplacebid = "set @in_product_id=1; set @in_bid_amt=10.56; set @in_customerid=1; call EBAY_PLACE_BID(@in_product_id, @in_bid_amt, @in_customerid, @out_err_code); select @out_err_code as out_err_code";
	var checkIfCustomerExists = "select person_id from person where person_id="+customerId;
	var fetchProductDetails = "select product.product_id product_id, product_condition, product_listed_as, price_per_unit, product_status, product_name, product_desc,IFNULL((select max(bid_amount) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id), (select bid_start_price from bid_header_item where bid_header_item.product_id = product.product_id)) currentBid, (select count(distinct customer_id) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id) noOfBidders, (select count(1) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id) noOfBids, bid_expiry_time  from product where product.product_id = "+productId;
	db.executeQuery(fetchProductDetails, function(err,status, resultProductDetails){
		if(err){
			throw err;
		}
		else{
			//console.log("product_name:"+resultProductDetails[0].product_name);
			console.log("product_desc:"+resultProductDetails[0].product_desc);
			console.log("current Bid:"+resultProductDetails[0].currentBid);
			console.log("number of Bidders:"+resultProductDetails[0].noOfBidders);
			var errorMessage = "";
			if(resultProductDetails[0].product_status === "Sold")  errorMessage = "This product has been sold. The Auction has ended.";
			var fetchSellerDetails = "select seller_id, person_email, (select count(1) from order_history where seller_id = product.seller_id) noOfProductsSold from person, product where person.person_id = product.seller_id and product_id = "+productId;
			db.executeQuery(fetchSellerDetails, function(err,status, resultSellerDetails){
				if(err){
					throw err;
				}
				else{
					var checkValidCustomer = ""
					console.log("person_email:"+resultSellerDetails[0].person_email);
					db.executeQuery(checkIfCustomerExists, function(err,status, resultCustomerExists){
						if(err){
							throw err;
						}
						else{
							if (status === 404){
								console.log("Error - Not a valid customer");
								errorMessage = "Error - Not a valid customer";
								ejs.renderFile('./views/productDetails.ejs',{ productDetails : resultProductDetails, sellerDetails: resultSellerDetails, customerId: req.session.pid, errormsg:errorMessage, lastLoginTime: req.session.lasttimelog, userName: req.session.uname},function(err, result) {
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
								console.log("check if auction exists");
								var checkIfAuctionExistsQry = "select bid_id from bid_header_item where product_id = (select product_id from product where product_listed_as = 'Auction' and product_id ="+productId+")";
								console.log("checkIfAuctionExists:"+checkIfAuctionExistsQry);
								db.executeQuery(checkIfAuctionExistsQry, function(err,status, resultBidId){
									if(err){
										throw err;
									}
									else{
										if (status === 404){
											console.log("Error - This item is not up for bidding");
											errorMessage = "Error - This product is not up for auction";
											ejs.renderFile('./views/productDetails.ejs',{ productDetails : resultProductDetails, sellerDetails: resultSellerDetails, customerId: req.session.pid, errormsg:errorMessage, lastLoginTime: req.session.lasttimelog, userName: req.session.uname},function(err, result) {
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
											console.log("The bid id is: "+resultBidId[0].bid_id);
											var fetchLastBid = "select max(bid_amount) maxBidAmount from bid_line_item where bid_id = "+resultBidId[0].bid_id;
											var minBidAmtReqd;
											db.executeQuery(fetchLastBid, function(err,status, resultLastBid){
												if(err){
													throw err;
												}
												else{
													if (status === 404){
														console.log("This is the first bid");
														var fetchMinimumBidPrice = "select bid_start_price from bid_header_item where bid_id = "+resultBidId[0].bid_id;
														db.executeQuery(fetchMinimumBidPrice, function(err,status, resultMinBidPrice){
															if(err){
																throw err;
															}
															else{
																if (status === 404){
																	console.log("Error -  Product is not up for auction");
																	errorMessage = "Error - This product is not up for auction";
																	ejs.renderFile('./views/productDetails.ejs',{ productDetails : resultProductDetails, sellerDetails: resultSellerDetails, customerId: req.session.pid, errormsg:errorMessage, lastLoginTime: req.session.lasttimelog, userName: req.session.uname},function(err, result) {
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
																	console.log("The intitial bid id is: "+resultMinBidPrice[0].bid_start_price);
																	minBidAmtReqd = resultMinBidPrice[0].bid_start_price;
																}
															}
														});

													}else{
														console.log("The max bid value is: "+resultLastBid[0].maxBidAmount);
														minBidAmtReqd = resultLastBid[0].maxBidAmount;
														if ( newBidAmt < minBidAmtReqd){
															console.log("newBidAmt:"+newBidAmt);
															console.log("minBidAmtReqd:"+minBidAmtReqd);															
															console.log("Bid amount lesser than previous bid");
															errorMessage = "Error - Bid amount should be greater than $"+minBidAmtReqd
															ejs.renderFile('./views/productDetails.ejs',{ productDetails : resultProductDetails, sellerDetails: resultSellerDetails, customerId: req.session.pid, errormsg:errorMessage, lastLoginTime: req.session.lasttimelog, userName: req.session.uname},function(err, result) {
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
														}
														else {
															console.log("newBidAmt:"+newBidAmt);
															console.log("minBidAmtReqd:"+minBidAmtReqd);
															console.log("Successfully placed bid");
															var insertBidQry = "insert into bid_line_item(bid_id, customer_id, bid_amount, bid_timestamp) values ("+resultBidId[0].bid_id+", "+customerId+", "+newBidAmt+", SYSDATE())";
															db.executeQuery(insertBidQry, function(err,status, resultInsert){
																if(err){
																	throw err;
																}
																else{
																	console.log("procedure successuflly executed"+status);
																	var fetchNewProductDetails = "select product.product_id product_id, product_condition, product_listed_as, price_per_unit, product_status, product_name, product_desc,IFNULL((select max(bid_amount) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id), (select bid_start_price from bid_header_item where bid_header_item.product_id = product.product_id)) currentBid, (select count(distinct customer_id) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id) noOfBidders, (select count(1) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and bid_header_item.product_id = product.product_id) noOfBids, bid_expiry_time  from product where product.product_id = "+productId;
																	db.executeQuery(fetchNewProductDetails, function(err,status, resultNewProductDetails){
																		if(err){
																			throw err;
																		}
																		else{
																			console.log("product_desc:"+resultNewProductDetails[0].product_desc);
																			var errorMessage = "";
																			if(resultNewProductDetails[0].product_status === "Sold")  errorMessage = "This product has been sold. The Auction has ended.";
																			ejs.renderFile('./views/productDetails.ejs',{ productDetails : resultNewProductDetails, sellerDetails: resultSellerDetails, customerId: req.session.pid, errormsg:errorMessage, lastLoginTime: req.session.lasttimelog, userName: req.session.uname},function(err, result) {
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
																		}
																	});
																}
															});

														}													
													}
												}
											});

										}
									}
								});

							}
						}
					});
				}
			});
		}
	});
}

function buyProduct (req, res){

	var input = JSON.parse(JSON.stringify(req.body));
	var sqlStmt="INSERT INTO ebay.order_history set ? ";

	//validations
	//1 - check for null fields
	var keys = Object.keys( req.body );
	console.log('keys -'+keys);

	for (var i = 0, length = keys.length; i < length; i++) {
		// console.log(req.body[ keys[ i ] ]);
		if (req.body[keys[i]] == null) {

			res.status(400).redirect('/error', {
				errMsg : 'mandatory fields cannot be null -- '+req.body[keys[i]]
			});
			return;
		}else{
			console.log(req.body["productidfordisplay"]);
			console.log(input.productidfordisplay);
			console.log("Quantity:"+input.productqty);
			console.log(req.body["productqty"]);
			console.log("seller rating:"+input.seller_rating);
		}
	}


	//2 - compare fields with finite set of values with 
	//the value set(status,condition,units in stock, price per unit)
	if (isNaN(parseFloat(input.productqty)) || input.productqty < 0) {
		displayProductDetailsWithMessage(req,res, "Quantity must be a valid positive number");
		return;
	}		
	if (isNaN(parseFloat(input.productPrice)) || input.productPrice < 0) {
		displayProductDetailsWithMessage(req,res, "Order  must be a valid positive number");
		return;
	}
	
	if ( (input.seller_rating !== "") && (isNaN(parseFloat(input.seller_rating)) || input.seller_rating < 0)) {
		displayProductDetailsWithMessage(req,res, "Seller rating must be a valid positive number");
		return;
	}


	var p_id=input.productidfordisplay;
	var s_id=input.seller_id;
	var l_orderAmount = (input.productqty * input.productPrice).toFixed(2);
	
	var l_sellerRating;
	if (input.seller_rating === "") 
		l_sellerRating = 0;
	else 
		l_sellerRating = input.seller_rating;
	var l_productqty = input.productqty;
	var b_id=-1;
	
	var now = moment().format('YYYY-MM-DD HH:mm:ss');
	
	var data = {	            
		product_id : input.productidfordisplay,
		seller_id : input.seller_id,
		customer_id: req.session.pid,
		quantity:input.productqty,
		order_amount:l_orderAmount,
		bid_id: b_id,
		seller_rating:l_sellerRating,
		order_date: now
	};
	
    db.execQueryWithParams(sqlStmt, data, function(err, rows) {
		if (err) {
			console.log('Error in inserting final order details into DB');
			displayProductDetailsWithMessage(req,res, "Order creation has failed. Please reach helpdesk.");
		}
		else{
			console.log("insert successful while buying a product");
			var sqlStmt1= "select units_in_stock as quantity from ebay.product where product_id="+p_id+" and seller_id="+s_id+";"	
            var sqlStmt2="UPDATE ebay.product SET units_in_stock=units_in_stock-"+l_productqty+" where product_id="+p_id+" and seller_id="+s_id+";"
			var params=null;
             var data = null;
             db.execQueryWithParams(sqlStmt1, data, function(err, rows) {
				if ((rows[0].quantity - l_productqty)  >= 0) {						
					db.execQueryWithParams(sqlStmt2, data, function(err, rows) {
					if (err) {
						displayProductDetailsWithMessage(req,res, "Invalid Product or seller information");
						console.log('error updating product table after purchase');
					}
					displayProductDetailsWithMessage(req,res, "Order has been placed with bill amount $"+l_orderAmount);
					});
				}
				else{
					displayProductDetailsWithMessage(req,res, "This product is out of stock");
					console.log('product out of stock');
				}		
				});
		}
    });


}

exports.placeBid = placeBid;
exports.listBidsForProduct = listBidsForProduct;
exports.displayProductDetails = displayProductDetails;
exports.buyProduct = buyProduct;
exports.displayProductDetailsWithMessage = displayProductDetailsWithMessage;