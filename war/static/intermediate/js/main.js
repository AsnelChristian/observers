var user=ko.observable();YUI({classNamePrefix:"pure"}).use("gallery-sm-menu",function(a){a=new a.Menu({container:"#horizontal-menu",sourceNode:"#std-menu-items",orientation:"horizontal",hideOnOutsideClick:!1,hideOnClick:!1});a.render();a.show()});function getUser(){$.get("/api/users").done(function(a){user(a)}).error(function(){user(null)})}function userLogout(){console.log("Logging out!");gapi.auth.signOut()}function disconnect(){$.get("api/disconnect",function(a){console.log(a)})}
function signinCallback(a){a.code?$.get("api/oauth2callback",{code:a.code,state:a.state},function(a){user(a)}):a.error&&(console.log("Sign-in state: "+a.error),"user_signed_out"==a.error&&(topicSummary.user(null),$.get("api/logout",function(){user(null)})))}
function render(){gapi.signin.render("signinButton",{callback:"signinCallback",accesstype:"offline",redirecturi:"postmessage",clientid:"907117162790.apps.googleusercontent.com",cookiepolicy:"single_host_origin",scope:"https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.me"})}
function getRequestParameters(){for(var a={},d=window.location.search.substring(1).split("&"),c=0;c<d.length;c++){var b=d[c].split("=");"undefined"===typeof a[b[0]]?a[b[0]]=b[1]:"string"===typeof a[b[0]]?a[b[0]]=[a[b[0]],b[1]]:a[b[0]].push(b[1])}return a};
