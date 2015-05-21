index = function(){
	var _init = function (){
		//valida se o usuário esta logado
		$(".liLogged").hide();
		if($.sessionStorage.getItem('userType') == "admin"){
			util.setNameUser();
			$(".lnkLogin").hide();
			$(".liLogged").show();
			
		}
	}
	return {
		init:_init
	}
}();