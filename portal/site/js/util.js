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