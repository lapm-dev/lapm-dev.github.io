(function() {
    'use strict';

    var ShikimoriPlugin = {
        component: 'shikimori',
        name: 'Shikimori',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

        init: function() {
            Lampa.Template.add('settings_' + this.component, this.getTemplate());

            Lampa.Component.add(this.component, this);

            this.addSettings();
            this.addMenuButton();

            Lampa.Listener.follow('app', function(e) {
                if (e.type == 'ready') {
                    // Any additional initialization if needed
                }
            });
        },

        getTemplate: function() {
            return "<div>\n" +
                "<div class=\"settings-param selector\" data-name=\"shikimori_client_id\" data-type=\"input\" placeholder=\"#{filmix_param_placeholder}\">\n" +
                "<div class=\"settings-param__name\">Shikimori Client ID</div>\n" +
                "<div class=\"settings-param__value\"></div>\n" +
                "</div>\n" +
                "\n" +
                "<div class=\"settings-param selector\" data-name=\"shikimori_client_secret\" data-type=\"input\" placeholder=\"#{filmix_param_placeholder}\">\n" +
                "<div class=\"settings-param__name\">Shikimori Client Secret</div>\n" +
                "<div class=\"settings-param__value\"></div>\n" +
                "</div>\n" +
                "\n" +
                "<div class=\"settings-param selector\" data-name=\"shikimori_auth\" data-static=\"true\">\n" +
                "<div class=\"settings-param__name\">#{shikimori_auth_add_descr}</div>\n" +
                "</div>\n" +
                "</div>";
        },

        addSettings: function() {
            if (Lampa.Settings.main && Lampa.Settings.main().render) {
                var field = $("<div class='settings-folder selector' data-component='" + this.component + "'><div class='settings-folder__icon'>" + this.icon + "</div><div class='settings-folder__name'>" + this.name + "</div></div>");
                Lampa.Settings.main().render().find('[data-component="more"]').after(field);
            }
            
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name == 'main') {
                    e.body.find('[data-component="' + ShikimoriPlugin.component + '"]').on('hover:enter', function () {
                        ShikimoriPlugin.settings();
                    });
                }
            });
        },

        settings: function () {
            var ico = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            var params = {
                name: this.component,
                icon: ico
            };

            Lampa.Settings.create(params);

            var conf = {
                shikimori_client_id: '',
                shikimori_client_secret: '',
            };

            var html = Lampa.Template.get('settings_' + this.component, {});
            var body = $(html);

            for (var i in conf) {
                var param = body.find('[data-name="' + i + '"]');
                param.find('.settings-param__value').text(Lampa.Storage.get(i, ''));
            }

            body.find('[data-name="shikimori_auth"]').on('hover:enter', this.authorize);

            body.on('hover:enter', '.selector', function () {
                var name = $(this).data('name');
                if (name) {
                    var type = $(this).data('type');
                    if (type == 'input') {
                        Lampa.Input.edit({
                            value: Lampa.Storage.get(name, ''),
                            title: $(this).find('.settings-param__name').text(),
                            free: true,
                            nosave: true
                        }, function (new_value) {
                            Lampa.Storage.set(name, new_value);
                            body.find('[data-name="' + name + '"] .settings-param__value').text(new_value);
                        });
                    }
                }
            });

            Lampa.Settings.body(body);
        },

        addMenuButton: function() {
            var button = $("<li class=\"menu__item selector\">\n" +
                "<div class=\"menu__ico\">"+ this.icon +"</div>\n" +
                "<div class=\"menu__text\">"+ this.name +"</div>\n" +
            "</li>");
            
            button.on('hover:enter', function() {
                Lampa.Activity.push({
                    url: '',
                    title: 'Shikimori',
                    component: 'shikimori',
                    page: 1
                });
            });

            $('.menu .menu__list').eq(0).append(button);
        },

        authorize: function() {
            var clientId = Lampa.Storage.get('shikimori_client_id');
            var clientSecret = Lampa.Storage.get('shikimori_client_secret');

            if (!clientId || !clientSecret) {
                Lampa.Noty.show(Lampa.Lang.translate('shikimori_nodevice'));
                return;
            }

            var authUrl = 'https://shikimori.one/oauth/authorize' +
                '?client_id=' + clientId +
                '&redirect_uri=urn:ietf:wg:oauth:2.0:oob' +
                '&response_type=code' +
                '&scope=user_rates+comments+topics';

            Lampa.Noty.show('Please open this URL to authorize: ' + authUrl);
        },

        // Добавьте остальные методы компонента здесь (start, pause, stop, render и т.д.)
    };

    Lampa.Lang.add({
        shikimori_nodevice: {
            ru: 'Введите Client ID и Client Secret в настройках Shikimori',
            en: 'Enter Client ID and Client Secret in Shikimori settings'
        },
        shikimori_auth_success: {
            ru: 'Авторизация в Shikimori успешна',
            en: 'Shikimori authorization successful'
        },
        shikimori_auth_error: {
            ru: 'Ошибка авторизации в Shikimori',
            en: 'Shikimori authorization error'
        },
        shikimori_auth_add_descr: {
            ru: 'Добавить устройство в Shikimori',
            en: 'Add device to Shikimori'
        }
    });

    Lampa.Manifest.plugins['shikimori'] = {
        type: 'video',
        version: '1.0',
        name: 'Shikimori',
        description: 'Plugin for Shikimori integration',
        component: 'shikimori'
    };

    ShikimoriPlugin.init();
})();
