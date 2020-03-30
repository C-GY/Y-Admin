tinymce.PluginManager.add('indent2em', function(editor, url) {
    var pluginName='首行缩进';
    var global$1 = tinymce.util.Tools.resolve('tinymce.util.Tools');
    var indent2em_val = editor.getParam('indent2em_val', '2em');
    var doAct = function () {
        var dom = editor.dom;
        var blocks = editor.selection.getSelectedBlocks();
        var act = '';
        global$1.each(blocks, function (block) {
            if(act==''){
                act = dom.getStyle(block,'text-indent')==indent2em_val ? 'remove' : 'add';
            }
            if( act=='add' ){
                dom.setStyle(block, 'text-indent', indent2em_val);
            }else{
                var style=dom.getAttrib(block,'style');
                style = style.replace(/text-indent:[\s]*2em;/ig,'');
                dom.setAttrib(block,'style',style);
            }

        });
    };
    
    editor.ui.registry.addButton('indent2em', {
        text: '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M170.666667 563.2v-102.4H887.466667v102.4zM170.666667 836.266667v-102.4H887.466667v102.4zM512 290.133333v-102.4H887.466667v102.4zM238.933333 341.333333V136.533333l204.8 102.4z" fill="#2c2c2c" p-id="5210"></path></svg>',
        tooltip: pluginName,
        onAction: function () {
            doAct();
        }
    });

    editor.ui.registry.addMenuItem('indent2em', {
        text: pluginName,
        onAction: function() {
            doAct();
        }
    });

    return {
        getMetadata: function () {
            return  {
                name: pluginName,
                url: "http://tinymce.ax-z.cn/more-plugins/indent2em.php",
            };
        }
    };
});
