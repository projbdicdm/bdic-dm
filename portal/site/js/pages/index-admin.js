index = function(){
	var _init = function (){
		//valida se o usuário esta logado
		$(".liLogged").hide();
        
		if($.sessionStorage.getItem('userType') == "admin" || $.sessionStorage.getItem('userType') == "adtf"){
			util.setNameUser();
			$(".lnkLogin").hide();
			$(".liLogged").show();
		}
	}
	return {
		init:_init
	}
}();