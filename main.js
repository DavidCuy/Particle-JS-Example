var Application = {
    html: {
        Login: "#login",
        DeviceSection: "#deviceSection",
        DeleteTokenBtn: "#deleteTokenBtn",
        Datalog: "#dataLog",
        DatalogSection: "#dataLogSection",
        ListTokens: "#tokens",
        FormUserInput: "input[name='user']",
        FormPassInput: "input[name='password']",
        FormTokenInput: "input[name='token']",
        FormSubmit: "input[type='submit']",
        SelectDevices: "select[name='devices']"
    },
    particle: new Particle(),
    Token: "",
    Event: "wattBeeData",
    LogItem: function(rawData){
        return "<li class='list-group-item particle-event-item'>"
                + "publicado: " + rawData.published_at + "<br>"
                + "rawData: " + rawData.data
                "</li>"
    },
    ParticleLogin: function(e, form){
        var user = $(form).find(Application.html.FormUserInput).val();
        var pwd = $(form).find(Application.html.FormPassInput).val();

        Application.particle.login({username: user, password: pwd}).then(
            function(data){
                Application.Token = data.body.access_token;
                Application.ParticleGetDevices();
                $(Application.html.DeviceSection).css('display', 'block');
                $(Application.html.DeleteTokenBtn).prop('disabled', false);
                $(form).find(Application.html.FormSubmit).prop('disabled', true);
                console.log('API call completed on promise resolve: ', Application.Token);
            },
            function(err) {
                console.log('API call completed on promise fail: ', err);
            }
        );

        e.preventDefault();
    },
    ParticleGetDevices: function(){
        var devicesPr = Application.particle.listDevices({ auth: Application.Token });
        devicesPr.then(
        function(devices){
            console.log('Devices: ', devices);
            $(Application.html.SelectDevices).empty();
            $(devices.body).each(function(index, device){
                $("<option>", {
                    text: device.name,
                    value: device.id
                }).appendTo(Application.html.SelectDevices);
            });
        },
        function(err) {
            console.log('List devices call failed: ', err);
        }
        );
    },
    ParticleLogOut: function(btn){
        var form = $(btn).parent();
        var user = $(form).find(Application.html.FormUserInput).val();
        var pwd = $(form).find(Application.html.FormPassInput).val();

        Application.ParticleDeleteToken(user, pwd, Application.Token);
    },
    ParticleListTokens: function(btn){
        var form = $(btn).parent();
        var user = $(form).find(Application.html.FormUserInput).val();
        var pwd = $(form).find(Application.html.FormPassInput).val();

        Application.particle.listAccessTokens({ username: user, password: pwd }).then(function(data) {
            console.log('data on listing access tokens: ', data);
            $(Application.html.ListTokens).empty();
            $(data.body).each(function(index, token){
                var li = $("<li>", {
                    class: "list-group-item",
                    text: "Token: " + token.token + " *** Expira: " + token.expires_at + " *** Cliente: " + token.client
                }).appendTo(Application.html.ListTokens);

                $("<span>", {
                    class: "badge",
                    text: (index + 1)
                }).appendTo(li);
            });
        }, function(err) {
            console.log('error on listing access tokens: ', err);
        });
    },
    ParticleEventsLog: function(device){
        $(Application.html.DatalogSection).css('display', 'block');
        Application.particle.getEventStream({ deviceId: device, name: Application.Event, auth: Application.Token }).then(function(stream) {
            stream.on('event', function(data) {
                console.log("Event: ", data);
                $(Application.html.Datalog).append(Application.LogItem(data));
            });
        });
    },
    AppDeleteToken: function(e, btn){
        var form = $(Application.html.Login);
        var user = $(form).find(Application.html.FormUserInput).val();
        var pwd = $(form).find(Application.html.FormPassInput).val();

        form = $(btn).parent();
        var token = $(form).find(Application.html.FormTokenInput).val();

        Application.ParticleDeleteToken(user, pwd, token);

        e.preventDefault();
    },
    ParticleDeleteToken: function(user, pwd, token){
        Application.particle.removeAccessToken({ username: user, password: pwd, token: token }).then(function(data) {
            console.log('data on deleting accessToken: ', data);
            $(Application.html.DeviceSection).css('display', 'none');
            $(Application.html.DeleteTokenBtn).prop('disabled', true);
        }, function(err) {
            console.log('error on deleting accessToken: ', err);
        });
    }
};