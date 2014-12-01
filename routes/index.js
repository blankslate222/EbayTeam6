
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.profile = function(req, res){
	  res.render('productAdvance.ejs', {req:req, title: 'Express' });
};

exports.person = function(req, res){
	  res.render('personSearch.ejs', { title: 'Express' });
};

exports.addperson = function(req, res){
	  res.render('signup');
	  };
exports.loginpage = function(req, res){
		  res.render('login', {result : ''});
		};
		
exports.save = function(req,res){
		    
		    var input = JSON.parse(JSON.stringify(req.body));
		    
		    req.getConnection(function (err, connection) {
		        
		        var data = {
		            
		            person_fname    : input.fname,
		            person_lname    : input.lname,
		            
		        
		        };
		        
		        var query = connection.query("INSERT INTO person set ? ",data, function(err, rows)
		        {
		  
		          if (err)
		              console.log("Error inserting : %s ",err );
		         
		          res.redirect('/signup');
		          
		        });
		    
		    });
		};
