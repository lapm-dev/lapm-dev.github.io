(function(){
    'use strict';

    var ShikimoriPlugin = {
        init: function() {
            this.addSettings();
            this.addMenuButton();
        },
        
        addSettings: function() {
            Lampa.Settings.insert({
                component: 'shikimori',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                name: 'Shikimori'
            });

            Lampa.Settings.append('shikimori', {
                type: 'static',
                title: 'Shikimori Client ID',
                name: 'shikimori_client_id'
            });

            Lampa.Settings.append('shikimori', {
                type: 'static',
                title: 'Shikimori Client Secret',
                name: 'shikimori_client_secret'
            });

            Lampa.Settings.append('shikimori', {
                type: 'button',
                title: 'Авторизоваться в Shikimori',
                name: 'shikimori_auth',
                onRender: function(item) {
                    item.on('hover:enter', function() {
                        ShikimoriPlugin.authorize();
                    });
                }
            });

            Lampa.Settings.listener.follow('open', function(e) {
                if (e.name == 'shikimori') {
                    var clientId = Lampa.Storage.get('shikimori_client_id');
                    var clientSecret = Lampa.Storage.get('shikimori_client_secret');
                    
                    Lampa.Settings.find('shikimori_client_id').children[0].innerHTML = clientId || '';
                    Lampa.Settings.find('shikimori_client_secret').children[0].innerHTML = clientSecret || '';
                }
            });
        },

        addMenuButton: function() {
            Lampa.Menu.append({
                id: 'shikimori',
                title: 'Shikimori',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                onClick: function() {
                    Lampa.Settings.open('shikimori');
                }
            });
        },

        authorize: function() {
            var client_id = Lampa.Storage.get('shikimori_client_id');
            if (!client_id) {
                Lampa.Noty.show('Пожалуйста, введите Client ID в настройках Shikimori');
                return;
            }

            var redirectUri = 'https://lampa.mx/shikimori-oauth';
            var authUrl = 'https://shikimori.one/oauth/authorize' +
                '?client_id=' + encodeURIComponent(client_id) +
                '&redirect_uri=' + encodeURIComponent(redirectUri) +
                '&response_type=code' +
                '&scope=user_rates';

            if (window.cordova) {
                var ref = cordova.InAppBrowser.open(authUrl, '_blank', 'location=yes');
                ref.addEventListener('loadstart', function(event) {
                    if (event.url.indexOf(redirectUri) === 0) {
                        ref.close();
                        var code = ShikimoriPlugin.getParameterByName('code', event.url);
                        if (code) {
                            ShikimoriPlugin.getToken(code);
                        }
                    }
                });
            } else {
                window.open(authUrl, '_blank');
            }
        },

        getParameterByName: function(name, url) {
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        },

        getToken: function(code) {
            var client_id = Lampa.Storage.get('shikimori_client_id');
            var client_secret = Lampa.Storage.get('shikimori_client_secret');
            
            if (!client_id || !client_secret) {
                Lampa.Noty.show('Пожалуйста, введите Client ID и Client Secret в настройках Shikimori');
                return;
            }

            $.ajax({
                url: 'https://shikimori.one/oauth/token',
                method: 'POST',
                data: {
                    grant_type: 'authorization_code',
                    client_id: client_id,
                    client_secret: client_secret,
                    code: code,
                    redirect_uri: 'https://lampa.mx/shikimori-oauth'
                },
                success: function(response) {
                    Lampa.Storage.set('shikimori_token', response.access_token);
                    Lampa.Storage.set('shikimori_refresh_token', response.refresh_token);
                    Lampa.Noty.show('Авторизация в Shikimori успешна');
                },
                error: function(xhr, status, error) {
                    console.error('Ошибка получения токена:', error);
                    Lampa.Noty.show('Ошибка авторизации в Shikimori');
                }
            });
        },

        start: function() {
            // Запуск плагина
        }
    };

    ShikimoriPlugin.init();
})();
