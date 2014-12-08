var db = require('./mysql');

function checkLogInData(callback,username,password){
	
	console.log("USERNAME: " + username + "Password: " + password);
	
	var sql = "SELECT  person_id,person_email,last_login,isactive, person_fname, person_type FROM person where trim(person_email) = '"+username+"' and trim(password) = '"+password+"'";
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
				req.session.isLoggedin = true;
				req.session.pid= results[0].person_id;
				req.session.uname= results[0].person_fname;
				req.session.email = results[0].person_email; 
				req.session.lasttimelog = results[0].last_login;
				req.session.person_type = results[0].person_type;
				
				if(results[0].isactive == 1){
					
					console.log("Customer.");
					res.render('customerhome',{req:req});

				}
				else
					{
					res.render('login',{result : 'Account has been Deactivated.'});
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
	req.session.isLoggedin = false;
	  req.session.destroy();
	  console.log("session destroyed");
	  res.redirect("/");
	};
