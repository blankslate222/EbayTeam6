
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
	  res.render('signup',{err:''});
	  };
exports.loginpage = function(req, res){
		  res.render('login', {result : ''});
		};
		
		exports.audit = function(req, res){
			res.render('audit.ejs');
		};
		
