var db = require('./mysql');

function save(req,res){
	var input = JSON.parse(JSON.stringify(req.body));
	
	var fname = input.fname;
	var lname = input.lname;
	var address = input.address;
	var city = input.city;
	var state = input.state;
	var zip = input.zip;
	var membershipid = input.membershipid;
	var persontype = input.person;
	var email = input.email;
	var pwd = input.pass;
	
	var isactive = 1;
	var sql = "insert into person(person_fname,person_lname,person_address,person_city,person_state,person_zip,membership_id,person_type,person_email,password,last_login,isactive) values('" + fname + "','" + lname + "','"+ address +"','"+city+"','"+state+"','"+zip+"','"+membershipid+"','"+persontype+"','"+email+"','"+pwd+"',now(),'"+isactive+"')";
	
	db.executeQuery(sql,function(err, status, result){
		
		if(status == 200){
			res.status(status);
			res.render('signup');
		//res.send(result);
	  }else{
		res.status=status;
		  res.send("something is not right");	
		}
		
	});
}
exports.save = save;