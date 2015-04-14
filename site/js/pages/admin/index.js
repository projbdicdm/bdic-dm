function _submitLogin(){
	 $.ajax({
            type: 'POST',
            dataType: 'json',
            data: jQuery.parseJSON($("form").serialize()),
            url: 'login/',
            success: function (data) {
                if(data == true)
					window.location = 'dashboard.html'
				else
				{
					$('#notificacao').html(data);
					$('#notificacao').show();
				}
            }
        });
}
