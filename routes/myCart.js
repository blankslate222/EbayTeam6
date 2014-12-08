/**
 * New node file
 */
var cart = require('./CartObj.js');

var cart = new cart();

var db = require('./mysql');
var mysql = require('mysql');

function confirmAdd(req, res) {
	console.log('displaying add cart pop up');
	var sql = 'select product_id, product_name, price_per_unit, units_in_stock from product where product_id=?';
	sql = mysql.format(sql,req.params.id);
	db.executeQuery(sql,function(err,status, result){
		
		res.render('addcart',{
			product_name: result[0].product_name,
			product_id : result[0].product_id
			,product_qty : result[0].units_in_stock
			,product_price : result[0].price_per_unit,
			req:req
		});
	});
	
}

function removeConfirm(req,res){
	//req.session.pid = '1';
	var cust = req.session.pid;
	var toRemove = req.params.id;
	res.status(200);
	res.render('removecart',{
		customer_id : cust,
		product_id : toRemove
	});
	
}


function add(req, res) {
	//req.session.pid ='1';
	console.log('session id set --'+req.session.pid);
		cart.setItem(req.body.product_id,req.body.product_name,req.body.cart_qty,req.body.cart_price,req.session.pid);
		console.log('items in cart' + cart.getCart());
		//res.status(200);
		res.redirect(req.session.redirect_url);
}

function remove(req, res) {
	var id = req.body.product_id;
	console.log('req body -'+id);
		cart.removeFromCart(id);
		res.status(200);
		res.redirect(req.session.redirect_url);
		
}

function view(req,res){
	var itemList = cart.getCart();
	console.log('req.session in saved -'+req.session.pid);
	for(var i in itemList){
		console.log('item number in cart:'+(i));
		console.log('prod id'+itemList[i].prod_id);
		console.log('prod name'+itemList[i].prod_name);
		console.log('prd qty'+itemList[i].prod_qty);
		console.log('prd price'+itemList[i].prod_price);
		console.log('cust id'+itemList[i].cust_id);
		
	}
	req.session.redirect_url = req.url;
	
		res.status(200);
		res.render('mycart',{
			items : itemList,
			req:req
		});
	
}

function save(req, res) {
	var itemList = cart.getCart();
	
	var sql = 'insert into cart_table values ';
	for(var i in itemList){
		console.log('item number in cart:'+i);
		console.log('prod id'+itemList[i].prod_id);
		console.log('prod name'+itemList[i].prod_name);
		console.log('prd qty'+itemList[i].prod_qty);
		console.log('prd price'+itemList[i].prod_price);
		console.log('cust id'+itemList[i].cust_id);
	sql+='(\''+itemList[i].cust_id+'\',\''+itemList[i].prod_id+'\',\"'+itemList[i].prod_name+'\",\''+
	itemList[i].prod_qty+'\',\''+itemList[i].prod_price+'\''+'),';
	}
	sql = sql.slice(0,-1);
	console.log('cart sql --'+sql);
	db.executeQuery(sql, function(err,status,result){
		if(!err){
			cart.clearCart();
			res.status(200);
			res.redirect('/c/cart/saved');
		}else{
			res.status('400');
			res.send('Bad request. Cart could not be saved.');
			
		}
	});
	
 }
	


function getSaved(req,res){
	//req.session.pid = 1;
	var customer = req.session.pid;
	var sql = 'select a.prod_id, a.prod_name, a.prod_qty, a.prod_price, a.cust_id'+
	' from cart_table a, product b where cust_id = ?'+
	' and a.prod_id=b.product_id and b.isActiveProduct=1 and b.product_status=\'In-stock\'';
	var cust=[customer];
	sql = mysql.format(sql,cust);
	db.executeQuery(sql,function(err,status,result){
		if(result.length == 0){
			res.status(404);
			res.render('savedcart',{
				items : '',
				req:req
			});
		}else{
			res.status(200);
			//res.send("Your saved cart <br>"+result);
			res.render('savedcart',{
				items : result,
				req:req
			});
		}
	});
}

function removeSaved(req,res){
	
	//req.session.pid='1';
	var customer = req.session.pid;
	var product = req.body.prod_id;
	
	var sql = 'delete from cart_table where cust_id=? and prod_id=? limit 1';
	var deletes =[customer,product];
	sql = mysql.format(sql,deletes);
	
	db.executeQuery(sql, function(err, status, result){
		res.status(200);
		res.redirect('/c/cart/saved');
	});
}

function checkoutSummary(req,res){
	
	var notSaved = cart.getCart();
	var saved = '';
	
	var customer = req.session.pid;
	var sql = 'select a.prod_id, a.prod_name, a.prod_qty, a.prod_price, a.cust_id'+
	' from cart_table a, product b where cust_id = ?'+
	' and a.prod_id=b.product_id and b.isActiveProduct=1 and b.product_status=\'In-stock\'';
	var cust=[customer];
	sql = mysql.format(sql,cust);
	db.executeQuery(sql,function(err,status,result){
		saved = result;
		
		res.status(200);
		res.render('checkout',{
			unsaved : notSaved,
			saved : saved,
			req:req
		});
		
	});
	
}

function checkout(req,res){
	
	//req.session.pid = '1';
	var customer = req.session.pid;
	var ins = 'INSERT INTO ebay.order_history '+
	' (product_id,seller_id,customer_id,quantity,order_amount,bid_id,seller_rating,order_date) ';
	var sel = 'select a.prod_id, b.seller_id, a.cust_id, a.prod_qty, a.prod_price, -1, '+
	req.body.seller_rating+' as seller_rating ,now() '+
	' from cart_table a, product b where '+
	' a.prod_id = b.product_id and a.cust_id ='+customer;

	var insquery = ''+ins+sel;
	
	var delsql = 'delete from cart_table where cust_id = ?';
	var del = [customer];
	delsql = mysql.format(delsql,del);
	
	var selForUpd = 'select prod_id, prod_qty from cart_table where cust_id ='+customer;
	
	var updsql='';
	db.executeQuery(insquery, function(err,status,result){
		
		
		if(status == 200){
			
			
			db.executeQuery(selForUpd, function(err,status,result1){
				var selresult = result1;
				for(var i=0; i<selresult.length;i++){
					updsql+='update product set units_in_stock = units_in_stock -'+
					selresult[i].prod_qty + ' where product_id = '+selresult[i].prod_id+';';
				}
				
				var finalsql = delsql+';'+updsql;
				db.executeQuery(finalsql, function(err,status,result2){
					cart.clearCart();
					res.status(201);
					res.redirect('/');
				});
			});
		}else{
			console.log('error creating orders');
		}
	});
	//inside insert callback
	//reset temporary cart - also delete records from checkout table
	
	//run a delete query
}

//exports.cartOp = cartOp;
exports.confirmAdd = confirmAdd;
exports.removeConfirm = removeConfirm;
exports.add = add;
exports.remove = remove;
exports.save = save;
exports.view = view;
exports.getSaved = getSaved;
exports.removeSaved = removeSaved;
exports.checkoutSummary = checkoutSummary;
exports.checkout = checkout;