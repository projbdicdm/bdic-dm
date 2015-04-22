$(document).ready(function(){
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal-trigger').leanModal();
});

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
        if(data.userType == "admin")
            location.href = "http://localhost:8899/indexadmin.html";
        else
            location.href = "http://localhost:8899/indexclient.html";
    }).fail(function(jqXHR, textStatus, errorThrown) {
        $('#modal-user-login-fail').openModal();
    });
};

function api_user_resetpassword(form){

    currentData = new Object();
    currentData.login = form.find("#email").val();

    $.ajax({
        url: '/api/user/resetpassword',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(currentData)
    }).done(function(data, textStatus, jqXHR) {
        $('#modal-user-resetpassword-success').openModal();
    }).fail(function(jqXHR, textStatus, errorThrown) {
        $('#modal-user-resetpassword-fail').openModal();
    });
};

function api_user_changepassword(form){
    alert("Tela sem implementação");
};






