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
		
		_carregar_itens_carrinho();
			
		//bloqueia a digitação de letras
		$('#numeroCartao, #codigoSegurancaCartao').keypress(function(key) {
			if(key.charCode < 48 || key.charCode > 57) return false;
		});		

		//carrega os cartões
		_carrega_cartoes();
			
	}
	var _carrega_cartoes = function(){ 

		var id = sessionStorage.getItem('userIDMySQL');

		$.ajax({
			url: '/api/card/client/' + id,
			type: 'GET',
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function(data){
				if (data.list.length > 0){

					//popula a lista de cartões do cliente
					var options = $("#dw_cartoes");
					$.each(data.list, function(index, cartao) {
					    options.append($("<option />").val(cartao.car_id).attr('num_card', cartao.car_num).text(cartao.car_band + ' **** **** **** ' + cartao.car_num.substring(12,16)));
					});

					$('select').material_select();
					
					/*
					$('.pagamentofinalizacao label').addClass('active');
					$('#bandeiraCartao').val(data.list[0].car_band);
					$('#numeroCartao').val(data.list[0].car_num);
					$('#mesAnoValidadeCartao').val(data.list[0].car_valid_mes + '/'+ data.list[0].car_valid_ano);
					$('#nomeClienteCartao').val(data.list[0].car_nm);
					$('.pagamentofinalizacao input').attr('disabled','true');	
					$('#codigoSegurancaCartao').attr('disabled',false).next().removeClass('active');
					*/
				}
			},
			statusCode: {
				400: function(error) {
				  Materialize.toast(error.responseJSON.status, 4000);
				}
			}
		});
	}
	var _remove_item = function(id){
		cartNow = $.sessionStorage.getItem('cartProducts');
		var newCart = [];
		var qtdItens = 0;
		$.each(JSON.parse(cartNow), function(index, item) {
			if(item.id !=id){
				newCart.push({"id":item.id,
							  "imagem":item.imagem,
							  "descricao":item.descricao,
							  "quantidade":item.quantidade,
							  "valor":item.valor
							});
				qtdItens++;
			}
		});
		if(qtdItens == 0){
			$.sessionStorage.setItem('cartProducts','');
		}else{
			$.sessionStorage.setItem('cartProducts', JSON.stringify(newCart));
		}
		_carregar_itens_carrinho();
		Materialize.toast('Item removido do carrinho!', 4000);
	}	
	var _carregar_itens_carrinho = function(){
		//preenche os produtos na tabela
		$('table tbody').html('');
		cart = $.sessionStorage.getItem('cartProducts');
		if(!cart){
			tr = $('<tr/>');
			tr.append("<td colspan='6' class='center'>O carrinho está vazio!</td>");
			$('table').append(tr);
			$('.pagamentofinalizacao').hide();
			return false;
		}
		var total = 0;
		$.each(JSON.parse(cart), function(index, item) {
			tr = $('<tr/>');
			tr.append("<td class='top'><i class='mdi-action-delete small' onclick=cart_buy.remove_item('"+item.id+"');></i></td>");
			tr.append("<td><img height='100px' src='"+item.imagem+"'/></td>");
			tr.append("<td>" + item.descricao + "</td>");
			tr.append("<td class='center'>" + item.quantidade + "</td>");
			tr.append("<td class='right2'>" + item.valor + "</td>");

			valorCalc = item.valor;
			valorCalc = valorCalc.replace(",",".");
			subTotal = parseFloat(valorCalc) * parseFloat(item.quantidade);

			total+=subTotal;

			tr.append("<td class='right2'>" + util.formatReal(subTotal) + "</td>");
			$('table tbody').append(tr);
		});
			tr = $('<tr/>');
			tr.append("<td colspan='5' class='right2'><b>Total</b></td>");
			tr.append("<td class='right2' id='vrTotalCarrinho'>" + util.formatReal(total) + "</td>");
			$('table').append(tr);
			$('.pagamentofinalizacao').show();			
	}
	var _pagamento = function(){

		var cartao_selecionado = parseInt($('#dw_cartoes').val());

		if (cartao_selecionado == 0) {

			//valida o preenchimento do cartão
			validaCartao = true;

			if(!$('#bandeiraCartao').val()){
				$('#bandeiraCartao').addClass("invalid");
				validaCartao = false;
			}
			if(!$('#numeroCartao').val()){
				$('#numeroCartao').addClass("invalid");
				validaCartao = false;
			}
			if(!$('#mesAnoValidadeCartao').val()){
				$('#mesAnoValidadeCartao').addClass("invalid");
				validaCartao = false;
			}
			if(!$('#nomeClienteCartao').val()){
				$('#nomeClienteCartao').addClass("invalid");
				validaCartao = false;
			}		
			if(!$('#codigoSegurancaCartao').val()){
				$('#codigoSegurancaCartao').addClass("invalid");
				validaCartao = false;
			}

			if(!validaCartao){
				Materialize.toast('Selecione um cartão de crédito cadastrado ou preencha todos os dados do formulário', 4000);
				return false;
			}
		}

		//_finalizar_pedido();
		_confirmacao_pagamento_mobile();
	}
	var _confirmacao_pagamento_mobile = function(){
		
		var lista_produtos = [];
		$.each(JSON.parse($.sessionStorage.getItem('cartProducts')), function(index, item) {
			lista_produtos.push(
						{
							"cod": parseInt(item.id),
						  	"value": util.formatParseFloat(item.valor),
						  	"qtd": parseInt(item.quantidade)
						});
		});		
		
		var id_cartao = $('#dw_cartoes').val() || 1;
		var num_card = $('#dw_cartoes').find('option:selected').attr('num_card') || $('#numeroCartao').val();
		var token_id_user = $.sessionStorage.getItem('userToken').toString();

		var parametros = {
			token: token_id_user,
			creditcardNumber: num_card,
			cod_cliente: parseInt($.sessionStorage.getItem('userIDMySQL')),
			cod_credit_card: parseInt(id_cartao),
			products: lista_produtos,
			value: util.formatParseFloat($("#vrTotalCarrinho").html()),
			geo: {
				lat: parseFloat($.sessionStorage.getItem('lat')),
				lon: parseFloat($.sessionStorage.getItem('long')),
			},
			segment: "E-COMMERCE-VAREJO"
		};
		
		
		$('#modal-payment-buy').openModal({
			dismissible: false
		});

		//esconde confirmacao de email
		$('.row_confirmation_email').hide();

		$.ajax({
            type: 'POST',
			dataType: "json",
			contentType: "application/json",
            url: '/api/transaction/buy',
			data: JSON.stringify(parametros),
            success: function (data) {		

				$.sessionStorage.setItem('protocoloCompra', "Seu protocolo é: "+data.transactionid);
				
				if(data.status_venda == "ok" && data.status_tran == "ok")
				{
					$('#modal-payment-buy').closeModal({
						complete: function() { _finalizar_pedido(); }
					});
				} else {
					window.location = 'fail-compra.html';
				}
			},
			statusCode: {
				400: function(error) {
				  $('.progress').hide();
				  Materialize.toast(error.responseJSON.status, 4000);

				  $('#modal-payment-buy').closeModal();
				}
			},
			error: function(a, b, c){
				console.log(a);
			}
        });			
		
	}
	var _valida_finalizar = function(){
		if(!util.valida_form('#formConfirmEmail'))
			return false;
		
		if($('#email_confirmation').val() != $.sessionStorage.getItem('userEmail')){
			Materialize.toast('O email informado não confere com o do cliente!', 4000);
			return false;
		}
		
		$('#modal-payment-buy').closeModal({
			complete: function() { _finalizar_pedido(); }
		});
		
	}
	var _finalizar_pedido = function(){
		$.sessionStorage.setItem('cartProducts','');
		window.location = 'ok-compra.html';				
	}
	var _contagem_redirecionar = function(){
		var count = 30;
		countdown = setInterval(function(){
			$('#textRedirect').html('Em '+ count + ' segundos você será redirecionado para página principal.');
			if(count == 0){
				window.location = '/';
			}
			count--;
		}, 1000);
	}
	return {
		init:_init,
		pagamento: _pagamento,
		finalizar_pedido: _finalizar_pedido,
		remove_item: _remove_item,
		carrega_cartoes: _carrega_cartoes,
		valida_finalizar: _valida_finalizar
	}
}();