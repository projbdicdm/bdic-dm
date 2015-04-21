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
        console.log("Success: " + JSON.stringify(data));
        alert("Success: " + JSON.stringify(data));
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("Error: " + errorThrown);
        alert("Error: " + errorThrown);
    }).always(function() {
        console.log("Done!");
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
        console.log("Success: " + JSON.stringify(data));
        alert("Success: " + JSON.stringify(data));
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("Error: " + errorThrown);
        alert("Error: " + errorThrown);
    }).always(function() {
        console.log("Done!");
    });
};

function api_user_changepassword(form){
    
    if(form.find("#password01").val() != form.find("#password02").val()) {
        alert("Senha inválida!");
        return;
    }

    currentData = new Object();
    currentData.password = form.find("#email").val();

    $.ajax({
        url: '/api/user/resetpassword',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(currentData)
    }).done(function(data, textStatus, jqXHR) {
        console.log("Success: " + JSON.stringify(data));
        alert("Success: " + JSON.stringify(data));
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("Error: " + errorThrown);
        alert("Error: " + errorThrown);
    }).always(function() {
        console.log("Done!");
    });
};






