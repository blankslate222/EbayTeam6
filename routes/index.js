
/*
 * GET home page.
 */

exports.index = function(req, res){
	if(req.session.uname) {
		res.render('customerhome',{req:req});
	} else {
		res.render('index', { req:req, title: 'Home' });
	}
};

exports.error = function(req, res) {
	res.render('main-error.ejs', {errMsg: 'Undefined url' , req:req});
}

exports.profile = function(req, res){
	  res.render('productAdvance.ejs', {req:req, title: 'My profile' });
};

exports.person = function(req, res){
	  res.render('personSearch.ejs', { title: 'Person' });
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
		
