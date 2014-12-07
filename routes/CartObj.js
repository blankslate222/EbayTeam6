/**
 * New node file
 */
function cartObj() {
	
var product_id = '',
	product_name = '',
	product_qty = '',
	product_price = '',
	customer_id = '';
var itemList = [];

this.addToCart = function(item){
	itemList.push(item);
};

this.removeFromCart = function(id){
	
	var spliceval = '';
	if(typeof id != undefined){
		for(var i in itemList){
			if(id == itemList[i].prod_id){
				spliceval = i;
				break;
			}
		//	console.log(itemList[i].prod_id);
		}
	}
	itemList.splice(spliceval,spliceval+1);
	console.log('after remove -'+itemList);
	return;
};

this.setItem = function(id,name, qty, price,customer){
	this.product_id=id;
	this.product_name = name;
	this.product_qty = qty;
	this.product_price = price;
	this.customer_id = customer;
	var item={
			prod_id : this.product_id,
			prod_name : this.product_name,
			prod_qty : this.product_qty,
			prod_price : this.product_price,
			cust_id : this.customer_id
	};
	console.log('item -'+item);
	this.addToCart(item);
};

this.getItem = function(id){
	console.log('id--'+id);
	if(typeof id != undefined){
	for(var i in itemList){
		if(id == itemList[i].prod_id){
			return itemList[i];
		}
	//	console.log(itemList[i].prod_id);
	}
  }
};

this.getCart = function(){

		for(var i in itemList){
			console.log('in get cart -- '+itemList[i].prod_id);
			
		}

		return itemList;
};

this.clearCart = function(){
	while(itemList.length>0){
		itemList.pop();
	}
};

}
module.exports = cartObj;