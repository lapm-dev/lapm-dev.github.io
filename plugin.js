(function() {
    'use strict';

    function showInitializationPopup() {
        // Create a simple modal using Lampa's components
        var modal = $('<div class="modal modal--dropdown modal--init-message"></div>');
        var message = $('<div class="modal__content">Shikimori plugin successfully initialized!</div>');
        var closer = $('<div class="modal__closer"></div>');

        modal.append(message);
        modal.append(closer);

        // Add some basic styling
        $('body').append(Lampa.Template.get('shikimori_init_style'));

        // Add the modal to the body
        $('body').append(modal);

        // Show the modal with a fade effect
        setTimeout(function() {
            modal.addClass('modal--full');
        }, 100);

        // Close on click anywhere
        modal.on('click', function() {
            modal.removeClass('modal--full');
            setTimeout(function() {
                modal.remove();
            }, 300); // Matches the CSS transition time
        });
    }

    Lampa.Template.add('shikimori_init_style', `
        <style>
        .modal--init-message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            background-color: rgba(0, 0, 0, 0.8);
            border-radius: 5px;
            padding: 20px;
            color: white;
            font-size: 1.2em;
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .modal--full {
            opacity: 1;
        }
        .modal__content {
            margin-bottom: 10px;
        }
        .modal__closer {
            cursor: pointer;
            padding: 5px;
        }
        .modal__closer:after {
            content: '×';
            font-size: 1.5em;
        }
        </style>
    `);

    function startPlugin() {
        window.plugin_shikimori_ready = true;
        
        Lampa.Manifest.plugins['shikimori'] = {
            type: "video",
            version: "1.0.0",
            name: "Shikimori",
            description: "Anime catalog",
            component: 'shikimori',
        };

        // Show the initialization popup
        showInitializationPopup();
    }

    if (!window.plugin_shikimori_ready) startPlugin();

})();
