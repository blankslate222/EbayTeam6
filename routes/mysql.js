var ejs= require('ejs');
var mysql = require('mysql');

function getConnection(){
	var connection = mysql.createConnection({
	    host     : 'localhost',
	    user     : 'root',
	    password : 'admin',
	    database : 'ebay',
	    multipleStatements: true
	});
	return connection;
}


function fetchData(callback,sqlQuery){
	
	console.log("\nSQL Query::"+sqlQuery);
	
	var connection=getConnection();
	
	connection.query(sqlQuery, function(err, rows, fields) {
		if(err){
			console.log("ERROR: " + err.message);
		}
		else 
		{	// return err or result
			callback(err, rows);
		}
	});
	console.log("\nConnection closed..");
	connection.end();
}
function executeQuery(sql, callback){
	
	var status=0;
	console.log(sql);
	var conn = getConnection(function(err) {
		if (err) {
			// console.log("connection failure");
			var result = "DB Connection Failure";
			status = 500;
			callback(err, status,result);
		}
	});
   
	conn.query(sql, function(err, results, fields){
		if (err) {
			// console.log("query error");
			results = "Query Error";
			status = 400;
			callback(err, status, results);
		} else if (results.length == 0) {
			// console.log("no result");
			results = '';
			status = 404;
			callback(err, status, results);
		} else {
			// console.log("num of rows = " + rows.length);
			status = 200;
			callback(err,status,results);
		}
		
	});
conn.end();
}
function execQueryWithParams (sql, params, callback) {
	
	var conn = getConnection(function(err) {
		if (err) {
			// console.log("connection failure");
			var result = "DB Connection Failure";
			status = 500;
			callback(err, status,result);
		}
	});

		var qResult = conn.query(sql, params, callback);
		console.log("inside execQuery connection pool"+qResult);
		qResult.on('error', function(err) {
			console.log('MySql query error: ' + err);
			callback(err, true);
		});
		qResult.on('result', function(rows) {
			console.log('Got result from DB');
			callback(false, rows);
		});
		qResult.on('end', function() {
			console.log('Going to release DB connection to the Pool');
			//conn.release();
		});

	//connPool.fetchData(callback,sql); //use this for db connection without pooling
}

function insertData(callback,sqlQuery){
	
	console.log("\nSQL Query::"+sqlQuery);
	
	var connection=getConnection();
	
	connection.query(sqlQuery, function(err, rows, fields) {
		if(err){
		
			console.log("ERROR: " + err.message);
		}
		else 
		{	// return err or result
			console.log("DB Results:"+rows);
			callback(err, rows);
		}
	});
	console.log("\nConnection closed..");
	connection.end();
	
}	
exports.insertData= insertData;

exports.executeQuery = executeQuery;
exports.fetchData=fetchData;
exports.execQueryWithParams = execQueryWithParams;