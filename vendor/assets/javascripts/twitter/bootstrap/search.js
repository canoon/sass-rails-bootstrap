/* =============================================================
 * bootstrap-typeaheadsearch.js v2.0.1
 * http://twitter.github.com/bootstrap/javascript.html#typeaheadsearch
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */

!function( $ ){

  "use strict"

  var Typeaheadtypeaheadsearch = function ( element, options ) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.typeaheadsearch.defaults, options)
    this.matcher = this.options.matcher || this.matcher
    this.sorter = this.options.sorter || this.sorter
    this.highlighter = this.options.highlighter || this.highlighter
    this.$menu = $(this.options.menu).appendTo('body')
    this.source = this.options.source
    this.shown = false
    this.listen()
  }

  Typeaheadtypeaheadsearch.prototype = {

    constructor: Typeaheadtypeaheadsearch

  , select: function () {
      var id = this.$menu.find('.active').attr('data-value')
      var val = $.grep(this.source, function (item) {
         if (item.id == id) return item
        })[0];
      this.$element.val(val.name);
      this.hide()
      if (this.options.directUrl) {
        var form = this.$element.closest("form")
        if (id) {
          form.attr("method", "get")
          form.attr("action", this.options.directUrl + id)
          setTimeout(function() {
            form.submit();
          }, 1);
        } else {
          form.submit()
        }
      }
      return this.hide()
    }

  , show: function () {
      var pos = $.extend({}, this.$element.offset(), {
        height: this.$element[0].offsetHeight
      })

      this.$menu.css({
        top: pos.top + pos.height
      , left: pos.left
      })

      this.$menu.show()
      this.shown = true
      return this
    }

  , hide: function () {
      this.$menu.hide()
      this.shown = false
      return this
    }

  , lookup: function (event) {
      var that = this
        , items
        , q

      this.query = this.$element.val()

      if (!this.query) {
        return this.shown ? this.hide() : this
      }

      items = $.grep(this.source, function (item) {
        if (that.matcher(item.name)) return item
      })

      items = this.sorter(items)

      if (!items.length) {
        return this.shown ? this.hide() : this
      }

      return this.render(items.slice(0, this.options.items)).show()
    }

  , matcher: function (name) {
      return ~name.toLowerCase().indexOf(this.query.toLowerCase())
    }

  , sorter: function (items) {
      var beginswith = []
        , caseSensitive = []
        , caseInsensitive = []
        , item

      while (item = items.shift()) {
        if (!item.name.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
        else if (~item.name.indexOf(this.query)) caseSensitive.push(item)
        else caseInsensitive.push(item)
      }

      return beginswith.concat(caseSensitive, caseInsensitive)
    }

  , highlighter: function (name) {
      return name.replace(new RegExp('(' + this.query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>'
      })
    }

  , render: function (items) {
      var that = this

      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', item.id)
        i.find('a').html(that.highlighter(item.name))
        return i[0]
      })

      this.$menu.html(items)
      return this
    }

  , next: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , next = active.next()

      if (!active.length) {
        next = $(this.$menu.find('li')[0])
      }

      next.addClass('active')
    }

  , prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , prev = active.prev()

      if (!active.length) {
        prev = this.$menu.find('li').last()
      }

      prev.addClass('active')
    }

  , listen: function () {
      this.$element
        .on('blur',     $.proxy(this.blur, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this))

      if ($.browser.webkit || $.browser.msie) {
        this.$element.on('keydown', $.proxy(this.keypress, this))
      }

      this.$menu
        .on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
    }

  , keyup: function (e) {
      e.stopPropagation()
      e.preventDefault()

      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
          break

        case 9: // tab
        case 13: // enter
          if (!this.shown) return
          this.select()
          break

        case 27: // escape
          this.hide()
          break

        default:
          this.lookup()
      }

  }

  , keypress: function (e) {
      e.stopPropagation()
      if (!this.shown) return

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          e.preventDefault()
          break

        case 38: // up arrow
          e.preventDefault()
          this.prev()
          break

        case 40: // down arrow
          e.preventDefault()
          this.next()
          break
      }
    }

  , blur: function (e) {
      var that = this
      e.stopPropagation()
      e.preventDefault()
      setTimeout(function () { that.hide() }, 150)
    }

  , click: function (e) {
      e.stopPropagation()
      e.preventDefault()
      this.select()
    }

  , mouseenter: function (e) {
      this.$menu.find('.active').removeClass('active')
      $(e.currentTarget).addClass('active')
    }

  }


  /* TYPEAHEADSEARCH PLUGIN DEFINITION
   * =========================== */

  $.fn.typeaheadsearch = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeaheadsearch')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeaheadsearch', (data = new Typeaheadtypeaheadsearch(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.typeaheadsearch.defaults = {
    source: []
  , items: 8
  , menu: '<ul class="typeaheadsearch dropdown-menu"></ul>'
  , item: '<li><a href="#"></a></li>'
  }

  $.fn.typeaheadsearch.Constructor = Typeaheadtypeaheadsearch


 /* TYPEAHEADSEARCH DATA-API
  * ================== */

  $(function () {
    $('body').on('focus.typeaheadsearch.data-api', '[data-provide="typeaheadsearch"]', function (e) {
      var $this = $(this)
      if ($this.data('typeaheadsearch')) return
      e.preventDefault()
      $this.typeaheadsearch($this.data())
    })
  })

}( window.jQuery );
