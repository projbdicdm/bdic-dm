/*
index = function(){
	var _init = function (){
		// the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
		$('.modal-trigger').leanModal();		
	}
	return {
		init:_init
	}
}();
*/

$(document).ready(function(){
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal-trigger').leanModal();
});

function api_user_login_old(){
    
	 $.ajax({
            url: '/api/user/login',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: jQuery.parseJSON($("form").serialize()),
            /*
            success: function (data) {
                if(data == true)
					window.location = 'dashboard.html'
				else
				{
					$('#notificacao').html(data);
					$('#notificacao').show();
				}
            }*/
            success: function(data) {
              console.log(data);
              console.log('process sucess');
           },

            error: function() {
              console.log('process error');
            }
        });
}

function api_user_login(form){

    currentData = new Object();
    currentData.login = form.find("#email").val();
    currentData.password = form.find("#password").val();

    $.ajax({
        url: '/api/user/login',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(currentData)
    }).done(function(data, textStatus, jqXHR) {
        console.log("Success: " + data);
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("Error: " + errorThrown);
    }).always(function() {
        console.log("Done!");
    });
};






