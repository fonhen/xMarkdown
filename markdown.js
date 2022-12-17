;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) : global.xMarkdown = factory()
}(this, (function() {
    'use strict';

    const N = '\n';
    const T = '\t';

    var xMarkdown = {
        version: '1.0'
    };

    xMarkdown.action = {
        bold: {
            action(code){
                this.insert(code , '**{0}**' , code === '' ? -2 : 0);
            },
            key: 'Ctrl-B'
        },
        italic: {
            action(code){
                this.insert(code , '*{0}*' , code === '' ? -1 : 0);
            },
            key: 'Ctrl-I'
        },
        link: {
            action(code){
                this.insert(code , '[{0}]()' , -1);
            },
            key: 'Ctrl-K'
        },
        image: {
            action(code){
                this.insert(code , '![]({0})');
            },
            key: 'Ctrl-Alt-I'
        },
        list: {
            action(code){
                var li = code.split(N);
                var len = li.length;
                if(len === 1){
                    this.insert('- ');
                }else{
                    for(var i=0; i<len; i++){
                        if(li[i].indexOf('- ') === 0){
                            li[i] = li[i].substr(2);
                        }else{
                            li[i] = li[i].trim() ? '- '+li[i] : '';
                        }
                    }
                    this.insert(li.join(N));
                }
            },
            key: 'Ctrl-L'
        },
        underline: {
            action(code){
                this.insert(code , '~~{0}~~' , code === '' ? -2 : 0);
            },
            key: 'Ctrl-U'
        },
        code: {
            action(code){
                this.insert(code , '`{0}`' , code === '' ? -1 : 0);
            },
            key: null
        },
        codeblock: {
            action(code){
                this.insert(code , N+'```'+N+'{0}'+N+'```'+N , code === '' ? -5 : 0);
            },
            key: 'Ctrl-Alt-C'
        },
        table: {
            action(){
                this.insert('| th | th |'+N+'| --- | --- |'+N+'| td | td |');
            },
            key: 'Ctrl-Alt-T'
        },
        header: {
            action(code , i){
                i = ~~i;
                i = i > 0 && i<7 ? i : 1;
                this.insert(code , ('#').repeat(i) + ' {0}');
            },
            key: 'Ctrl-H'
        },
        quote: {
            action(code){
                this.insert(code , '> {0}');
            },
            key: 'Ctrl-Q'
        },
    }

    xMarkdown.create = (el) => {
        var that = {};
        el = typeof el === 'string' ? document.querySelector(el) : el;
        if(null !== el && typeof el === 'object' && el.nodeType === 1 && el.nodeName === 'TEXTAREA'){
            that.el = el;
        }else{
            console.error('No textarea element found');
            return that;
        }

        that.insert = function(code , template , offset){
            code = template ? template.replace('{0}' , code) : code;
            this.el.setRangeText(code ,  this.el.selectionStart , this.el.selectionEnd , 'end');
            this.el.selectionEnd += ~~offset;
        }

        that.selectionText = function(){
            return this.el.value.substring(this.el.selectionStart , this.el.selectionEnd);
        }

        that.focus = function(){
            this.el.focus();
        }

        that.action = function(name , code , args){
            if(name in xMarkdown.action){
                xMarkdown.action[name].action.call(this , code , args);
                this.focus();
            }
        }

        that.blur = function(){
            this.el.blur();
        }

        that.enable = function(value){
            that.el.disabled = !!value;
        }

        that.cursor = function(){
            var value = this.el.value.split(N);
            var lines = [];
            var i = 1;
            var start = 0;
            var end = 0;
            var cursor = {
                start: this.el.selectionStart,
                end: this.el.selectionEnd
            };
            var line = 0;
            value.forEach(function(v){
                start = end;
                end += v.length + 1;
                if( cursor.start >= start && cursor.end <= end ){
                    line = i-1;
                }
                lines.push({
                    value: v + N,
                    len: v.length,
                    start,
                    end
                });
                i++;
            });
            cursor.text = lines[line].value;
            cursor.lines = lines;
            cursor.line = line;
            return cursor;
        }

        that.value = function(value){
            if(typeof value === 'string'){
                this.el.value = value;
            }else{
                return this.el.value;
            }
        }

        that.el.addEventListener('keydown' , function(e){

            if(e.keyCode === 9){
                e.preventDefault();
                var text = that.selectionText();
                var temp = text.split(N);
                var len = temp.length;
                for(var i=0; i<len; i++){
                    if(!e.shiftKey){
                        temp[i] = T + temp[i];
                    }else{
                        temp[i] = temp[i].replace(/(^\t+)|(^(\-|\*) )/ , function(ms){
                            return ms.substr(ms.indexOf('-') === 0 || ms.indexOf('* ') === 0 ? 2 : 1);
                        });
                    }
                }
                text = temp.join(N);
                that.el.setRangeText(text ,  that.el.selectionStart , that.el.selectionEnd , len > 1 ? 'select' : 'end');
            }else if(e.keyCode === 13){
                if(e.shiftKey){
                    return;
                }
                var cursor = that.cursor();
                var ms = cursor.text.match(/^((\t*)((\-|\*) )*)/);
                if(ms[0] !== ''){
                    setTimeout(function(){
                        that.insert(ms[0]);
                    } , 1);
                }
            }

            // 绑定快捷键
            for(let obj of Object.values(xMarkdown.action)){
                if(!obj.key){
                    continue;
                }

                let ks = obj.key.split('-');
                if(e.key.toUpperCase() !== ks.at(-1)){
                    continue;
                }

                if(ks.indexOf('Ctrl') !== -1 && !e.ctrlKey ){
                    continue;
                }

                if(ks.indexOf('Alt') !== -1 && !e.altKey ){
                    continue;
                }

                if(ks.indexOf('Shift') !== -1 && !e.shiftKey ){
                    continue;
                }

                obj.action.call(that , that.selectionText());
                that.focus();

                e.preventDefault();
            }
        });

        return that;
    }


    return xMarkdown;


})));