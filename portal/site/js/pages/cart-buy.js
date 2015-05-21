cart_buy = function(){
	var _init = function (){
	
		if(!sessionStorage.getItem('userName')){
			window.location = '/';
			return false;
		}	
		//carrega cabeçalho
		util.loadHeader();
		//carrega rodape
		util.loadFooter();

		//valida o tipo do usuário que logado
		$(".liLogged").hide();
		if($.sessionStorage.getItem('userType') == "client"){
			util.setNameUser();
			$(".lnkLogin").hide();
			$(".liLogged").show();
			
		}
		
		//identifica div como modal
		$('.modal-trigger').leanModal();
	}
	return {
		init:_init
	}
}();