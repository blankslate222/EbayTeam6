var db = require('./mysql');

function verifylogin(req,res){
	console.log("Inside login");
	var username = req.param("email");
	var password = req.param("pass");
	console.log(username);
	authenticateUser(function(err, result) {
		if (!err) {
			console.log("Call back called");
			console.log(result.length);
			
			if (result.length !=0) {
				console.log("After if");
				req.session.email = username;
				console.log(username);
				for ( var i in result) {
					console.log("inside for");
					console.log('Person Type: ', result[0].person_type);
					//req.session.userId = results[i].person_id;
					//req.session.lastLogon = results[i].last_login;
					if (result[0].person_type == 0) {
						res.render('customerhome', {
							data:'',
							data1:'',
							req : req
						});
					} else {
						res.render('sellerhome', {
							req:req,
							data: ''
						});
					}
				}

			} else {
				res.render('login', {
					error : ' Email or password you entered is incorrect.'
				});
			}

		}
	}, username, password);
	 
	
}


function authenticateUser(callback,username,password){
	console.log("USERNAME: " + username + "Password: " + password);

	
	var sql = "select * from person where person_email = '"+username+"' and password = '"+password+"'";
	console.log(sql);
	var authResults;

	db.executeQuery(sql,function(err, status, result){
		
		authResults = result;
		if(err){
			
			console.log("ERROR: " + err.message);
		}
		else{
			if (result.length !== 0)
			{
				console.log(result.length);
				console.log("DATA : "+JSON.stringify(result));

				console.log(username);
				var updateLoginTimeSql = "update person set last_login = now() where person_email =  '"+username+"'";
				db.executeQuery(updateLoginTimeSql,function(err, status, result){
					
					callback(err,result);
				});
			}
			else{
				
				callback(err,result);
			}
		}
	});
}

	function checkLogInData(callback,username,password){
	
	console.log("USERNAME: " + username + "Password: " + password);
	
	var sql = "SELECT  person_id,person_email,person_fname,membership_id,person_type,last_login,isactive FROM person where person_email = '"+username+"' and password = '"+password+"'";
	console.log(sql);	
	db.executeQuery(sql, function(err, status, result){
			// console.log(rows);
				console.log("ROWS PRESENT --> " + result.length);
					if(result.length!==0){
						//if (rows[0].count > 0) {
							console.log("DATA : "+JSON.stringify(result));
							var updateLoginTimeSql = "update person set last_login = now() where person_email =  '"+username+"'";
							db.executeQuery(updateLoginTimeSql,function(err, status, result){
								
							
							});
							callback(err, result);
							
						}else{
							console.log("no user with this credentials");
							callback(err,result);
						}
					
				//}
		});		
}


	exports.UserLOgIn = function(req, res) {
	var username = req.param('email');
	var pass = req.param('pass');
	console.log('username : ' + req.param('email'));

	checkLogInData(function(err,results)
	{		
		console.log('going to checkLogInData');
		if(err){
			console.log('Error occured checkLogInData');
			res.send(null);
		}		
		else{
			console.log(results.length);
			if(results.length!=0)
			{

				req.session.pid= results[0].person_id;
				req.session.uname= results[0].person_fname;
				req.session.email = results[0].person_email; 
				req.session.lasttimelog = results[0].last_login;
				
				if(results[0].person_type == 0){
					console.log("Customer.");
					res.render('customerhome',{req:req});

				}else{
					console.log("Seller.");
					res.render('sellerhome',{req:req});
				}
				
			}
			else{
				res.render('login',{result : 'The username or password you entered is incorrect.'},
					function(err, result) {
						console.log("Rendered");
						// render on success
						if (!err) {
							res.end(result);
						}
						// render or error
						else {
							res.end('An error occurred rendering login again');
							console.log(err);
						}
				});
				console.log("no rows in user data.");
			}
		}
	},username,pass); 
};
exports.logout = function(req, res){
	  req.session.destroy();
	  console.log("session destroyed");
	  res.redirect("/");
	};




exports.verifylogin=verifylogin;