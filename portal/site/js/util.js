$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
function setNameUser(){
	$(".userName").each(function( index ) {
		 valElement = $(this).html();
		 valElement = valElement.replace("userName", $.sessionStorage.getItem('userName'));
		 $(this).html(valElement);
	});
}
function logout(){
	$.sessionStorage.clear();
	window.location = "/";
}
function formatReal( int )
{
        var tmp = int+'';
		decimal = tmp.split(".");
		if(typeof decimal[1] == "undefined") {
			tmp = tmp + '00';
		}else if(decimal[1].length < 2){
			tmp = tmp + '0';
		}
        tmp = tmp.replace(/([0-9]{2})$/g, ",$1");
		if(tmp.search('.') != -1)
			tmp = tmp.replace('.','');
		
        if( tmp.length > 6 )
                tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");

        return tmp;
}