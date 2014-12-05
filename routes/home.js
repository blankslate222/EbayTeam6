var ejs = require("ejs");
var mysql = require('./mysql');


//Customer Info
function getCustomerInfo(req,res)
{
	console.log("User Session" +req.session.pid);
	var user;
	var jsonParse2;
	var getAllUsers="select *  from person where person_id='"+req.session.pid+"' ";
	console.log(getAllUsers);
	var customerHistorySql = 'SELECT a.product_id, b.product_name, a.customer_id, a.quantity, a.order_amount, a.bid_id'+
	'  FROM ebay.order_history a, ebay.product b '+
	'WHERE a.customer_id = "'+req.session.pid+'" AND a.product_id = b.product_id'+
	' ORDER BY a.order_id desc';	
	console.log("Query is:"+getAllUsers);
	console.log("Query is:"+customerHistorySql);

	mysql.fetchData(function(err,results)
	{
		if(err)
		{
			throw err;
		}
		else 
		{
			/*if(results.length > 0)
			{*/
				mysql.fetchData(function(err,results1)
				{
					user = results1;
					console.log('users length -'+user.length);
					var jsonString2= JSON.stringify(user);
					jsonParse2= JSON.parse(jsonString2);
					var rows = results;
					var jsonString = JSON.stringify(results);
					var jsonParse = JSON.parse(jsonString);				
					ejs.renderFile('./views/Myebay.ejs',{data:jsonParse,
						users:jsonParse2, lastLoginTime: req.session.lasttimelog, userName: req.session.uname},function(err, result) 
						{
							// render on success
							if (!err) 
							{
								res.end(result);
							}
							// render or error
							else 
							{
								res.end('An error occurred');
								console.log(err);
							}
						 });
					 return;
				   },getAllUsers);

				/*}else 
				{   */ 
						/*console.log("No users found in database");
						ejs.renderFile('./views/Error.ejs',function(err, result) 
						{
							// render on success
							if (!err) 
							{
								res.end(result);
							}
							// render or error
							else {
								res.end('An error occurred');
								console.log(err);
							}});*/
					}
				

			 
		},customerHistorySql);

	}


function getCustomerInfoById(req,res)
{
	var user;
	var jsonParse2;
	var getAllUsers="select *  from person where person_id='"+req.params.id+"' ";
	console.log(getAllUsers);
	var customerHistorySql = 'SELECT a.product_id, b.product_name, a.customer_id, a.quantity, a.order_amount, a.bid_id'+
	'  FROM ebay.order_history a, ebay.product b '+
	'WHERE a.customer_id = "'+req.params.id+'" AND a.product_id = b.product_id'+
	' ORDER BY a.order_id desc';	
	console.log("Query is:"+getAllUsers);
	console.log("Query is:"+customerHistorySql);

	mysql.fetchData(function(err,results)
			{
		if(err)
		{
			throw err;
		}
		else 
		{
			mysql.fetchData(function(err,results1)
					{
				user = results1;
				console.log('users length -'+user.length);
				var jsonString2= JSON.stringify(user);
				jsonParse2= JSON.parse(jsonString2);
				var rows = results;
				var jsonString = JSON.stringify(results);
				var jsonParse = JSON.parse(jsonString);				
				ejs.renderFile('./views/Myebay.ejs',{data:jsonParse,
					users:jsonParse2, lastLoginTime: req.session.lasttimelog, userName: req.session.uname},function(err, result) 
					{
						// render on success
						if (!err) 
						{
							res.end(result);
						}
						// render or error
						else 
						{
							res.end('An error occurred');
							console.log(err);
						}
					});
				return;
					},getAllUsers);


		}



			},customerHistorySql);

}


	
	function editFname(req,res)
	{
		console.log("Hello");
		var getAllUsers = "select *  from person where person_id='"+req.session.pid+"'";
		console.log("Query is:"+getAllUsers);

		mysql.fetchData(function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				if(results.length > 0){

					var rows = results;
					var jsonString = JSON.stringify(results);
					var jsonParse = JSON.parse(jsonString);


					ejs.renderFile('./views/updateFname.ejs',{data:jsonParse},function(err, result) {
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
					console.log("No users found in database");
					ejs.renderFile('./views/Error.ejs',function(err, result) {
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
			}  
		},getAllUsers);
	}

	function editLname(req,res)
	{
		console.log("Hello");
		var getAllUsers = "select *  from person where person_id='"+req.session.pid+"'";
		console.log("Query is:"+getAllUsers);

		mysql.fetchData(function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				if(results.length > 0){

					var rows = results;
					var jsonString = JSON.stringify(results);
					var jsonParse = JSON.parse(jsonString);

					console.log("Results Type: "+(typeof results));
					console.log("Result Element Type:"+(typeof rows[0].email));
					console.log("Results Stringify Type:"+(typeof jsonString));
					console.log("Results Parse Type:"+(typeof jsString));

					console.log("Results: "+(results));
					console.log("Result Element:"+(rows[0].email));
					console.log("Results Stringify:"+(jsonString));
					console.log("Results Parse:"+(jsonParse));

					ejs.renderFile('./views/updateLname.ejs',{data:jsonParse},function(err, result) {
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
					console.log("No users found in database");
					ejs.renderFile('./views/Error.ejs',function(err, result) {
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
			}  
		},getAllUsers);
	}

	function editEmail(req,res)
	{
		console.log("Hello");
		var getAllUsers = "select *  from person where person_id='"+req.session.pid+"'";
		console.log("Query is:"+getAllUsers);

		mysql.fetchData(function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				if(results.length > 0){

					var rows = results;
					var jsonString = JSON.stringify(results);
					var jsonParse = JSON.parse(jsonString);

					console.log("Results Type: "+(typeof results));
					console.log("Result Element Type:"+(typeof rows[0].email));
					console.log("Results Stringify Type:"+(typeof jsonString));
					console.log("Results Parse Type:"+(typeof jsString));

					console.log("Results: "+(results));
					console.log("Result Element:"+(rows[0].email));
					console.log("Results Stringify:"+(jsonString));
					console.log("Results Parse:"+(jsonParse));

					ejs.renderFile('./views/updateEmail.ejs',{data:jsonParse},function(err, result) {
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
					console.log("No users found in database");
					ejs.renderFile('./views/Error.ejs',function(err, result) {
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
			}  
		},getAllUsers);
	}

	function editAddress(req,res)
	{
		console.log("Hello");
		var getAllUsers = "select *  from person where person_id='"+req.session.pid+"'";
		console.log("Query is:"+getAllUsers);

		mysql.fetchData(function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				if(results.length > 0){

					var rows = results;
					var jsonString = JSON.stringify(results);
					var jsonParse = JSON.parse(jsonString);

					console.log("Results Type: "+(typeof results));
					console.log("Result Element Type:"+(typeof rows[0].email));
					console.log("Results Stringify Type:"+(typeof jsonString));
					console.log("Results Parse Type:"+(typeof jsString));

					console.log("Results: "+(results));
					console.log("Result Element:"+(rows[0].email));
					console.log("Results Stringify:"+(jsonString));
					console.log("Results Parse:"+(jsonParse));

					ejs.renderFile('./views/updateAddress.ejs',{data:jsonParse},function(err, result) {
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
					console.log("No users found in database");
					ejs.renderFile('./views/Error.ejs',function(err, result) {
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
			}  
		},getAllUsers);
	}


	function editCity(req,res)
	{
		console.log("Hello");
		var getAllUsers = "select *  from person where person_id='"+req.session.pid+"'";
		console.log("Query is:"+getAllUsers);

		mysql.fetchData(function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				if(results.length > 0){

					var rows = results;
					var jsonString = JSON.stringify(results);
					var jsonParse = JSON.parse(jsonString);

					console.log("Results Type: "+(typeof results));
					console.log("Result Element Type:"+(typeof rows[0].email));
					console.log("Results Stringify Type:"+(typeof jsonString));
					console.log("Results Parse Type:"+(typeof jsString));

					console.log("Results: "+(results));
					console.log("Result Element:"+(rows[0].email));
					console.log("Results Stringify:"+(jsonString));
					console.log("Results Parse:"+(jsonParse));

					ejs.renderFile('./views/updateCity.ejs',{data:jsonParse},function(err, result) {
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
					console.log("No users found in database");
					ejs.renderFile('./views/Error.ejs',function(err, result) {
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
			}  
		},getAllUsers);
	}


	function editZip(req,res)
	{
		console.log("Hello");
		var getAllUsers = "select *  from person where person_id='"+req.session.pid+"'";
		console.log("Query is:"+getAllUsers);

		mysql.fetchData(function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				if(results.length > 0){

					var rows = results;
					var jsonString = JSON.stringify(results);
					var jsonParse = JSON.parse(jsonString);

					console.log("Results Type: "+(typeof results));
					console.log("Result Element Type:"+(typeof rows[0].email));
					console.log("Results Stringify Type:"+(typeof jsonString));
					console.log("Results Parse Type:"+(typeof jsString));

					console.log("Results: "+(results));
					console.log("Result Element:"+(rows[0].email));
					console.log("Results Stringify:"+(jsonString));
					console.log("Results Parse:"+(jsonParse));

					ejs.renderFile('./views/updateZip.ejs',{data:jsonParse},function(err, result) {
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
					console.log("No users found in database");
					ejs.renderFile('./views/Error.ejs',function(err, result) {
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
			}  
		},getAllUsers);
	}





//	Updating first name

	function updateFname(req,res)
	{
		var name=req.params.fname;
		console.log("name="+name);

		var updateUser="UPDATE person SET person_fname='"+req.param("fname")+"' where person_id='"+req.session.pid+"'";

		console.log("Query is:"+updateUser);

		mysql.insertData(function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				//	if(results.length == 0){

				console.log("valid Login");
				ejs.renderFile('./views/sucessfulUpdate.ejs',function(err, result) {
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
		},updateUser);
	}


//	Update Email
	function updateEmail(req,res)
	{

		var updateUser="UPDATE person SET person_email='"+req.param("email")+"' where person_id='"+req.session.pid+"'";

		console.log("Query is:"+updateUser);

		mysql.insertData(function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				//	if(results.length == 0){

				console.log("valid Login");
				ejs.renderFile('./views/sucessfulUpdate.ejs',function(err, result) {
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
		},updateUser);
	}

//	update Last name
	function updateLname(req,res)
	{
		var name=req.params.fname;
		console.log("name="+name);

		var updateUser="UPDATE person SET person_lname='"+req.param("lname")+"' where person_id='"+req.session.pid+"'";

		console.log("Query is:"+updateUser);

		mysql.insertData(function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				//	if(results.length == 0){

				console.log("valid Login");
				ejs.renderFile('./views/sucessfulUpdate.ejs',function(err, result) {
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
		},updateUser);
	}

//	Update Address
	function updateAddress(req,res)
	{


		var updateUser="UPDATE person SET person_address='"+req.param("address")+"' where person_id='"+req.session.pid+"'";

		console.log("Query is:"+updateUser);

		mysql.insertData(function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				//	if(results.length == 0){

				console.log("valid Login");
				ejs.renderFile('./views/sucessfulUpdate.ejs',function(err, result) {
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
		},updateUser);
	}



//	Update Address
	function updateCity(req,res)
	{


		var updateUser="UPDATE person SET person_city='"+req.param("city")+"' where person_id='"+req.session.pid+"'";

		console.log("Query is:"+updateUser);

		mysql.insertData(function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				//	if(results.length == 0){

				console.log("valid Login");
				ejs.renderFile('./views/sucessfulUpdate.ejs',function(err, result) {
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
		},updateUser);
	}

//	Update Address
	function updateZip(req,res)
	{


		var updateUser="UPDATE person SET person_zip='"+req.param("zip")+"' where person_id='"+req.session.pid+"'";

		console.log("Query is:"+updateUser);

		mysql.insertData(function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				//	if(results.length == 0){

				console.log("valid Login");
				ejs.renderFile('./views/sucessfulUpdate.ejs',function(err, result) {
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
		},updateUser);
	}


	function deleteAccount(req,res)
	{

		var updateUser="UPDATE person SET is_valid='0'where person_id='"+req.session.pid+"'";

		console.log("Query is:"+updateUser);

		mysql.insertData(function(err,results){
			if(err){
				throw err;
			}
			else 
			{
				//	if(results.length == 0){

				console.log("valid Login");
				ejs.renderFile('./views/sucessfulDelete.ejs',function(err, result) {
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
		},updateUser);
	}







	/*exports.newProductForm = newProductForm;
exports.handleNewProduct=handleNewProduct;
exports.updateForm=updateForm;
exports.handleProductUpdate=handleProductUpdate;
exports.handleDelete=handleDelete*/;


exports.getCustomerInfo=getCustomerInfo;



exports.editFname=editFname;
exports.editLname=editLname;
exports.editEmail=editEmail;
exports.editAddress=editAddress;
exports.editCity=editCity;
exports.editZip=editZip;

exports.updateFname=updateFname;
exports.updateLname=updateLname;
exports.updateEmail=updateEmail;
exports.updateAddress=updateAddress;
exports.updateCity=updateCity;
exports.updateZip=updateZip;
exports.getCustomerInfoById=getCustomerInfoById;
exports.deleteAccount=deleteAccount;
