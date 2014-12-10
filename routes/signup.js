var db = require('./mysql');
var index = require('./index');

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
	var email = input.email.trim();
	var pwd = input.pass.trim();
	
	var isactive = 1;
	
	var isvalidated = validatesignup(req,res);
	console.log(isvalidated);
	//var isuniqueuname = //index.unique_username_check(req,res);
	//console.log(isuniqueuname);
	if(isvalidated==true)
		{
		
	var sql = "insert into person(person_fname,person_lname,person_address,person_city,person_state,person_zip,membership_id,person_type,person_email,password,last_login,isactive) values('" + fname + "','" + lname + "','"+ address +"','"+city+"','"+state+"','"+zip+"','"+membershipid+"','"+persontype+"','"+email+"','"+pwd+"',now(),'"+isactive+"')";
	
	db.executeQuery(sql,function(err, status, result){
		
		if(status == 200){
			res.status(status);
			res.render('SuccessPage');
		//res.send(result);
			
	  }
		
		else{
		res.status=status;
		console.log(err);
		res.render('signup',{err:'Email Id or MemberShip Id already in use. Please use a different one!'});
		  //res.send("something is not right");	
		}
		
	});

		}
	
	
}

 var validatesignup = function(req,res){
	//res.end("Inside Server side validatesignup ");
	console.log("Inside Server side validatesignup ");

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

              console.log("fname : "+fname);
              //alert(fname);
              if(fname == null || fname == ""  )
              {
                res.end("Firstname should not be blank."); 
              }


             if(lname == null || lname == ""  )
              {
               
               res.end("first name is '"+ fname +"' lastname should not be blank."); 
               
              }
             if(address == null || address == ""  )
             {
              
              res.end("Address is required"); 
              
             }
             
              if(city == null || city == ""  )
              {
                res.end("City should not be blank."); 
               
              }
              
              
              if(state == null || state == "State"  )
              {
                res.end("Please select a State"); 
                
              } 

              
              if(zip == null || zip == ""  )
              {
                res.end("Zipcode should not be blank."); 
                
              }else if(isNaN(zip)  )
              {
                res.end("Zipcode should be NUMERIC ONLY."); 
                
              }else if(zip.length < 5 )
              {
                res.end("Zipcode should be of 5 digits."); 
                
              }
          
              if(membershipid == null || membershipid == ""  )
              {
                res.end("Please enter a Membership No"); 
                
              }

              
              if(email == null || email == ""  )
              {
                res.end("Username should not be blank."); 
              }
              
              
              if(pwd == null || pwd == ""  )
              {
                res.end("password should not be blank."); 
                
              }else if(pwd.length < 6 )
                {
                  res.end("Password should contain minimum 6 character."); 
                  
                } else{
                	return true;
                
              }
           
  
}
exports.save = save;