index = function(){
	var _init = function (){
		//carrega conteudo do modal do login
		 $.ajax({
            type: 'GET',
			async: false,
            url: 'modal-login.html',
            success: function (data) {
				$("#modal-user-login").html(data);
            }
        });
		//identifica div como modal
		$('.modal-trigger').leanModal();		
	}
	var _api_user_login = function (){
		var requestData = JSON.stringify($('#formLogin').serializeObject());
		
		$.ajax({
			url: '/api/user/login',
			type: 'POST',
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			data: requestData
		}).done(function(data, textStatus, jqXHR) {
			if(data.userType == "admin")
				location.href = "http://localhost:8899/indexadmin.html";
			else
				location.href = "http://localhost:8899/indexclient.html";
		}).fail(function(jqXHR, textStatus, errorThrown) {
			$('#modal-user-login-fail').openModal();
		});
	}
	var _api_user_resetpassword = function(form){

		var requestData = JSON.stringify($('#formResetPWS').serializeObject());

		$.ajax({
			url: '/api/user/resetpassword',
			type: 'POST',
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			data: requestData
		}).done(function(data, textStatus, jqXHR) {
			$('#modal-user-resetpassword-success').openModal();
		}).fail(function(jqXHR, textStatus, errorThrown) {
			$('#modal-user-resetpassword-fail').openModal();
		});
	}
	var _api_user_changepassword = function (form){
		alert("Tela sem implementação");
	}
	return {
		init:_init,
		api_user_login: _api_user_login,
		api_user_resetpassword: _api_user_resetpassword,
		api_user_changepassword: _api_user_changepassword
	}
}();