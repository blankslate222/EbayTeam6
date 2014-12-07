
/**
 * Module dependencies.
 */

var express        = require('express');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var errorHandler   = require('errorhandler');
//var cookieParser   = require('cookie-parser'); 
//var session        = require('express-session'); 
var app            = express();
//var app         = express.app();
var routes         = require('./routes');
var madhur         = require('./routes/madhur');
var signup = require('./routes/signup');
var login = require('./routes/login');
var bids = require('./routes/bidding');
var product = require('./routes/nikhil');
var home = require('./routes/home');
var cartop = require('./routes/myCart');

var io = require('socket.io');
var db = require('./routes/mysql');


var port = 8090;

app.use(express.static(__dirname + '/public')); 	// set the static files location /public/img will be /img for users
app.use(morgan('dev')); 					// log every request to the console
app.use(bodyParser.urlencoded({ extended: false }))    // parse application/x-www-form-urlencoded
app.use(bodyParser.json())    // parse application/json
app.use(methodOverride()); 					// simulate DELETE and PUT
//app.use(cookieParser());
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
	app.use(errorHandler());
}
var authenticate = function (req, res, next) {
	 // your validation code goes here.
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	 var isAuthenticated = req.session.isLoggedin;
	 console.log("is authenticated:  "+isAuthenticated)
	 if (isAuthenticated) {
	   next();
	 }
	 else {
	   res.render('login',{result : ""});
	 }
	}

app.get('/', routes.index);
app.get('/productConditions', madhur.getDistinctProductConditions);
app.get('/productBidStatus', madhur.getDistinctProductBidStatus);
app.get('/search', madhur.productDetails);
app.get('/search/nocaching', madhur.productDetailsNoCaching);
app.get('/personType', madhur.getPersonType);
app.post('/autocomplete/personName', madhur.getPersonNames);
app.post('/autocomplete/membershipid', madhur.getmemIds);
app.post('/autocomplete/personZip', madhur.getPersonZip);
app.post('/autocomplete/personCity', madhur.getPersonCities);
app.post('/autocomplete/personEmail', madhur.getPersonEmail);
app.post('/autocomplete/productName', madhur.getProductNames);
app.get('/search/person', madhur.personDetails);
app.get('/search/person/nocaching',madhur.personDetailsNoCaching)
app.get('/advancesearch/product', routes.profile);
app.get('/advancesearch/person',authenticate, routes.person);
app.get('/categories', madhur.getCategories);
app.get('/team6ebay/login',routes.loginpage);
app.get('/team6ebay/persons/new',routes.addperson);
app.post('/signup',signup.save);
app.post('/login',login.UserLOgIn);
app.post('/logout',authenticate,login.logout);
app.get('/products', product.list);
app.get('/product/new', authenticate, product.newProductForm);
app.post('/product/new', authenticate, product.handleNewProduct);
app.get('/product/update',authenticate, product.updateForm);
app.post('/product/update', authenticate, product.handleProductUpdate);
app.post('/product/delete', authenticate, product.handleDelete);
app.get('/seller-details', authenticate, product.aboutSeller);
app.get('/seller/:id', product.aboutSeller);
app.post('/product/placebid',authenticate, bids.placeBid);
app.post('/product/buy',authenticate, bids.buyProduct);
app.post('/product/bids',authenticate, bids.listBidsForProduct);
app.post('/product/details', bids.displayProductDetails);
//
app.get('/getCustomerInfo',authenticate, home.getCustomerInfo);
app.get('/customer/:id',authenticate, home.getCustomerInfoById);
app.get('/editFname', authenticate, home.editFname);
app.get('/editLname', authenticate, home.editLname);
app.get('/editEmail', authenticate, home.editEmail);
app.get('/editAddress', authenticate, home.editAddress);
app.get('/editCity', authenticate, home.editCity);
app.get('/editZip', authenticate, home.editZip);

app.post('/updateFname', home.updateFname );
app.post('/updateLname', home.updateLname );
app.post('/updateEmail', home.updateEmail );
app.post('/updateAddress', home.updateAddress );
app.post('/updateCity', home.updateCity );
app.post('/updateZip', home.updateZip);

//cart function
app.get('/c/cart/view',authenticate, cartop.view);
app.get('/c/cart/add/:id',authenticate, cartop.confirmAdd);
app.get('/c/cart/remove/:id',authenticate, cartop.removeConfirm);
app.post('/c/cart/add',authenticate, cartop.add);
app.post('/c/cart/remove/saved',authenticate, cartop.removeSaved);
app.post('/c/cart/remove',authenticate, cartop.remove);
app.post('/c/cart/save', authenticate,cartop.save);
app.get('/c/cart/saved', authenticate,cartop.getSaved);
app.get('/c/checkout', authenticate,cartop.checkoutSummary);
app.post('/c/checkout', authenticate,cartop.checkout);

app.post('/deleteAccount', home.deleteAccount);
// Auditing

app.get('/audit', routes.audit);
app.get('/auditLogs', madhur.getAuditLogs);

//
//added get method of above to navigate from search to product details
app.get('/product/details', bids.displayProductDetails);

app.get('*', routes.error);
var server = app.listen(port, function() {
	console.log('Express server listening on port ' + port);
});
var socket = io.listen(server);
var minutes = 5.1, the_interval = minutes * 60 * 1000;
setInterval(function() {
  //console.log("I am doing my 1 minutes check");
	var hasAuctionExpired = "select product_id from product where bid_expiry_time < now() and product_status <> 'Sold'";
	db.executeQuery(hasAuctionExpired, function(err,status, resultAuction){
		//console.log("Inside set interval"+resultAuction.length);
		if(err){
			console.log("unable to connect - try after sometime");
		}
		else{
			//console.log(resultAuction.length);
			if(resultAuction.length > 0){
				console.log("There is an expired auction");
				for (var i=0; i<resultAuction.length; i++){
					//console.log("resultAuction[i].product_id:"+resultAuction[i].product_id);
					var auctionDetailsQuery = "select product_id, seller_id, (select customer_id from bid_line_item where bid_amount = (select max(bid_amount) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and product_id = product.product_id)) customer_id, (select max(bid_amount) from bid_line_item, bid_header_item where bid_line_item.bid_id = bid_header_item.bid_id and product_id = product.product_id) order_amount, (select bid_id from bid_header_item where product_id = product.product_id) bid_id, 4 seller_rating from product where product_id = "+resultAuction[i].product_id;
					db.executeQuery(auctionDetailsQuery, function(err,status, resultAuctionDetails){
						if(err){
							console.log("unable to connect - try after sometime");
						}
						else{
							if (resultAuctionDetails.length === 1){
								var insertIntoOrderHistory = "insert into order_history(product_id, seller_id, customer_id, quantity, order_amount, bid_id, seller_rating, order_date) values ("+resultAuctionDetails[0].product_id+", "+resultAuctionDetails[0].seller_id+", "+resultAuctionDetails[0].customer_id+", 1, "+resultAuctionDetails[0].order_amount+", "+resultAuctionDetails[0].bid_id+",4, now()); update product set product_status = 'Sold', units_in_stock = 0 where product_id = "+resultAuctionDetails[0].product_id;
								db.executeQuery(insertIntoOrderHistory, function(err,status, insertSuccess){
									if(err){
										throw err;
									}
									else{
										var msg="There is an expired auction:"+resultAuctionDetails[0].product_id;
										socket.send(msg);
									}
								});
								//console.log("insertIntoOrderHistory:"+insertIntoOrderHistory);
								
							}
							
						}
					});
				}
			}
		}
	});
	

  // do your stuff here
}, the_interval);




