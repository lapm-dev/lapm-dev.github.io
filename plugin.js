(function() {
    'use strict';

    var ShikimoriPlugin = {
        component: 'shikimori',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C6.75329 21.5 2.5 17.2467 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z" stroke="currentColor" stroke-width="2"/><path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

        init: function() {
            console.log('ShikimoriPlugin init');
            Lampa.Component.add('shikimori', this.component);

            this.addMenuButton();
            this.addSettings();

            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') {
                    // Any additional initialization after app is ready
                }
            });
        },

        addSettings: function() {
            console.log('Adding Shikimori settings');
            var settings = [
                {
                    name: 'shikimori_client_id',
                    type: 'input',
                    default: '',
                    placeholder: 'Shikimori Client ID'
                },
                {
                    name: 'shikimori_client_secret',
                    type: 'input',
                    default: '',
                    placeholder: 'Shikimori Client Secret'
                }
            ];

            Lampa.Settings.add({
                title: 'Shikimori',
                component: 'shikimori',
                fields: settings,
                onSave: this.onSave.bind(this)
            });
        },

        onSave: function(saved) {
            Lampa.Storage.set('shikimori_client_id', saved.shikimori_client_id);
            Lampa.Storage.set('shikimori_client_secret', saved.shikimori_client_secret);
            console.log('Settings saved:', saved);
        },

        addMenuButton: function() {
            console.log('Adding Shikimori menu button');
            var menu_item = $('<li class="menu__item selector" data-action="shikimori"><div class="menu__ico">' + this.icon + '</div><div class="menu__text">Shikimori</div></li>');
            menu_item.on('hover:enter', this.showSettings.bind(this));
            $('.menu .menu__list').eq(0).append(menu_item);
        },

        showSettings: function() {
            console.log('Showing Shikimori settings');
            Lampa.Settings.open('shikimori');
        },

        component: function() {
            var html = $('<div></div>');
            this.render = function() {
                return html;
            };
            this.destroy = function() {
                html.remove();
            };
        }
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

    window.plugin_shikimori_ready = true;
    ShikimoriPlugin.init();
})();
