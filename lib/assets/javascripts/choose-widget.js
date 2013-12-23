/**
 * =====================================================================================
 * choose-widget.js v-1.0.0
 * @author: skhajan
 * @date: 16/12/13
 * @time: 11:41 AM
 * Copyright 2013
 * Description : This plugin render list items into a widget, which takes html as input
 *      and renders new html having source div, menu div and popup section.
 * Example (1):
 *      <ul class="items">
 *          <li value="1"> Item 1 </li>
 *          <li value="2"> Item 2 </li>
 *          <li value="3"> Item 3 </li>
 *          <li value="4"> Item 4 </li>
 *          <li value="5"> Item 5 </li>
 *      </ul>
 *     It replaces following html with the new html as ,
 *     <div class="choose-widget">
 *         <div class="choose-items">
 *             <a href="#"><i class="icon-plus"></i></a>
 *             <div class="chosen-items">
 *                 <ul class="items"></ul>
 *             </div>
 *         </div>
 *         <div class="choose-menu">
 *             <a><i class="icon-chevron-left></i></a>
 *             <a><i class="icon-chevron-left></i></a>
 *             <a><i class="icon-chevron-left></i></a>
 *        </div>
 *        <div class="choose-popup">
 *           <ul class="items">
 *              <li value="1"> Item 1 </li>
 *              <li value="2"> Item 2 </li>
 *              <li value="3"> Item 3 </li>
 *              <li value="4"> Item 4 </li>
 *              <li value="5"> Item 5 </li>
 *          </ul>
 *       </div>
 *     </div>
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ===================================================================================
 **/

(function($){
    $.fn.choose = function(settings){
        return this.each(function(){
            var plugin = new $.choose(this, settings);
            $(this).data('choose', plugin);
        });
    };

    $.choose = function(el, options){
        this.settings = {
            conditionalLoad: false,
            conditionalKey: null,
            containerNode: 'ul.items',
            parentNode: $(el.parentElement),
            before: this.before,
            after: this.after
        };
        this.extend(this.settings, options || {});
        this.init(el);
        return this;
    };

    $.choose.fn = $.choose.prototype;
    $.choose.fn.extend = $.choose.extend = $.extend;
    $.choose.fn.extend({
        boxHtml: '<div class="choose-items"><a class="add-item"><i class="icon-plus"></i></a>' +
            '<div class="chosen-items"></div></div>',
        menuHtml: '<div class="choose-menu"><a class="add"><i class="icon-chevron-left"></i></a>' +
            '<a class="remove"><i class="icon-chevron-right"></i></a>' +
            '<a class="done"><i class="icon-ok"></i></a></div>',
        popupHtml: '<div class="choose-popup"></div>',
        wrapper: $('<ul class="items"></ul>'),
        init: function(element){
            var $element = $(element)
            console.log('Initializing choose widget');
            var $parent = $(this.settings['parentNode']);
            $parent.addClass('choose-widget');
            $(this.boxHtml).appendTo($parent);
            $(this.menuHtml).appendTo($parent);
            $(this.popupHtml).appendTo($parent);
            if(this.settings['conditionalLoad'] && this.settings['conditionalKey']){
                this.initialItems = $element.children().detach();
            }
            $element.appendTo($('div.choose-popup', $parent));
            $('div.choose-popup').find('input[type=hidden]').attr('disabled', true);
            if($element.prop('tagName') != 'ul' && !$element.hasClass('items')){
                var _first = $element.children().first().clone();
                $(this.settings.containerNode, _first).children().detach();
                this.wrapper = _first;
            }
            var $clone_el = $element.clone().empty();
            $clone_el.attr('id', $clone_el.attr('id')+'_copy');
            $('div.chosen-items', $parent).append($clone_el);
            this.element = $parent;
            this.buttons = $('.choose-menu>a', $parent);
            this.bindEvents();
            this.addNodes();
            this.hideMenuAndPopup();
        },
        bindEvents: function(){
            var _this = this
            var element = this.element;
            $('.choose-items>a.add-item', element).bind('click', function(){
                _this.showMenuAndPopup()
            });
            $(this.buttons[0]).bind('click', function(){_this.addNodes()});
            $(this.buttons[1]).bind('click', function(){_this.removeNodes()});
            $(this.buttons[2]).bind('click', function(){_this.hideMenuAndPopup()});
            return this.bindLiEvents()
        },
        bindLiEvents: function(){
            $('ul.items>li', this.element).bind('dblclick', function(){
                $(this).parent().children().removeClass('selected');
                $(this).toggleClass('selected');
            }).bind('click', function(event){
                    if(event.ctrlKey){
                        $(this).toggleClass('selected')
                    }else{
                        $(this).parent().children().removeClass('selected');
                    }
                });
        },
        addNodes: function(){
            var _this = this
            $('div.chosen-items').find('li.selected').removeClass('selected');
            var _selected = $('div.choose-popup', this.element).find('li.selected');
            _selected.each(function(){
                var _selector = _this.wrapper.prop('tagName').toLowerCase();
                var _class = _this.wrapper.attr('class');
                if(_class){ _selector+='.'+_class.replace(/\ /, '.');}
                var $wrapper = $(this).parents(_selector).clone();
                if($wrapper.attr('id')){
                    _selector = '#'+$wrapper.attr('id')+'_copy';
                }
                var $container = $(_selector, $('div.chosen-items',_this.element));
                if ($container.length){
                    if($container.css('display') == 'none'){$container.css('display', 'block')}
                    var $ul = $(_this.settings['containerNode'], $container).
                        andSelf(_this.settings['containerNode']).append($(this).detach());
                    $('span.count', $container).text($ul.children().length);
                    $('input[type=hidden]', $container).removeAttr('disabled')
                }else{
                    var $ul = $wrapper.find('ul.items').andSelf('ul.items')
                    $ul.empty();
                    $wrapper.find('*').andSelf().each(function(){
                        if(this.type !== 'hidden' && this.id){
                            var newId = this.id+'_copy';
                            var $ref = $wrapper.find('a[href=#'+this.id+']');
                            if($ref.length){
                                $ref.attr('href',$ref.attr('href').replace(this.id, newId))
                                $ref.attr('data-parent', '#'+$('div.chosen-items>:first').attr('id'));
                            }
                            this.id = newId;
                        }
                    });
                    $ul.append($(this).detach());
                    $('span.count', $wrapper).text($ul.children().length);
                    $wrapper.appendTo($('div.chosen-items>:first-child'));
                    $('input[type=hidden]', $wrapper).removeAttr('disabled')
                }
                var $el = $(_selector, $('div.chosen-items',_this.element));
                var length = $el.find('ul.items').andSelf('ul.items').children().length
                $('span.count', $el).text(length);
                if(!length){$el.css('display', 'none')}
            });
        },
        removeNodes: function(){
            var _this = this
            $('div.chosen-popup').find('li.selected').removeClass('selected');
            var _selected = $('div.choose-items', this.element).find('li.selected');
            _selected.each(function(){
                var _selector = _this.wrapper.prop('tagName').toLowerCase();
                var _class = _this.wrapper.attr('class');
                if(_class){ _selector+='.'+_class.replace(/\ /, '.');}
                var $wrapper = $(this).parents(_selector).clone();
                if($wrapper.attr('id')){
                    _selector = '#'+$wrapper.attr('id');
                }
                var $container = $(_selector.replace('_copy',''), $('div.choose-popup', _this.element));
                if($container.css('display') == 'none'){$container.css('display', 'block')}
                var $ul = $(_this.settings['containerNode'], $container).
                    andSelf(_this.settings['containerNode']).append($(this).detach());
                $('span.count', $container).text($ul.children().length);
                $('input[type=hidden]', $container).attr('disabled', true);
                var $el = $(_selector, $('div.chosen-items', this.element));
                var length = $el.find('ul.items').andSelf('ul.items').children().length
                $('span.count', $el).text(length);
                if(!length){$el.css('display', 'none')}
            });
        },
        showMenuAndPopup: function(){
            $('.choose-menu.show, .choose-popup.show').removeClass('show').addClass('hide')
            $('.choose-menu.hide, .choose-popup.hide', this.element).removeClass('hide').addClass('show');
        },
        hideMenuAndPopup: function(){
            $('.choose-menu, .choose-popup', this.element).removeClass('show').addClass('hide');
        },
        filterItems: function(values){
            var _this = this;
            var items = this.initialItems.filter(function(index, item){

                return values.indexOf($(item).attr(_this.settings['conditionalKey'])) >= 0
            });
            var $parent = $('div.choose-popup>:first-child', this.element);
            $parent.empty();
            $('ul.items', $('div.choose-items', this.element)).empty();
            $parent.append(items);
        },
        before: function(){},
        after: function(){}
    });
})($)