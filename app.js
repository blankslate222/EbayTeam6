
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , product = require('./routes/nikhil')
  , bids = require('./routes/bidding');

var io = require('socket.io');
var db = require('./routes/db');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('js', __dirname + '/js');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/products', product.list);

app.get('/product/new', product.newProductPage);
app.post('/product/new', product.handleNewProduct);
app.get('/product/update', product.updateForm);
app.post('/product/update', product.handleProductUpdate);
app.get('/product/delete', product.deletePrompt);
app.post('/product/delete', product.handleDelete);
app.post('/product/bids', bids.listBidsForProduct);
app.post('/product/details', bids.displayProductDetails);
app.post('/product/placebid', bids.placeBid);
app.post('/product/buy', bids.buyProduct);

/*app.get('*', function(req,res){
	res.status=404;
	res.send("Nothing down this road! Go home!");
});*/

server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var socket = io.listen(server);
/*
socket.on('connection', function(client){
	console.log("There is an expired auction");
	msg="There is an expired auction";
	socket.send(msg);
	
 client.on('message', function(msg){
	  socket.send(msg);
  })
}); 				
*/
var minutes = 0.1, the_interval = minutes * 60 * 1000;
setInterval(function() {
  //console.log("I am doing my 1 minutes check");
	var hasAuctionExpired = "select product_id from product where bid_expiry_time < now() and product_status <> 'Sold'";
	db.executeQuery(hasAuctionExpired, function(err,status, resultAuction){
		//console.log("Inside set interval"+resultAuction.length);
		if(err){
			throw err;
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
							throw err;
						}
						else{
							if (resultAuctionDetails.length === 1){
								var insertIntoOrderHistory = "insert into order_history(product_id, seller_id, customer_id, quantity, order_amount, bid_id, seller_rating) values ("+resultAuctionDetails[0].product_id+", "+resultAuctionDetails[0].seller_id+", "+resultAuctionDetails[0].customer_id+", 1, "+resultAuctionDetails[0].order_amount+", "+resultAuctionDetails[0].bid_id+",4); update product set product_status = 'Sold' where product_id = "+resultAuctionDetails[0].product_id;
								db.executeQuery(insertIntoOrderHistory, function(err,status, insertSuccess){
									if(err){
										throw err;
									}
									else{
										msg="There is an expired auction:"+resultAuctionDetails[0].product_id;
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
